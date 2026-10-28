export type PaymentStatus = 'PAID' | 'UNPAID' | 'PARTIAL';

export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'MOBILE_PAYMENT' | 'POS' | 'OTHER';

export interface LineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  createdAt: string; // ISO string
  dueDate?: string;
  eventDate?: string;
  packageTitle?: string;
  items: LineItem[];
  subtotal: number;
  taxRate: number; // e.g. 5 for 5%
  taxAmount: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  receiptType: 'INVOICE' | 'RECEIPT' | 'BILL';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  taxNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface BusinessProfile {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  taxNumber: string; // VAT / GST / EIN
  currencySymbol: string;
  currencyCode: string;
  defaultTaxRate: number;
  paymentInstructions: string;
  footerNote: string;
  theme: 'light' | 'dark';
  logoUrl?: string;
}

export interface ProductPreset {
  id: string;
  name: string;
  category: string;
  unitPrice: number;
  unit: string;
}

export interface CloudUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type SyncStatus = 'disabled' | 'offline' | 'syncing' | 'synced' | 'error';

export interface CloudSyncState {
  enabled: boolean;
  status: SyncStatus;
  lastSyncedAt?: string;
  user: CloudUser | null;
  errorMessage?: string;
}

