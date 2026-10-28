/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Customer, Receipt, BusinessProfile, ProductPreset, CloudSyncState } from './types';
import { StorageService } from './storage/db';
import { CloudSync } from './firebase/syncService';
import { AndroidFrame } from './components/AndroidFrame';
import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar, NavTab } from './components/BottomNavBar';
import { DashboardScreen } from './components/DashboardScreen';
import { CreateReceiptScreen } from './components/CreateReceiptScreen';
import { OrdersScreen } from './components/OrdersScreen';
import { CustomersScreen } from './components/CustomersScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { ReceiptDetailModal } from './components/ReceiptDetailModal';
import { CustomerModal } from './components/CustomerModal';
import { AndroidCodeModal } from './components/AndroidCodeModal';
import { Plus, Check, RefreshCw } from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Persistence State
  const [profile, setProfile] = useState<BusinessProfile>(() => StorageService.getProfile());
  const [receipts, setReceipts] = useState<Receipt[]>(() => StorageService.getReceipts());
  const [customers, setCustomers] = useState<Customer[]>(() => StorageService.getCustomers());
  const [presets, setPresets] = useState<ProductPreset[]>(() => StorageService.getPresets());

  // Cloud Sync State
  const [syncState, setSyncState] = useState<CloudSyncState>(() => CloudSync.getState());

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = StorageService.getProfile().theme;
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Modal & Selection States
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  // Transient Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync theme with DOM
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Subscribe to CloudSync real-time state and database updates
  useEffect(() => {
    const unsubState = CloudSync.subscribeState((newState) => {
      setSyncState(newState);
    });
    const unsubData = CloudSync.subscribeDataChanges(() => {
      handleRefreshAll();
    });
    return () => {
      unsubState();
      unsubData();
    };
  }, []);

  const handleToggleTheme = () => {
    const nextTheme: 'light' | 'dark' = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    const updatedProfile: BusinessProfile = { ...profile, theme: nextTheme };
    setProfile(updatedProfile);
    StorageService.saveProfile(updatedProfile);
  };

  const handleRefreshAll = () => {
    setProfile(StorageService.getProfile());
    setReceipts(StorageService.getReceipts());
    setCustomers(StorageService.getCustomers());
    setPresets(StorageService.getPresets());
  };

  // Receipt Handlers
  const handleReceiptSaved = (saved: Receipt) => {
    const updatedReceipts = StorageService.getReceipts();
    setReceipts(updatedReceipts);
    setEditingReceipt(null);
    setSelectedReceipt(saved); // Open preview modal immediately!
    showToast(`Receipt ${saved.receiptNumber} saved successfully`);
  };

  const handleDeleteReceipt = (receiptId: string) => {
    StorageService.deleteReceipt(receiptId);
    setReceipts(StorageService.getReceipts());
    setSelectedReceipt(null);
    showToast('Receipt deleted');
  };

  const handleMarkReceiptPaid = (receiptId: string) => {
    const receipt = receipts.find(r => r.id === receiptId);
    if (!receipt) return;
    const updated: Receipt = {
      ...receipt,
      paymentStatus: 'PAID',
      amountPaid: receipt.grandTotal,
      balanceDue: 0,
    };
    StorageService.updateReceipt(updated);
    setReceipts(StorageService.getReceipts());
    setSelectedReceipt(updated);
    showToast(`Receipt ${receipt.receiptNumber} marked as Fully Paid`);
  };

  const handleEditReceipt = (receipt: Receipt) => {
    setSelectedReceipt(null);
    setEditingReceipt(receipt);
    setActiveTab('create');
  };

  // Customer Handlers
  const handleSaveCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    if (editingCustomer) {
      const updated: Customer = {
        ...customerData,
        id: editingCustomer.id,
        createdAt: editingCustomer.createdAt,
      };
      StorageService.updateCustomer(updated);
      showToast(`Customer ${updated.name} updated`);
    } else {
      const created = StorageService.addCustomer(customerData);
      showToast(`Customer ${created.name} added`);
    }
    setCustomers(StorageService.getCustomers());
    setIsCustomerModalOpen(false);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = (id: string) => {
    StorageService.deleteCustomer(id);
    setCustomers(StorageService.getCustomers());
    showToast('Customer deleted');
  };

  const handleCreateReceiptForCustomer = (customer: Customer) => {
    setEditingReceipt({
      id: '',
      receiptNumber: StorageService.getNextReceiptNumber(),
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      customerAddress: customer.address,
      createdAt: new Date().toISOString(),
      items: [{ id: '1', name: '', quantity: 1, unitPrice: 0, total: 0 }],
      subtotal: 0,
      taxRate: profile.defaultTaxRate || 0,
      taxAmount: 0,
      discountType: 'percentage',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 0,
      amountPaid: 0,
      balanceDue: 0,
      paymentStatus: 'PAID',
      paymentMethod: 'CASH',
      receiptType: 'RECEIPT',
    });
    setActiveTab('create');
  };

  // Profile Handlers
  const handleSaveProfile = (newProfile: BusinessProfile) => {
    StorageService.saveProfile(newProfile);
    setProfile(newProfile);
    showToast('Business profile updated');
  };

  const handleResetData = () => {
    StorageService.resetToSampleData();
    handleRefreshAll();
    showToast('Database reset to sample commercial records');
  };

  // Determine App Bar Title & Subtitle based on active tab
  const getAppBarDetails = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Invoicy',
          subtitle: profile.name,
          actions: (
            <button
              onClick={() => {
                setEditingReceipt(null);
                setActiveTab('create');
              }}
              className="p-1.5 text-[#6B1426] dark:text-[#F6E49E] hover:bg-[#FAF0F2] dark:hover:bg-[#2D0E15] rounded-full cursor-pointer"
              title="Create new receipt"
            >
              <Plus className="w-5 h-5" />
            </button>
          ),
        };
      case 'create':
        return {
          title: editingReceipt ? 'Edit Receipt' : 'Create Receipt',
          subtitle: editingReceipt ? editingReceipt.receiptNumber : 'New Invoice / Slip',
          onBack: () => {
            setEditingReceipt(null);
            setActiveTab('dashboard');
          },
        };
      case 'orders':
        return {
          title: 'All Receipts',
          subtitle: `${receipts.length} total records`,
          actions: (
            <button
              onClick={() => {
                setEditingReceipt(null);
                setActiveTab('create');
              }}
              className="p-1.5 text-[#6B1426] dark:text-[#F6E49E] hover:bg-[#FAF0F2] dark:hover:bg-[#2D0E15] rounded-full cursor-pointer"
              title="New receipt"
            >
              <Plus className="w-5 h-5" />
            </button>
          ),
        };
      case 'customers':
        return {
          title: 'Customers',
          subtitle: `${customers.length} commercial clients`,
          actions: (
            <button
              onClick={() => {
                setEditingCustomer(null);
                setIsCustomerModalOpen(true);
              }}
              className="p-1.5 text-[#6B1426] dark:text-[#F6E49E] hover:bg-[#FAF0F2] dark:hover:bg-[#2D0E15] rounded-full cursor-pointer"
              title="Add customer"
            >
              <Plus className="w-5 h-5" />
            </button>
          ),
        };
      case 'settings':
        return {
          title: 'Business Settings',
          subtitle: 'Profile, taxes & preferences',
        };
    }
  };

  const barDetails = getAppBarDetails();

  return (
    <AndroidFrame
      theme={theme}
      logoUrl={profile.logoUrl}
      syncState={syncState}
      onToggleTheme={handleToggleTheme}
      onOpenCodeViewer={() => setIsCodeModalOpen(true)}
    >
      {/* Top App Bar on child screens */}
      {activeTab !== 'dashboard' && (
        <TopAppBar
          title={barDetails.title}
          subtitle={barDetails.subtitle}
          onBack={barDetails.onBack}
          actions={barDetails.actions}
        />
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="no-print mx-4 mt-2 p-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 z-30">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Screen Routing */}
      <div className="flex-1 flex flex-col min-h-0">
        {activeTab === 'dashboard' && (
          <DashboardScreen
            receipts={receipts}
            profile={profile}
            onNavigate={(tab) => {
              if (tab === 'create') setEditingReceipt(null);
              setActiveTab(tab);
            }}
            onSelectReceipt={(receipt) => setSelectedReceipt(receipt)}
            onResetData={handleResetData}
          />
        )}

        {activeTab === 'create' && (
          <CreateReceiptScreen
            profile={profile}
            customers={customers}
            presets={presets}
            initialReceipt={editingReceipt}
            onReceiptSaved={handleReceiptSaved}
            onCancel={() => {
              setEditingReceipt(null);
              setActiveTab('dashboard');
            }}
            onOpenCustomerModal={() => {
              setEditingCustomer(null);
              setIsCustomerModalOpen(true);
            }}
            onNavigateToSettings={() => setActiveTab('settings')}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersScreen
            receipts={receipts}
            profile={profile}
            onSelectReceipt={(receipt) => setSelectedReceipt(receipt)}
            onEditReceipt={handleEditReceipt}
            onDeleteReceipt={handleDeleteReceipt}
            onCreateReceipt={() => {
              setEditingReceipt(null);
              setActiveTab('create');
            }}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersScreen
            customers={customers}
            receipts={receipts}
            profile={profile}
            onAddOrEditCustomer={(customer) => {
              setEditingCustomer(customer || null);
              setIsCustomerModalOpen(true);
            }}
            onDeleteCustomer={handleDeleteCustomer}
            onCreateReceiptForCustomer={handleCreateReceiptForCustomer}
            onSelectReceipt={(receipt) => setSelectedReceipt(receipt)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsScreen
            profile={profile}
            onSaveProfile={handleSaveProfile}
            onThemeToggle={handleToggleTheme}
            onResetData={handleResetData}
            onRefreshAllData={handleRefreshAll}
          />
        )}
      </div>
      
      {/* Spacer to prevent content from hiding behind sticky bottom bar */}
      <div className="h-16 shrink-0 no-print" />

      {/* Material 3 Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'create') setEditingReceipt(null);
          setActiveTab(tab);
        }}
      />

      {/* Receipt Detail & Preview Modal */}
      {selectedReceipt && (
        <ReceiptDetailModal
          receipt={selectedReceipt}
          profile={profile}
          onClose={() => setSelectedReceipt(null)}
          onEdit={handleEditReceipt}
          onDelete={handleDeleteReceipt}
          onMarkPaid={handleMarkReceiptPaid}
        />
      )}

      {/* Customer Add/Edit Modal */}
      {isCustomerModalOpen && (
        <CustomerModal
          customer={editingCustomer}
          onSave={handleSaveCustomer}
          onClose={() => {
            setIsCustomerModalOpen(false);
            setEditingCustomer(null);
          }}
        />
      )}

      {/* Android Kotlin & Compose Architecture Code Modal */}
      {isCodeModalOpen && (
        <AndroidCodeModal onClose={() => setIsCodeModalOpen(false)} />
      )}
    </AndroidFrame>
  );
}
