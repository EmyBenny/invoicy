import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  UserPlus,
  Check,
  Building2,
  ChevronDown,
  CreditCard,
  Banknote,
  Landmark,
  Smartphone,
  Receipt as ReceiptIcon,
  Percent,
  Minus,
  Sparkles,
  FileCheck2,
  Search,
  User,
  ArrowRight
} from 'lucide-react';
import { Customer, LineItem, PaymentMethod, PaymentStatus, ProductPreset, Receipt, BusinessProfile } from '../types';
import { StorageService } from '../storage/db';
import { formatCurrency } from '../utils/formatters';

interface CreateReceiptScreenProps {
  profile: BusinessProfile;
  customers: Customer[];
  presets: ProductPreset[];
  initialReceipt?: Receipt | null;
  onReceiptSaved: (savedReceipt: Receipt) => void;
  onCancel: () => void;
  onOpenCustomerModal: () => void;
  onNavigateToSettings: () => void;
}

export const CreateReceiptScreen: React.FC<CreateReceiptScreenProps> = ({
  profile,
  customers,
  presets,
  initialReceipt,
  onReceiptSaved,
  onCancel,
  onOpenCustomerModal,
  onNavigateToSettings,
}) => {
  // Receipt Header & Metadata State
  const [receiptNumber, setReceiptNumber] = useState(
    initialReceipt ? initialReceipt.receiptNumber : StorageService.getNextReceiptNumber()
  );
  const [receiptType, setReceiptType] = useState<'RECEIPT' | 'INVOICE' | 'BILL'>(
    initialReceipt?.receiptType || 'RECEIPT'
  );
  const [dateStr, setDateStr] = useState(
    initialReceipt
      ? new Date(initialReceipt.createdAt).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [eventDate, setEventDate] = useState(initialReceipt?.eventDate || '');
  const [packageTitle, setPackageTitle] = useState(initialReceipt?.packageTitle || '');

  // Customer Management: Existing vs Inline Quick Add / Walk-in
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>(
    initialReceipt?.customerId && initialReceipt.customerId !== 'walkin' ? 'existing' : 'existing'
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    initialReceipt?.customerId || ''
  );
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  // Inline Quick Add Customer Fields
  const [quickName, setQuickName] = useState(initialReceipt?.customerName || '');
  const [quickPhone, setQuickPhone] = useState(initialReceipt?.customerPhone || '');
  const [quickEmail, setQuickEmail] = useState(initialReceipt?.customerEmail || '');
  const [quickAddress, setQuickAddress] = useState(initialReceipt?.customerAddress || '');
  const [saveToContacts, setSaveToContacts] = useState(false);

  // Line Items State
  const [items, setItems] = useState<LineItem[]>(
    initialReceipt && initialReceipt.items.length > 0
      ? initialReceipt.items
      : [{ id: '1', name: '', quantity: 1, unitPrice: 0, total: 0 }]
  );

  // Tax & Discount State
  const [taxRate, setTaxRate] = useState<number>(
    initialReceipt ? initialReceipt.taxRate : profile.defaultTaxRate || 0
  );
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(
    initialReceipt?.discountType || 'percentage'
  );
  const [discountValue, setDiscountValue] = useState<number>(
    initialReceipt ? initialReceipt.discountValue : 0
  );

  // Payment Status & Method State
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    initialReceipt?.paymentStatus || 'PAID'
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initialReceipt?.paymentMethod || 'CASH'
  );
  const [amountPaidCustom, setAmountPaidCustom] = useState<number>(
    initialReceipt ? initialReceipt.amountPaid : 0
  );
  const [notes, setNotes] = useState<string>(
    initialReceipt?.notes || ''
  );

  // Validation feedback
  const [validationError, setValidationError] = useState<string | null>(null);

  // Selected customer object
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);

  let discountAmount = 0;
  if (discountType === 'percentage') {
    discountAmount = Math.round(subtotal * (discountValue / 100) * 100) / 100;
  } else {
    discountAmount = Math.min(subtotal, Math.max(0, discountValue));
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableAmount * (taxRate / 100) * 100) / 100;
  const grandTotal = Math.round((taxableAmount + taxAmount) * 100) / 100;

  // Auto-sync amount paid when status is PAID
  const effectiveAmountPaid =
    paymentStatus === 'PAID'
      ? grandTotal
      : paymentStatus === 'UNPAID'
      ? 0
      : Math.min(grandTotal, Math.max(0, amountPaidCustom));

  const balanceDue = Math.max(0, Math.round((grandTotal - effectiveAmountPaid) * 100) / 100);

  // Handlers for Items
  const handleAddItem = (preset?: ProductPreset) => {
    setValidationError(null);
    if (preset) {
      setItems(prev => [
        ...prev,
        {
          id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: preset.name,
          quantity: 1,
          unitPrice: preset.unitPrice,
          total: preset.unitPrice,
        },
      ]);
    } else {
      setItems(prev => [
        ...prev,
        {
          id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: '',
          quantity: 1,
          unitPrice: 0,
          total: 0,
        },
      ]);
    }
  };

  const handleUpdateItem = (id: string, field: keyof LineItem, val: string | number) => {
    setValidationError(null);
    setItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        if (field === 'quantity' || field === 'unitPrice') {
          const q = Number(field === 'quantity' ? val : item.quantity) || 0;
          const p = Number(field === 'unitPrice' ? val : item.unitPrice) || 0;
          updated.total = Math.round(q * p * 100) / 100;
        }
        return updated;
      })
    );
  };

  const handleQuantityAdjust = (id: string, delta: number) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const newQty = Math.max(1, (item.quantity || 1) + delta);
        return {
          ...item,
          quantity: newQty,
          total: Math.round(newQty * item.unitPrice * 100) / 100,
        };
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      setItems([{ id: '1', name: '', quantity: 1, unitPrice: 0, total: 0 }]);
      return;
    }
    setItems(prev => prev.filter(i => i.id !== id));
  };

  // Quick preset note templates
  const applyNoteTemplate = (text: string) => {
    setNotes(prev => (prev ? `${prev}\n${text}` : text));
  };

  // Form Submission
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Filter empty items
    const validItems = items.filter(i => i.name.trim() !== '');
    if (validItems.length === 0) {
      setValidationError('Please add at least one line item with a name and price.');
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    // Determine customer info
    let finalCustomerId = 'walkin';
    let finalCustomerName = 'Walk-in Customer';
    let finalCustomerPhone = '';
    let finalCustomerEmail = '';
    let finalCustomerAddress = '';

    if (customerMode === 'existing' && selectedCustomer) {
      finalCustomerId = selectedCustomer.id;
      finalCustomerName = selectedCustomer.name;
      finalCustomerPhone = selectedCustomer.phone;
      finalCustomerEmail = selectedCustomer.email;
      finalCustomerAddress = selectedCustomer.address;
    } else {
      finalCustomerName = quickName.trim() || 'Walk-in Customer';
      finalCustomerPhone = quickPhone.trim();
      finalCustomerEmail = quickEmail.trim();
      finalCustomerAddress = quickAddress.trim();

      // If user wants to save this new customer to the database
      if (saveToContacts && finalCustomerName !== 'Walk-in Customer') {
        const savedNewCustomer = StorageService.addCustomer({
          name: finalCustomerName,
          phone: finalCustomerPhone,
          email: finalCustomerEmail,
          address: finalCustomerAddress,
          notes: 'Added from receipt creation',
        });
        finalCustomerId = savedNewCustomer.id;
      }
    }

    const receiptPayload: Omit<Receipt, 'id'> = {
      receiptNumber: receiptNumber.trim() || StorageService.getNextReceiptNumber(),
      customerId: finalCustomerId,
      customerName: finalCustomerName,
      customerPhone: finalCustomerPhone || undefined,
      customerEmail: finalCustomerEmail || undefined,
      customerAddress: finalCustomerAddress || undefined,
      createdAt: new Date(dateStr).toISOString(),
      eventDate: eventDate.trim() || undefined,
      packageTitle: packageTitle.trim() || undefined,
      receiptType,
      items: validItems,
      subtotal,
      taxRate,
      taxAmount,
      discountType,
      discountValue,
      discountAmount,
      grandTotal,
      amountPaid: effectiveAmountPaid,
      balanceDue,
      paymentStatus,
      paymentMethod,
      notes: notes.trim() || undefined,
    };

    let saved: Receipt;
    if (initialReceipt) {
      saved = { ...receiptPayload, id: initialReceipt.id };
      StorageService.updateReceipt(saved);
    } else {
      saved = StorageService.addReceipt(receiptPayload);
    }

    onReceiptSaved(saved);
  };

  const filteredCustomerList = customers.filter(c => {
    const q = customerSearchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 p-3 sm:p-6 pb-28 max-w-4xl mx-auto w-full">
      <form onSubmit={handleSave} className="space-y-6">

        {/* Validation Alert */}
        {validationError && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm font-medium flex items-center justify-between shadow-xs animate-in fade-in">
            <span>{validationError}</span>
            <button
              type="button"
              onClick={() => setValidationError(null)}
              className="text-rose-500 hover:text-rose-700 text-xs font-bold px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Business Header & Document Settings Bar */}
        <div className="bg-[#FFFDF9] dark:bg-[#1E1015] rounded-2xl p-4 sm:p-5 border border-[#EBE4D5] dark:border-[#3A1921] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EBE4D5] dark:border-[#3A1921]">
            <div className="flex items-center gap-3">
              {profile.logoUrl ? (
                <div className="w-10 h-10 rounded-xl border border-[#EBE4D5] dark:border-[#3A1921] bg-[#FFFDF9] p-1 flex items-center justify-center shrink-0 shadow-2xs">
                  <img
                    src={profile.logoUrl}
                    alt={profile.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[#6B1426] text-[#F6E49E] flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-sm sm:text-base text-[#0A0A0A] dark:text-white">
                    {profile.name}
                  </h2>
                  <button
                    type="button"
                    onClick={onNavigateToSettings}
                    className="text-[11px] font-semibold text-[#6B1426] dark:text-[#F6E49E] hover:underline cursor-pointer"
                  >
                    Edit Business
                  </button>
                </div>
                <p className="text-xs text-[#57524C] dark:text-[#FAF7F2]/70">
                  {profile.address || profile.phone || 'Commercial Invoicing Profile'}
                </p>
              </div>
            </div>

            {/* Document Type Selector (Receipt vs Invoice vs Bill) */}
            <div className="flex items-center p-1 bg-[#FAF7F0] dark:bg-[#140A0D] rounded-xl text-xs font-semibold self-start sm:self-center border border-[#EBE4D5] dark:border-[#3A1921]">
              {(['RECEIPT', 'INVOICE', 'BILL'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setReceiptType(type)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    receiptType === type
                      ? 'bg-[#6B1426] text-white shadow-xs font-bold'
                      : 'text-[#57524C] dark:text-[#FAF7F2]/70 hover:text-[#0A0A0A]'
                  }`}
                >
                  {type === 'RECEIPT' ? 'Receipt' : type === 'INVOICE' ? 'Tax Invoice' : 'Simple Bill'}
                </button>
              ))}
            </div>
          </div>

          {/* Receipt Number & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Receipt / Invoice Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={receiptNumber}
                  onChange={e => setReceiptNumber(e.target.value)}
                  required
                  placeholder="e.g. REC-2026-0042"
                  className="w-full font-mono text-sm font-bold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Date & Time Issued
              </label>
              <input
                type="datetime-local"
                value={dateStr}
                onChange={e => setDateStr(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Optional Event / Catering / Package Details (Richy's Style) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/60">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center justify-between mb-1">
                <span>Event / Delivery Date</span>
                <span className="text-[10px] text-slate-400 normal-case font-normal">(Optional)</span>
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                placeholder="e.g. 2026-10-30"
                className="w-full text-xs font-medium bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center justify-between mb-1">
                <span>Package / Menu Heading</span>
                <span className="text-[10px] text-slate-400 normal-case font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={packageTitle}
                onChange={e => setPackageTitle(e.target.value)}
                placeholder="e.g. DESSERT MENU — DIAMOND PACKAGE"
                className="w-full text-xs font-medium bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* SECTION 1: CUSTOMER SELECTION & MANAGEMENT */}
        <div className="bg-[#FFFDF9] dark:bg-[#1E1015] rounded-2xl border border-[#EBE4D5] dark:border-[#3A1921] shadow-xs overflow-hidden">
          {/* Section Header */}
          <div className="p-4 sm:p-5 bg-[#FAF7F0] dark:bg-[#140A0D] border-b border-[#EBE4D5] dark:border-[#3A1921] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#6B1426] text-[#F6E49E] text-xs font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">
                  Customer Information
                </h3>
                <p className="text-xs text-[#57524C] dark:text-[#FAF7F2]/70">
                  Select an existing customer or enter walk-in details
                </p>
              </div>
            </div>

            {/* Mode Switch: Choose from Directory vs Enter New */}
            <div className="flex items-center p-1 bg-[#FFFDF9] dark:bg-[#1E1015] rounded-xl text-xs font-semibold border border-[#EBE4D5] dark:border-[#3A1921]">
              <button
                type="button"
                onClick={() => setCustomerMode('existing')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  customerMode === 'existing'
                    ? 'bg-[#6B1426] text-white font-bold shadow-xs'
                    : 'text-[#57524C] dark:text-[#FAF7F2]/70 hover:text-[#0A0A0A]'
                }`}
              >
                Existing Directory ({customers.length})
              </button>
              <button
                type="button"
                onClick={() => setCustomerMode('new')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  customerMode === 'new'
                    ? 'bg-[#6B1426] text-white font-bold shadow-xs'
                    : 'text-[#57524C] dark:text-[#FAF7F2]/70 hover:text-[#0A0A0A]'
                }`}
              >
                + New / Walk-in
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {customerMode === 'existing' ? (
              /* Existing Customer Mode */
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <select
                      value={selectedCustomerId}
                      onChange={e => setSelectedCustomerId(e.target.value)}
                      className="w-full text-xs font-medium bg-[#FAF7F0] dark:bg-[#140A0D] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl px-3.5 py-3 text-[#0A0A0A] dark:text-[#FAF7F2] appearance-none focus:ring-2 focus:ring-[#6B1426] focus:outline-none cursor-pointer"
                    >
                      <option value="">-- Choose a customer from records --</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.phone ? `(${c.phone})` : ''} {c.taxNumber ? `• Tax: ${c.taxNumber}` : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>

                  <button
                    type="button"
                    onClick={onOpenCustomerModal}
                    className="px-3.5 py-2.5 rounded-xl bg-[#FAF0F2] hover:bg-[#F6E49E]/40 text-[#6B1426] dark:bg-[#2D0E15] dark:text-[#F6E49E] border border-[#E8B6C0] dark:border-[#4E1A25] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create New Contact</span>
                  </button>
                </div>

                {/* Display Selected Customer Card */}
                {selectedCustomer ? (
                  <div className="p-4 bg-[#FAF0F2] dark:bg-[#2D0E15] rounded-xl border border-[#E8B6C0] dark:border-[#4E1A25] flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#6B1426] dark:text-[#F6E49E]" />
                        <span className="font-extrabold text-sm text-[#0A0A0A] dark:text-[#FAF7F2]">
                          {selectedCustomer.name}
                        </span>
                        {selectedCustomer.taxNumber && (
                          <span className="text-[10px] font-mono bg-[#FFFDF9] dark:bg-[#1E1015] text-[#0A0A0A] dark:text-slate-300 px-2 py-0.5 rounded border border-[#E8B6C0] dark:border-[#4E1A25]">
                            TAX ID: {selectedCustomer.taxNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#57524C] dark:text-[#FAF7F2]/80 space-y-0.5 pl-6">
                        {selectedCustomer.phone && <p>📞 Phone: {selectedCustomer.phone}</p>}
                        {selectedCustomer.email && <p>✉️ Email: {selectedCustomer.email}</p>}
                        {selectedCustomer.address && <p>📍 Address: {selectedCustomer.address}</p>}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedCustomerId('')}
                      className="text-xs font-semibold text-[#6B1426] dark:text-[#F6E49E] hover:underline self-end sm:self-start"
                    >
                      Clear / Change
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-[#FAF7F0] dark:bg-[#140A0D] rounded-xl border border-dashed border-[#EBE4D5] dark:border-[#3A1921] text-center text-xs text-[#57524C]">
                    No customer selected. Receipt will be marked as "Walk-in Customer" unless chosen above.
                  </div>
                )}
              </div>
            ) : (
              /* Inline Quick Add / Walk-in Mode */
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Customer / Business Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe or Metro Supply LLC"
                      value={quickName}
                      onChange={e => setQuickName(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={quickPhone}
                      onChange={e => setQuickPhone(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="customer@domain.com"
                      value={quickEmail}
                      onChange={e => setQuickEmail(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Billing / Physical Address
                    </label>
                    <input
                      type="text"
                      placeholder="Street, Suite, City, State"
                      value={quickAddress}
                      onChange={e => setQuickAddress(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="saveToContactsCheckbox"
                    checked={saveToContacts}
                    onChange={e => setSaveToContacts(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label
                    htmlFor="saveToContactsCheckbox"
                    className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                  >
                    Save this customer to records for future receipts & order history
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: LINE ITEMS & SERVICES */}
        {/* SECTION 2: LINE ITEMS & SERVICES */}
        <div className="bg-[#FFFDF9] dark:bg-[#1E1015] rounded-2xl border border-[#EBE4D5] dark:border-[#3A1921] shadow-xs overflow-hidden">
          {/* Section Header */}
          <div className="p-4 sm:p-5 bg-[#FAF7F0] dark:bg-[#140A0D] border-b border-[#EBE4D5] dark:border-[#3A1921] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#6B1426] text-[#F6E49E] text-xs font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">
                  Items & Services
                </h3>
                <p className="text-xs text-[#57524C] dark:text-[#FAF7F2]/70">
                  Add products, hourly work, or service items
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-[#0A0A0A] dark:text-slate-300 bg-[#FFFDF9] dark:bg-[#1E1015] px-2.5 py-1 rounded-lg border border-[#EBE4D5] dark:border-[#3A1921]">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {/* Quick Item Preset Catalog Chips */}
            {presets.length > 0 && (
              <div className="space-y-1.5 pb-2 border-b border-[#EBE4D5] dark:border-[#3A1921]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#57524C] dark:text-[#FAF7F2]/70">
                  <Sparkles className="w-3.5 h-3.5 text-[#E5C358]" />
                  <span>1-Tap Catalog Presets:</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {presets.map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleAddItem(preset)}
                      className="shrink-0 text-xs font-semibold px-3 py-1.5 bg-[#FFF9E3] hover:bg-[#F6E49E] dark:bg-[#2A2312] dark:hover:bg-[#3B3118] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl text-[#0A0A0A] dark:text-[#FAF7F2] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs group"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#6B1426] dark:text-[#F6E49E] group-hover:scale-125 transition-transform" />
                      <span>{preset.name}</span>
                      <span className="font-mono text-[#57524C] dark:text-[#FAF7F2]/60">
                        {formatCurrency(preset.unitPrice, profile.currencySymbol)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Items List */}
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 bg-[#FAF7F0] dark:bg-[#140A0D] rounded-2xl border border-[#EBE4D5] dark:border-[#3A1921] space-y-3 transition-all hover:border-[#6B1426]/30 dark:hover:border-[#F6E49E]/30"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#57524C] dark:text-[#FAF7F2]/70 uppercase tracking-wider">
                      Item #{index + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Item Description / Title */}
                  <div>
                    <label className="text-[11px] font-semibold text-[#57524C] dark:text-[#FAF7F2]/70 block mb-1">
                      Item Name or Description *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Consulting Services, Equipment Part #102..."
                      value={item.name}
                      onChange={e => handleUpdateItem(item.id, 'name', e.target.value)}
                      required
                      className="w-full text-xs font-semibold bg-[#FFFDF9] dark:bg-[#1E1015] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl px-3 py-2.5 text-[#0A0A0A] dark:text-white focus:ring-2 focus:ring-[#6B1426] focus:outline-none"
                    />
                  </div>

                  {/* Qty, Unit Price, Total Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    {/* Quantity with +/- stepper */}
                    <div>
                      <label className="text-[11px] font-semibold text-[#57524C] dark:text-[#FAF7F2]/70 block mb-1">
                        Quantity
                      </label>
                      <div className="flex items-center border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl overflow-hidden bg-[#FFFDF9] dark:bg-[#1E1015]">
                        <button
                          type="button"
                          onClick={() => handleQuantityAdjust(item.id, -1)}
                          className="px-2.5 py-2 hover:bg-[#FAF0F2] dark:hover:bg-[#2D0E15] text-[#0A0A0A] dark:text-[#FAF7F2] cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          step="any"
                          min="0.01"
                          value={item.quantity}
                          onChange={e => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          required
                          className="w-full text-center text-xs font-mono font-bold text-[#0A0A0A] dark:text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuantityAdjust(item.id, 1)}
                          className="px-2.5 py-2 hover:bg-[#FAF0F2] dark:hover:bg-[#2D0E15] text-[#0A0A0A] dark:text-[#FAF7F2] cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Unit Price */}
                    <div>
                      <label className="text-[11px] font-semibold text-[#57524C] dark:text-[#FAF7F2]/70 block mb-1">
                        Unit Price ({profile.currencySymbol})
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-mono text-[#57524C]">
                          {profile.currencySymbol}
                        </span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={item.unitPrice}
                          onChange={e => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          required
                          className="w-full text-xs font-mono font-bold bg-[#FFFDF9] dark:bg-[#1E1015] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl pl-7 pr-3 py-2 text-[#0A0A0A] dark:text-white focus:ring-2 focus:ring-[#6B1426] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Line Total */}
                    <div>
                      <label className="text-[11px] font-semibold text-[#57524C] dark:text-[#FAF7F2]/70 block mb-1">
                        Line Amount
                      </label>
                      <div className="h-9.5 flex items-center justify-end px-3.5 text-xs font-mono font-extrabold text-[#0A0A0A] dark:text-white bg-[#FAF7F0] dark:bg-[#140A0D] rounded-xl tabular-nums border border-[#EBE4D5] dark:border-[#3A1921]">
                        {formatCurrency(item.total, profile.currencySymbol)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Item Button */}
            <button
              type="button"
              onClick={() => handleAddItem()}
              className="w-full py-3 border-2 border-dashed border-[#E8B6C0] dark:border-[#4E1A25] hover:border-[#6B1426] hover:bg-[#FAF0F2] dark:hover:bg-[#2D0E15] text-[#6B1426] dark:text-[#F6E49E] rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Another Item / Service</span>
            </button>
          </div>
        </div>

        {/* SECTION 3: SUMMARY, TAX, DISCOUNTS & PAYMENT */}
        <div className="bg-[#FFFDF9] dark:bg-[#1E1015] rounded-2xl border border-[#EBE4D5] dark:border-[#3A1921] shadow-xs overflow-hidden">
          {/* Section Header */}
          <div className="p-4 sm:p-5 bg-[#FAF7F0] dark:bg-[#140A0D] border-b border-[#EBE4D5] dark:border-[#3A1921] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#6B1426] text-[#F6E49E] text-xs font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">
                  Summary & Payment
                </h3>
                <p className="text-xs text-[#57524C] dark:text-[#FAF7F2]/70">
                  Tax, discounts, payment status, and settlement details
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Calculation Grid: Discounts & Taxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Discount Input */}
              <div className="p-4 bg-[#FAF7F0] dark:bg-[#140A0D] rounded-xl border border-[#EBE4D5] dark:border-[#3A1921] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#57524C] dark:text-[#FAF7F2]/70">
                    Apply Discount
                  </label>
                  {/* Discount Type Toggle */}
                  <div className="flex items-center p-0.5 bg-[#FFFDF9] dark:bg-[#1E1015] border border-[#EBE4D5] dark:border-[#3A1921] rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setDiscountType('percentage')}
                      className={`px-2 py-0.5 rounded transition-all ${
                        discountType === 'percentage'
                          ? 'bg-[#6B1426] text-white shadow-2xs'
                          : 'text-[#57524C] dark:text-[#FAF7F2]/70'
                      }`}
                    >
                      Percent (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('fixed')}
                      className={`px-2 py-0.5 rounded transition-all ${
                        discountType === 'fixed'
                          ? 'bg-[#6B1426] text-white shadow-2xs'
                          : 'text-[#57524C] dark:text-[#FAF7F2]/70'
                      }`}
                    >
                      Fixed ({profile.currencySymbol})
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={discountValue}
                    onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full text-xs font-mono font-bold bg-[#FFFDF9] dark:bg-[#1E1015] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl px-3 py-2 text-[#0A0A0A] dark:text-white"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-[#57524C]">
                    {discountType === 'percentage' ? '%' : profile.currencySymbol}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <p className="text-[11px] text-[#6B1426] dark:text-[#F6E49E] font-semibold text-right">
                    Saves {formatCurrency(discountAmount, profile.currencySymbol)}
                  </p>
                )}
              </div>

              {/* Tax Rate Input */}
              <div className="p-4 bg-[#FAF7F0] dark:bg-[#140A0D] rounded-xl border border-[#EBE4D5] dark:border-[#3A1921] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#57524C] dark:text-[#FAF7F2]/70">
                    Tax / VAT Rate (%)
                  </label>
                  <span className="text-[11px] text-[#57524C]">
                    Default: {profile.defaultTaxRate}%
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={taxRate}
                    onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono font-bold bg-[#FFFDF9] dark:bg-[#1E1015] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl px-3 py-2 text-[#0A0A0A] dark:text-white"
                  />
                  <Percent className="w-3.5 h-3.5 text-[#57524C] absolute right-3 top-2.5 pointer-events-none" />
                </div>

                {/* Quick Tax Rate Presets */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-[#57524C] font-medium">Presets:</span>
                  {[0, 5, 8.5, 10, 15, 20].map(rate => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setTaxRate(rate)}
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded transition-colors ${
                        taxRate === rate
                          ? 'bg-[#6B1426] text-white font-bold'
                          : 'bg-[#FFFDF9] dark:bg-[#1E1015] text-[#0A0A0A] dark:text-[#FAF7F2] border border-[#EBE4D5] dark:border-[#3A1921]'
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Financial Summary Breakdown Box */}
            <div className="p-5 bg-gradient-to-br from-[#FFFDF9] to-[#FAF0F2]/50 dark:from-[#1E1015] dark:to-[#2D0E15]/30 rounded-2xl border border-[#EBE4D5] dark:border-[#3A1921] space-y-2.5">
              <div className="flex justify-between items-center text-xs text-[#57524C] dark:text-[#FAF7F2]/70">
                <span className="font-medium">Subtotal ({items.length} items):</span>
                <span className="font-mono font-semibold text-[#0A0A0A] dark:text-white tabular-nums">
                  {formatCurrency(subtotal, profile.currencySymbol)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-xs text-[#6B1426] dark:text-[#F6E49E]">
                  <span className="font-medium">
                    Discount ({discountType === 'percentage' ? `${discountValue}%` : 'Fixed'}):
                  </span>
                  <span className="font-mono font-bold tabular-nums">
                    -{formatCurrency(discountAmount, profile.currencySymbol)}
                  </span>
                </div>
              )}

              {taxAmount > 0 && (
                <div className="flex justify-between items-center text-xs text-[#57524C] dark:text-[#FAF7F2]/70">
                  <span className="font-medium">Tax / VAT ({taxRate}%):</span>
                  <span className="font-mono font-semibold text-[#0A0A0A] dark:text-white tabular-nums">
                    +{formatCurrency(taxAmount, profile.currencySymbol)}
                  </span>
                </div>
              )}

              {/* Grand Total Display */}
              <div className="flex justify-between items-center pt-3 border-t border-[#EBE4D5] dark:border-[#3A1921]">
                <div>
                  <span className="text-sm font-extrabold uppercase tracking-tight text-[#0A0A0A] dark:text-white block">
                    Grand Total
                  </span>
                  <span className="text-[11px] text-[#57524C]">
                    Net amount payable
                  </span>
                </div>

                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-[#6B1426] dark:text-[#F6E49E] tabular-nums">
                  {formatCurrency(grandTotal, profile.currencySymbol)}
                </div>
              </div>
            </div>

            {/* Payment Status (Paid, Partial, Unpaid) */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#57524C] dark:text-[#FAF7F2]/70 block">
                Settlement & Payment Status
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                {/* PAID */}
                <button
                  key="PAID"
                  type="button"
                  onClick={() => setPaymentStatus('PAID')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentStatus === 'PAID'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-101'
                      : 'bg-[#FFFDF9] dark:bg-[#1E1015] text-[#0A0A0A] dark:text-[#FAF7F2] border-[#EBE4D5] dark:border-[#3A1921] hover:bg-[#FAF0F2]'
                  }`}
                >
                  <span className="text-xs font-extrabold block">Paid</span>
                  <span className={`text-[10px] block mt-0.5 ${paymentStatus === 'PAID' ? 'text-emerald-100' : 'text-[#57524C]'}`}>
                    Fully settled
                  </span>
                </button>

                {/* PARTIAL */}
                <button
                  key="PARTIAL"
                  type="button"
                  onClick={() => setPaymentStatus('PARTIAL')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentStatus === 'PARTIAL'
                      ? 'bg-[#E5C358] text-[#0A0A0A] font-bold border-[#E5C358] shadow-md scale-101'
                      : 'bg-[#FFFDF9] dark:bg-[#1E1015] text-[#0A0A0A] dark:text-[#FAF7F2] border-[#EBE4D5] dark:border-[#3A1921] hover:bg-[#FAF0F2]'
                  }`}
                >
                  <span className="text-xs font-extrabold block">Partial</span>
                  <span className={`text-[10px] block mt-0.5 ${paymentStatus === 'PARTIAL' ? 'text-[#0A0A0A]' : 'text-[#57524C]'}`}>
                    Deposit / Part paid
                  </span>
                </button>

                {/* UNPAID */}
                <button
                  key="UNPAID"
                  type="button"
                  onClick={() => setPaymentStatus('UNPAID')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentStatus === 'UNPAID'
                      ? 'bg-[#6B1426] text-white border-[#6B1426] shadow-md scale-101'
                      : 'bg-[#FFFDF9] dark:bg-[#1E1015] text-[#0A0A0A] dark:text-[#FAF7F2] border-[#EBE4D5] dark:border-[#3A1921] hover:bg-[#FAF0F2]'
                  }`}
                >
                  <span className="text-xs font-extrabold block">Unpaid</span>
                  <span className={`text-[10px] block mt-0.5 ${paymentStatus === 'UNPAID' ? 'text-rose-100' : 'text-[#57524C]'}`}>
                    Pending payment
                  </span>
                </button>
              </div>

              {/* If Partial: Amount Received and Balance Due */}
              {paymentStatus === 'PARTIAL' && (
                <div className="p-4 bg-[#FFF9E3] dark:bg-[#2A2312] rounded-xl border border-[#F6E49E] dark:border-[#3A1921] space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#8C6D1F] dark:text-[#F6E49E]">
                      Amount Received Today ({profile.currencySymbol})
                    </label>
                    <span className="text-xs font-mono font-bold text-[#8C6D1F] dark:text-[#F6E49E]">
                      Balance Due: {formatCurrency(balanceDue, profile.currencySymbol)}
                    </span>
                  </div>

                  <input
                    type="number"
                    step="any"
                    min="0"
                    max={grandTotal}
                    value={amountPaidCustom}
                    onChange={e => setAmountPaidCustom(parseFloat(e.target.value) || 0)}
                    placeholder="Enter deposit amount"
                    className="w-full text-xs font-mono font-bold bg-[#FFFDF9] dark:bg-[#1E1015] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl px-3 py-2 text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B1426]"
                  />
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#57524C] dark:text-[#FAF7F2]/70 block">
                Payment Method
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'CASH' as PaymentMethod, label: 'Cash', icon: Banknote },
                  { id: 'CARD' as PaymentMethod, label: 'Card (Credit/Debit)', icon: CreditCard },
                  { id: 'POS' as PaymentMethod, label: 'POS Terminal', icon: ReceiptIcon },
                  { id: 'BANK_TRANSFER' as PaymentMethod, label: 'Bank Wire / ACH', icon: Landmark },
                  { id: 'MOBILE_PAYMENT' as PaymentMethod, label: 'Mobile / UPI', icon: Smartphone },
                  { id: 'OTHER' as PaymentMethod, label: 'Other', icon: FileCheck2 },
                ].map(method => {
                  const Icon = method.icon;
                  const isSelected = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FAF0F2] dark:bg-[#2D0E15] text-[#6B1426] dark:text-[#F6E49E] border-[#6B1426] ring-2 ring-[#6B1426]/20'
                          : 'bg-[#FFFDF9] dark:bg-[#1E1015] text-[#0A0A0A] dark:text-[#FAF7F2] border-[#EBE4D5] dark:border-[#3A1921] hover:bg-[#FAF0F2]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[#6B1426] dark:text-[#F6E49E]' : 'text-[#57524C]'}`} />
                      <span className="truncate">{method.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes & Terms Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#57524C] dark:text-[#FAF7F2]/70">
                  Notes & Terms
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#57524C]">Quick inserts:</span>
                  <button
                    type="button"
                    onClick={() => applyNoteTemplate('Paid in full. Thank you!')}
                    className="text-[10px] text-[#6B1426] dark:text-[#F6E49E] hover:underline"
                  >
                    + Paid in Full
                  </button>
                  <button
                    type="button"
                    onClick={() => applyNoteTemplate('Payment due within 15 days.')}
                    className="text-[10px] text-[#6B1426] dark:text-[#F6E49E] hover:underline"
                  >
                    + Net 15
                  </button>
                </div>
              </div>

              <textarea
                rows={3}
                placeholder="e.g. Warranty valid for 30 days. Thank you for your business!"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full text-xs bg-[#FAF7F0] dark:bg-[#140A0D] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl p-3 text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B1426]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: LARGE, CLEAR SAVE & ACTION BUTTON */}
        <div className="bg-[#FFFDF9] dark:bg-[#1E1015] rounded-2xl p-4 sm:p-5 border border-[#EBE4D5] dark:border-[#3A1921] shadow-md sticky bottom-2 z-20 space-y-2.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Left side: Live total summary indicator */}
            <div className="hidden sm:block">
              <span className="text-[11px] font-bold text-[#57524C] uppercase tracking-wider block">
                Ready to Issue
              </span>
              <div className="text-lg font-black font-mono text-[#0A0A0A] dark:text-white tabular-nums">
                {formatCurrency(grandTotal, profile.currencySymbol)}{' '}
                <span className="text-xs font-sans font-medium text-[#57524C]">
                  ({paymentStatus})
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-3 text-xs font-bold text-[#0A0A0A] dark:text-[#FAF7F2] bg-[#FAF7F0] hover:bg-[#FAF0F2] dark:bg-[#140A0D] dark:hover:bg-[#2D0E15] rounded-xl transition-colors cursor-pointer shrink-0 border border-[#EBE4D5] dark:border-[#3A1921]"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-1 sm:flex-initial sm:min-w-[260px] py-3.5 px-6 text-sm font-extrabold text-white bg-[#6B1426] hover:bg-[#520E1C] active:scale-98 rounded-xl shadow-lg shadow-[#6B1426]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>{initialReceipt ? 'Update Receipt' : 'Save & Generate Receipt'}</span>
                <ArrowRight className="w-4 h-4 ml-1 opacity-70 hidden sm:inline" />
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};
