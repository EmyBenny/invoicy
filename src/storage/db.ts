import { Customer, Receipt, BusinessProfile, ProductPreset } from '../types';

const STORAGE_KEYS = {
  RECEIPTS: 'invoicy_receipts_v1',
  CUSTOMERS: 'invoicy_customers_v1',
  PROFILE: 'invoicy_profile_v1',
  PRESETS: 'invoicy_presets_v1',
  SETTINGS: 'invoicy_settings_v1',
};

export const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
  name: 'Apex Solutions & Supply Co.',
  tagline: 'Quality Commercial Services & Equipment',
  phone: '+1 (555) 234-8900',
  email: 'billing@apexsolutions.com',
  address: '148 Commerce Boulevard, Suite 300, Chicago, IL 60601',
  website: 'www.apexsolutions.com',
  taxNumber: 'US-TAX-8924103',
  currencySymbol: '$',
  currencyCode: 'USD',
  defaultTaxRate: 8.5,
  paymentInstructions: 'ACH Transfer: Chase Bank #98234812 | Routing: 071000033. Venmo/Zelle: pay@apexsolutions.com',
  footerNote: 'Thank you for your business! Payment is due within 15 days of issue.',
  theme: 'light',
};

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Metropolitan Logistics Inc.',
    phone: '+1 (312) 555-0144',
    email: 'accounts@metrologistics.com',
    address: '420 South Canal St, Chicago, IL 60607',
    taxNumber: 'US-EIN-4492019',
    notes: 'Key commercial account. Billed NET 15.',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'cust-2',
    name: 'Edison Artisan Roasters',
    phone: '+1 (312) 555-0289',
    email: 'orders@edisoncoffee.com',
    address: '891 N Milwaukee Ave, Chicago, IL 60642',
    taxNumber: 'IL-ST-881290',
    notes: 'Weekly maintenance & supply orders.',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'cust-3',
    name: 'Horizon Health Clinic',
    phone: '+1 (312) 555-0731',
    email: 'finance@horizonhealth.org',
    address: '1200 W Harrison St, Chicago, IL 60607',
    taxNumber: 'US-EIN-7729103',
    notes: 'Quarterly compliance and equipment verification.',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'cust-4',
    name: 'Kensington Creative Agency',
    phone: '+1 (312) 555-0918',
    email: 'ops@kensingtoncreative.io',
    address: '330 N Wabash Ave, Chicago, IL 60611',
    taxNumber: 'US-EIN-9923841',
    notes: 'Walk-in & on-demand service customer.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

export const INITIAL_PRODUCT_PRESETS: ProductPreset[] = [
  { id: 'prod-cake-1', name: 'Red Velvet with Ice Cream', category: 'Dessert Menu', unitPrice: 2500, unit: 'portion' },
  { id: 'prod-cake-2', name: 'Dark Forest with Ice Cream', category: 'Dessert Menu', unitPrice: 2500, unit: 'portion' },
  { id: 'prod-cake-3', name: 'White Forest with Ice Cream', category: 'Dessert Menu', unitPrice: 2500, unit: 'portion' },
  { id: 'prod-cake-4', name: 'Waffles with Ice Cream', category: 'Dessert Menu', unitPrice: 2000, unit: 'portion' },
  { id: 'prod-1', name: 'Commercial Equipment Inspection', category: 'Services', unitPrice: 245.00, unit: 'visit' },
  { id: 'prod-2', name: 'Standard Maintenance Package', category: 'Services', unitPrice: 380.00, unit: 'service' },
  { id: 'prod-3', name: 'Industrial Filter Cartridge (Grade A)', category: 'Parts', unitPrice: 65.50, unit: 'pc' },
  { id: 'prod-4', name: 'Hydraulic Seal Replacement Kit', category: 'Parts', unitPrice: 115.00, unit: 'kit' },
  { id: 'prod-5', name: 'System Diagnostics & Calibration', category: 'Services', unitPrice: 175.00, unit: 'hour' },
];

