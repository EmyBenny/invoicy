import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { auth, db, googleAuthProvider, handleFirestoreError, OperationType } from './config';
import { StorageService } from '../storage/db';
import { BusinessProfile, Customer, ProductPreset, Receipt, CloudSyncState, SyncStatus } from '../types';

const SYNC_ENABLED_STORAGE_KEY = 'invoicy_cloud_sync_enabled_v1';
const LAST_SYNC_STORAGE_KEY = 'invoicy_last_sync_timestamp_v1';

type StateListener = (state: CloudSyncState) => void;
type DataChangeListener = () => void;

class CloudSyncManager {
  private syncEnabled: boolean = false;
  private status: SyncStatus = 'disabled';
  private lastSyncedAt: string | undefined = undefined;
  private currentUser: User | null = null;
  private errorMessage: string | undefined = undefined;

  private stateListeners: Set<StateListener> = new Set();
  private dataChangeListeners: Set<DataChangeListener> = new Set();
  private unsubscribers: Unsubscribe[] = [];
  private isSyncing: boolean = false;

  constructor() {
    // Restore preference from local storage
    const savedSyncPref = localStorage.getItem(SYNC_ENABLED_STORAGE_KEY);
    this.syncEnabled = savedSyncPref !== null ? savedSyncPref === 'true' : true;
    this.lastSyncedAt = localStorage.getItem(LAST_SYNC_STORAGE_KEY) || undefined;

    // Listen to network status
    window.addEventListener('online', () => this.handleNetworkChange(true));
    window.addEventListener('offline', () => this.handleNetworkChange(false));

    // Listen to Firebase Auth state
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      if (user) {
        if (this.syncEnabled) {
          this.status = navigator.onLine ? 'syncing' : 'offline';
          this.notifyState();
          await this.startRealtimeSync(user.uid);
        } else {
          this.status = 'disabled';
          this.notifyState();
        }
      } else {
        this.stopRealtimeSync();
        this.status = 'disabled';
        this.notifyState();
      }
    });
  }

  // State Subscription
  public subscribeState(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    listener(this.getState());
    return () => this.stateListeners.delete(listener);
  }

  public subscribeDataChanges(listener: DataChangeListener): () => void {
    this.dataChangeListeners.add(listener);
    return () => this.dataChangeListeners.delete(listener);
  }

  public getState(): CloudSyncState {
    return {
      enabled: this.syncEnabled,
      status: this.status,
      lastSyncedAt: this.lastSyncedAt,
      user: this.currentUser
        ? {
            uid: this.currentUser.uid,
            email: this.currentUser.email,
            displayName: this.currentUser.displayName,
            photoURL: this.currentUser.photoURL,
          }
        : null,
      errorMessage: this.errorMessage,
    };
  }

  private notifyState() {
    const state = this.getState();
    this.stateListeners.forEach((l) => l(state));
  }

  private notifyDataChange() {
    this.dataChangeListeners.forEach((l) => l());
  }

  private handleNetworkChange(isOnline: boolean) {
    if (!isOnline) {
      this.status = 'offline';
      this.notifyState();
    } else if (this.currentUser && this.syncEnabled) {
      this.status = 'syncing';
      this.notifyState();
      this.syncNow();
    }
  }

  // Authentication: Sign In With Google
  public async signInWithGoogle(): Promise<User> {
    try {
      this.errorMessage = undefined;
      const result = await signInWithPopup(auth, googleAuthProvider);
      this.syncEnabled = true;
      localStorage.setItem(SYNC_ENABLED_STORAGE_KEY, 'true');
      this.notifyState();
      return result.user;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in was cancelled or failed.';
      this.errorMessage = msg;
      this.status = 'error';
      this.notifyState();
      throw err;
    }
  }

  // Authentication: Sign Out
  public async signOut(): Promise<void> {
    this.stopRealtimeSync();
    await firebaseSignOut(auth);
    this.currentUser = null;
    this.status = 'disabled';
    this.notifyState();
  }

  // Toggle Cloud Sync in Settings
  public async setSyncEnabled(enabled: boolean): Promise<void> {
    this.syncEnabled = enabled;
    localStorage.setItem(SYNC_ENABLED_STORAGE_KEY, enabled ? 'true' : 'false');

    if (enabled && this.currentUser) {
      this.status = navigator.onLine ? 'syncing' : 'offline';
      this.notifyState();
      await this.startRealtimeSync(this.currentUser.uid);
    } else {
      this.stopRealtimeSync();
      this.status = 'disabled';
      this.notifyState();
    }
  }

  // Start Realtime Firestore Listeners and Initial Local->Cloud Upload
  private async startRealtimeSync(userId: string) {
    this.stopRealtimeSync();

    if (!navigator.onLine) {
      this.status = 'offline';
      this.notifyState();
      return;
    }

    try {
      this.isSyncing = true;
      this.status = 'syncing';
      this.notifyState();

      // 1. Initial 2-Way Sync: First push local records to Firestore so nothing is lost
      await this.pushLocalToFirestore(userId);

      // 2. Attach Real-Time Listeners for Receipts
      const receiptsPath = `users/${userId}/receipts`;
      const unsubReceipts = onSnapshot(
        collection(db, receiptsPath),
        (snapshot) => {
          let updatedAny = false;
          const currentLocal = StorageService.getReceipts();
          const localMap = new Map(currentLocal.map((r) => [r.id, r]));

          snapshot.docChanges().forEach((change) => {
            const data = change.doc.data() as Receipt;
            if (change.type === 'added' || change.type === 'modified') {
              if (data && data.id) {
                localMap.set(data.id, data);
                updatedAny = true;
              }
            } else if (change.type === 'removed') {
              if (localMap.has(change.doc.id)) {
                localMap.delete(change.doc.id);
                updatedAny = true;
              }
            }
          });

          if (updatedAny) {
            StorageService.saveReceipts(Array.from(localMap.values()));
            this.notifyDataChange();
          }

          this.updateLastSynced();
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, receiptsPath);
        }
      );
      this.unsubscribers.push(unsubReceipts);

      // 3. Attach Real-Time Listeners for Customers
      const customersPath = `users/${userId}/customers`;
      const unsubCustomers = onSnapshot(
        collection(db, customersPath),
        (snapshot) => {
          let updatedAny = false;
          const currentLocal = StorageService.getCustomers();
          const localMap = new Map(currentLocal.map((c) => [c.id, c]));

          snapshot.docChanges().forEach((change) => {
            const data = change.doc.data() as Customer;
            if (change.type === 'added' || change.type === 'modified') {
              if (data && data.id) {
                localMap.set(data.id, data);
                updatedAny = true;
              }
            } else if (change.type === 'removed') {
              if (localMap.has(change.doc.id)) {
                localMap.delete(change.doc.id);
                updatedAny = true;
              }
            }
          });

          if (updatedAny) {
            StorageService.saveCustomers(Array.from(localMap.values()));
            this.notifyDataChange();
          }

          this.updateLastSynced();
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, customersPath);
        }
      );
      this.unsubscribers.push(unsubCustomers);

      // 4. Attach Real-Time Listener for Business Profile
      const profilePath = `users/${userId}/profile/business`;
      const unsubProfile = onSnapshot(
        doc(db, profilePath),
        (snapshot) => {
          if (snapshot.exists()) {
            const remoteProfile = snapshot.data() as BusinessProfile;
            StorageService.saveProfile(remoteProfile);
            this.notifyDataChange();
          }
          this.updateLastSynced();
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, profilePath);
        }
      );
      this.unsubscribers.push(unsubProfile);

      this.status = 'synced';
      this.isSyncing = false;
      this.notifyState();
    } catch (err: unknown) {
      console.error('Error during realtime sync start:', err);
      this.status = 'error';
      this.isSyncing = false;
      this.errorMessage = err instanceof Error ? err.message : 'Cloud synchronization error';
      this.notifyState();
    }
  }

  private stopRealtimeSync() {
    this.unsubscribers.forEach((unsub) => unsub());
    this.unsubscribers = [];
  }

  private updateLastSynced() {
    this.lastSyncedAt = new Date().toISOString();
    localStorage.setItem(LAST_SYNC_STORAGE_KEY, this.lastSyncedAt);
    this.status = 'synced';
    this.notifyState();
  }

  // Push all existing local Room database items to Firestore
  public async pushLocalToFirestore(userId: string): Promise<void> {
    const receipts = StorageService.getReceipts();
    const customers = StorageService.getCustomers();
    const presets = StorageService.getPresets();
    const profile = StorageService.getProfile();

    try {
      // 1. Business Profile
      const profileRef = doc(db, `users/${userId}/profile/business`);
      await setDoc(profileRef, { ...profile, updatedAt: new Date().toISOString() }, { merge: true });

      // 2. Receipts (batch writes)
      if (receipts.length > 0) {
        const batch = writeBatch(db);
        receipts.forEach((r) => {
          const rRef = doc(db, `users/${userId}/receipts/${r.id}`);
          batch.set(rRef, { ...r, userId, updatedAt: new Date().toISOString() }, { merge: true });
        });
        await batch.commit();
      }

      // 3. Customers
      if (customers.length > 0) {
        const custBatch = writeBatch(db);
        customers.forEach((c) => {
          const cRef = doc(db, `users/${userId}/customers/${c.id}`);
          custBatch.set(cRef, { ...c, userId }, { merge: true });
        });
        await custBatch.commit();
      }

      // 4. Presets
      if (presets.length > 0) {
        const presetBatch = writeBatch(db);
        presets.forEach((p) => {
          const pRef = doc(db, `users/${userId}/presets/${p.id}`);
          presetBatch.set(pRef, { ...p, userId }, { merge: true });
        });
        await presetBatch.commit();
      }

      this.updateLastSynced();
    } catch (err: unknown) {
      console.error('Failed to push local records to Firestore:', err);
      throw err;
    }
  }

  // Manual Trigger: Sync Now
  public async syncNow(): Promise<void> {
    if (!this.currentUser) return;
    if (!navigator.onLine) {
      this.status = 'offline';
      this.notifyState();
      return;
    }

    try {
      this.status = 'syncing';
      this.notifyState();
      await this.pushLocalToFirestore(this.currentUser.uid);
      this.status = 'synced';
      this.notifyState();
    } catch (err: unknown) {
      this.status = 'error';
      this.errorMessage = err instanceof Error ? err.message : 'Sync failed';
      this.notifyState();
    }
  }

  // Mutation helper for single receipt
  public async syncReceipt(receipt: Receipt): Promise<void> {
    if (!this.currentUser || !this.syncEnabled || !navigator.onLine) return;
    try {
      const receiptRef = doc(db, `users/${this.currentUser.uid}/receipts/${receipt.id}`);
      await setDoc(receiptRef, { ...receipt, userId: this.currentUser.uid, updatedAt: new Date().toISOString() }, { merge: true });
      this.updateLastSynced();
    } catch (err) {
      console.warn('Real-time receipt sync deferred (working offline):', err);
    }
  }

  // Mutation helper for receipt deletion
  public async deleteCloudReceipt(receiptId: string): Promise<void> {
    if (!this.currentUser || !this.syncEnabled || !navigator.onLine) return;
    try {
      const receiptRef = doc(db, `users/${this.currentUser.uid}/receipts/${receiptId}`);
      await deleteDoc(receiptRef);
      this.updateLastSynced();
    } catch (err) {
      console.warn('Real-time receipt deletion deferred:', err);
    }
  }

  // Mutation helper for single customer
  public async syncCustomer(customer: Customer): Promise<void> {
    if (!this.currentUser || !this.syncEnabled || !navigator.onLine) return;
    try {
      const custRef = doc(db, `users/${this.currentUser.uid}/customers/${customer.id}`);
      await setDoc(custRef, { ...customer, userId: this.currentUser.uid }, { merge: true });
      this.updateLastSynced();
    } catch (err) {
      console.warn('Real-time customer sync deferred:', err);
    }
  }

  // Mutation helper for customer deletion
  public async deleteCloudCustomer(customerId: string): Promise<void> {
    if (!this.currentUser || !this.syncEnabled || !navigator.onLine) return;
    try {
      const custRef = doc(db, `users/${this.currentUser.uid}/customers/${customerId}`);
      await deleteDoc(custRef);
      this.updateLastSynced();
    } catch (err) {
      console.warn('Real-time customer deletion deferred:', err);
    }
  }

  // Mutation helper for business profile
  public async syncProfile(profile: BusinessProfile): Promise<void> {
    if (!this.currentUser || !this.syncEnabled || !navigator.onLine) return;
    try {
      const profileRef = doc(db, `users/${this.currentUser.uid}/profile/business`);
      await setDoc(profileRef, { ...profile, updatedAt: new Date().toISOString() }, { merge: true });
      this.updateLastSynced();
    } catch (err) {
      console.warn('Real-time profile sync deferred:', err);
    }
  }
}

export const CloudSync = new CloudSyncManager();

// Automatically wire StorageService local mutations to CloudSync
import { setStorageSyncHook } from '../storage/db';
setStorageSyncHook({
  syncReceipt: (r) => CloudSync.syncReceipt(r),
  deleteReceipt: (id) => CloudSync.deleteCloudReceipt(id),
  syncCustomer: (c) => CloudSync.syncCustomer(c),
  deleteCustomer: (id) => CloudSync.deleteCloudCustomer(id),
  syncProfile: (p) => CloudSync.syncProfile(p),
});