export const INITIAL_RECEIPTS: Receipt[] = [
  {
    id: 'rec-richys-1',
    receiptNumber: 'DOC-20261012-WA0000',
    customerId: 'cust-richys',
    customerName: 'Victoria & Obinna Wedding Reception',
    customerPhone: '08035551290',
    customerEmail: 'victoria.events@gmail.com',
    customerAddress: 'Grand Emerald Ballroom, Agbor, Delta State',
    createdAt: new Date('2026-10-12T10:22:00').toISOString(),
    eventDate: '2026-10-30',
    dueDate: '2026-10-28',
    packageTitle: 'DESSERT MENU — DIAMOND PACKAGE',
    items: [
      { id: 'item-d1', name: 'Red Velvet with Ice Cream', quantity: 38, unitPrice: 2500, total: 95000 },
      { id: 'item-d2', name: 'Dark Forest with Ice Cream', quantity: 38, unitPrice: 2500, total: 95000 },
      { id: 'item-d3', name: 'White Forest with Ice Cream', quantity: 28, unitPrice: 2500, total: 70000 },
      { id: 'item-d4', name: 'Waffles with Ice Cream', quantity: 28, unitPrice: 2000, total: 56000 },
    ],
    subtotal: 316000,
    taxRate: 0,
    taxAmount: 0,
    discountType: 'fixed',
    discountValue: 16000,
    discountAmount: 16000,
    grandTotal: 300000,
    amountPaid: 200000,
    balanceDue: 100000,
    paymentStatus: 'PARTIAL',
    paymentMethod: 'BANK_TRANSFER',
    notes: '70% Advance booking deposit paid via GTBank transfer. Balance of ₦100,000 due 48 hours prior to event set-up.',
    receiptType: 'INVOICE',
  },
  {
    id: 'rec-1',
    receiptNumber: 'REC-2026-0041',
    customerId: 'cust-1',
    customerName: 'Metropolitan Logistics Inc.',
    customerPhone: '+1 (312) 555-0144',
    customerEmail: 'accounts@metrologistics.com',
    customerAddress: '420 South Canal St, Chicago, IL 60607',
    createdAt: new Date().toISOString(), // Today!
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    items: [
      { id: 'item-1', name: 'Commercial Equipment Inspection', quantity: 2, unitPrice: 245.00, total: 490.00 },
      { id: 'item-2', name: 'Industrial Filter Cartridge (Grade A)', quantity: 4, unitPrice: 65.50, total: 262.00 },
    ],
    subtotal: 752.00,
    taxRate: 8.5,
    taxAmount: 63.92,
    discountType: 'fixed',
    discountValue: 50.00,
    discountAmount: 50.00,
    grandTotal: 765.92,
    amountPaid: 765.92,
    balanceDue: 0.00,
    paymentStatus: 'PAID',
    paymentMethod: 'CARD',
    notes: 'Paid at counter with Corporate Visa. Thanks for choosing Apex!',
    receiptType: 'RECEIPT',
  },
  {
    id: 'rec-2',
    receiptNumber: 'REC-2026-0040',
    customerId: 'cust-2',
    customerName: 'Edison Artisan Roasters',
    customerPhone: '+1 (312) 555-0289',
    customerEmail: 'orders@edisoncoffee.com',
    customerAddress: '891 N Milwaukee Ave, Chicago, IL 60642',
    createdAt: new Date().toISOString(), // Today!
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    items: [
      { id: 'item-3', name: 'Standard Maintenance Package', quantity: 1, unitPrice: 380.00, total: 380.00 },
      { id: 'item-4', name: 'System Diagnostics & Calibration', quantity: 2, unitPrice: 175.00, total: 350.00 },
    ],
    subtotal: 730.00,
    taxRate: 8.5,
    taxAmount: 62.05,
    discountType: 'percentage',
    discountValue: 0,
    discountAmount: 0,
    grandTotal: 792.05,
    amountPaid: 400.00,
    balanceDue: 392.05,
    paymentStatus: 'PARTIAL',
    paymentMethod: 'BANK_TRANSFER',
    notes: 'Deposit received. Balance due upon technician sign-off next Monday.',
    receiptType: 'INVOICE',
  },
  {
    id: 'rec-3',
    receiptNumber: 'REC-2026-0039',
    customerId: 'cust-3',
    customerName: 'Horizon Health Clinic',
    customerPhone: '+1 (312) 555-0731',
    customerEmail: 'finance@horizonhealth.org',
    customerAddress: '1200 W Harrison St, Chicago, IL 60607',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), // Yesterday
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    items: [
      { id: 'item-5', name: 'High-Capacity Valve Assembly', quantity: 1, unitPrice: 420.00, total: 420.00 },
      { id: 'item-6', name: 'Hydraulic Seal Replacement Kit', quantity: 2, unitPrice: 115.00, total: 230.00 },
    ],
    subtotal: 650.00,
    taxRate: 8.5,
    taxAmount: 55.25,
    discountType: 'fixed',
    discountValue: 25.00,
    discountAmount: 25.00,
    grandTotal: 680.25,
    amountPaid: 0.00,
    balanceDue: 680.25,
    paymentStatus: 'UNPAID',
    paymentMethod: 'BANK_TRANSFER',
    notes: 'Quarterly supply replenishment. Sent to finance dept.',
    receiptType: 'INVOICE',
  },
  {
    id: 'rec-4',
    receiptNumber: 'REC-2026-0038',
    customerId: 'cust-4',
    customerName: 'Kensington Creative Agency',
    customerPhone: '+1 (312) 555-0918',
    customerEmail: 'ops@kensingtoncreative.io',
    customerAddress: '330 N Wabash Ave, Chicago, IL 60611',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    dueDate: new Date(Date.now() - 3 * 86400000).toISOString(),
    items: [
      { id: 'item-7', name: 'Emergency Dispatch Fee', quantity: 1, unitPrice: 150.00, total: 150.00 },
      { id: 'item-8', name: 'System Diagnostics & Calibration', quantity: 1, unitPrice: 175.00, total: 175.00 },
    ],
    subtotal: 325.00,
    taxRate: 8.5,
    taxAmount: 27.63,
    discountType: 'fixed',
    discountValue: 0,
    discountAmount: 0,
    grandTotal: 352.63,
    amountPaid: 352.63,
    balanceDue: 0.00,
    paymentStatus: 'PAID',
    paymentMethod: 'POS',
    notes: 'POS Tap payment authorized.',
    receiptType: 'RECEIPT',
  },
];

export type StorageSyncHook = {
  syncReceipt?: (receipt: Receipt) => void;
  deleteReceipt?: (receiptId: string) => void;
  syncCustomer?: (customer: Customer) => void;
  deleteCustomer?: (customerId: string) => void;
  syncProfile?: (profile: BusinessProfile) => void;
};

let activeSyncHook: StorageSyncHook | null = null;

export function setStorageSyncHook(hook: StorageSyncHook | null) {
  activeSyncHook = hook;
}

export class StorageService {
  static getProfile(): BusinessProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return DEFAULT_BUSINESS_PROFILE;
  }

  static saveProfile(profile: BusinessProfile): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    activeSyncHook?.syncProfile?.(profile);
  }

  static getCustomers(): Customer[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    this.saveCustomers(INITIAL_CUSTOMERS);
    return INITIAL_CUSTOMERS;
  }

  static saveCustomers(customers: Customer[]): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }

  static addCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Customer {
    const customers = this.getCustomers();
    const newCustomer: Customer = {
      ...customer,
      id: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    customers.unshift(newCustomer);
    this.saveCustomers(customers);
    activeSyncHook?.syncCustomer?.(newCustomer);
    return newCustomer;
  }

  static updateCustomer(updated: Customer): void {
    const customers = this.getCustomers().map(c => (c.id === updated.id ? updated : c));
    this.saveCustomers(customers);
    activeSyncHook?.syncCustomer?.(updated);
  }

  static deleteCustomer(id: string): void {
    const customers = this.getCustomers().filter(c => c.id !== id);
    this.saveCustomers(customers);
    activeSyncHook?.deleteCustomer?.(id);
  }

  static getReceipts(): Receipt[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    this.saveReceipts(INITIAL_RECEIPTS);
    return INITIAL_RECEIPTS;
  }

  static saveReceipts(receipts: Receipt[]): void {
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(receipts));
  }

  static addReceipt(receiptData: Omit<Receipt, 'id'>): Receipt {
    const receipts = this.getReceipts();
    const newReceipt: Receipt = {
      ...receiptData,
      id: `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    receipts.unshift(newReceipt);
    this.saveReceipts(receipts);
    activeSyncHook?.syncReceipt?.(newReceipt);
    return newReceipt;
  }

  static updateReceipt(updated: Receipt): void {
    const receipts = this.getReceipts().map(r => (r.id === updated.id ? updated : r));
    this.saveReceipts(receipts);
    activeSyncHook?.syncReceipt?.(updated);
  }

  static deleteReceipt(id: string): void {
    const receipts = this.getReceipts().filter(r => r.id !== id);
    this.saveReceipts(receipts);
    activeSyncHook?.deleteReceipt?.(id);
  }

  static getNextReceiptNumber(): string {
    const receipts = this.getReceipts();
    const year = new Date().getFullYear();
    const count = receipts.length + 1;
    const padded = String(count + 41).padStart(4, '0');
    return `REC-${year}-${padded}`;
  }

  static getPresets(): ProductPreset[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRESETS);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return INITIAL_PRODUCT_PRESETS;
  }

  static resetToSampleData(): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_BUSINESS_PROFILE));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(INITIAL_RECEIPTS));
    localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(INITIAL_PRODUCT_PRESETS));
  }
}
