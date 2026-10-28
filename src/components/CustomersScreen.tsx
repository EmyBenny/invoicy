import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Receipt as ReceiptIcon,
  ChevronRight,
  Edit2,
  Trash2,
  ArrowLeft,
  Users,
  X,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  Plus
} from 'lucide-react';
import { Customer, Receipt, BusinessProfile } from '../types';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';

interface CustomersScreenProps {
  customers: Customer[];
  receipts: Receipt[];
  profile: BusinessProfile;
  onAddOrEditCustomer: (customer?: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onCreateReceiptForCustomer: (customer: Customer) => void;
  onSelectReceipt: (receipt: Receipt) => void;
}

export const CustomersScreen: React.FC<CustomersScreenProps> = ({
  customers,
  receipts,
  profile,
  onAddOrEditCustomer,
  onDeleteCustomer,
  onCreateReceiptForCustomer,
  onSelectReceipt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerFilter, setCustomerFilter] = useState<'ALL' | 'WITH_ORDERS' | 'WITH_UNPAID'>('ALL');

  // Compute stats helper
  const getCustomerMetrics = (customerId: string) => {
    const custReceipts = receipts.filter(r => r.customerId === customerId);
    const totalSpent = custReceipts.reduce((sum, r) => sum + r.grandTotal, 0);
    const totalPaid = custReceipts.reduce((sum, r) => sum + r.amountPaid, 0);
    const unpaidBalance = custReceipts.reduce((sum, r) => sum + (r.balanceDue || 0), 0);
    return {
      receipts: custReceipts,
      orderCount: custReceipts.length,
      totalSpent,
      totalPaid,
      unpaidBalance,
    };
  };

  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q)) ||
      (c.taxNumber && c.taxNumber.toLowerCase().includes(q));

    if (!matchQuery) return false;

    if (customerFilter === 'WITH_ORDERS') {
      const metrics = getCustomerMetrics(c.id);
      return metrics.orderCount > 0;
    }

    if (customerFilter === 'WITH_UNPAID') {
      const metrics = getCustomerMetrics(c.id);
      return metrics.unpaidBalance > 0;
    }

    return true;
  });

  const activeCustomer = customers.find(c => c.id === selectedCustomerId);
  const activeMetrics = activeCustomer ? getCustomerMetrics(activeCustomer.id) : null;

  // =========================================================================
  // VIEW: SINGLE CUSTOMER DETAIL & FULL ORDER HISTORY
  // =========================================================================
  if (activeCustomer && activeMetrics) {
    return (
      <div className="flex-1 p-3 sm:p-6 pb-28 max-w-4xl mx-auto w-full space-y-5 animate-in fade-in duration-150">
        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setSelectedCustomerId(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B1426] dark:text-[#F6E49E] hover:text-[#520E1C] dark:hover:text-white transition-colors cursor-pointer bg-[#FFFDF9] dark:bg-[#1E1015] px-3 py-1.5 rounded-xl border border-[#EBE4D5] dark:border-[#3A1921] shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Customers</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddOrEditCustomer(activeCustomer)}
              className="p-2 text-[#0A0A0A] dark:text-[#FAF7F2] bg-[#FFFDF9] dark:bg-[#1E1015] hover:bg-[#FAF0F2] dark:hover:bg-[#2D0E15] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl transition-colors cursor-pointer shadow-2xs"
              title="Edit customer details"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (confirm(`Delete customer "${activeCustomer.name}"? Historical receipts will remain archived.`)) {
                  onDeleteCustomer(activeCustomer.id);
                  setSelectedCustomerId(null);
                }
              }}
              className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 bg-[#FFFDF9] dark:bg-[#1E1015] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl transition-colors cursor-pointer shadow-2xs"
              title="Delete customer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Customer Profile Card */}
        <div className="bg-[#FFFDF9] dark:bg-[#1E1015] rounded-2xl p-5 sm:p-6 border border-[#EBE4D5] dark:border-[#3A1921] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#6B1426] text-[#F6E49E] font-black text-lg flex items-center justify-center shrink-0 shadow-sm">
                {activeCustomer.name.charAt(0).toUpperCase() || 'C'}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-[#0A0A0A] dark:text-white tracking-tight">
                  {activeCustomer.name}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#57524C] dark:text-[#FAF7F2]/70 mt-0.5">
                  <span>Customer ID: {activeCustomer.id.slice(-6)}</span>
                  {activeCustomer.taxNumber && (
                    <>
                      <span>•</span>
                      <span className="font-mono font-medium text-[#0A0A0A] dark:text-slate-300">
                        Tax ID: {activeCustomer.taxNumber}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => onCreateReceiptForCustomer(activeCustomer)}
              className="px-4 py-2.5 bg-[#6B1426] hover:bg-[#520E1C] active:scale-98 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-[#6B1426]/20 transition-all cursor-pointer self-start sm:self-auto shrink-0"
            >
              <ReceiptIcon className="w-4 h-4" />
              <span>+ Create Receipt</span>
            </button>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#EBE4D5] dark:border-[#3A1921] text-xs">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F0] dark:bg-[#140A0D] border border-[#EBE4D5] dark:border-[#3A1921]">
              <Phone className="w-4 h-4 text-[#6B1426] dark:text-[#F6E49E] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#57524C] block">Phone</span>
                <p className="font-semibold text-[#0A0A0A] dark:text-white truncate">
                  {activeCustomer.phone || 'No phone recorded'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F0] dark:bg-[#140A0D] border border-[#EBE4D5] dark:border-[#3A1921]">
              <Mail className="w-4 h-4 text-[#6B1426] dark:text-[#F6E49E] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#57524C] block">Email</span>
                <p className="font-semibold text-[#0A0A0A] dark:text-white truncate">
                  {activeCustomer.email || 'No email recorded'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F0] dark:bg-[#140A0D] border border-[#EBE4D5] dark:border-[#3A1921]">
              <MapPin className="w-4 h-4 text-[#6B1426] dark:text-[#F6E49E] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#57524C] block">Address</span>
                <p className="font-semibold text-[#0A0A0A] dark:text-white truncate">
                  {activeCustomer.address || 'No address recorded'}
                </p>
              </div>
            </div>
          </div>

          {activeCustomer.notes && (
            <div className="p-3 bg-[#FAF0F2] dark:bg-[#2D0E15] rounded-xl text-xs text-[#57524C] dark:text-[#FAF7F2]/80 border border-[#E8B6C0] dark:border-[#4E1A25]">
              <span className="font-bold text-[#6B1426] dark:text-[#F6E49E] block mb-0.5">Customer Notes:</span>
              <p>{activeCustomer.notes}</p>
            </div>
          )}

          {/* Lifetime Spend & Financial Performance Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="p-3 bg-[#FAF7F0] dark:bg-[#140A0D] rounded-xl border border-[#EBE4D5] dark:border-[#3A1921]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#57524C] block">Total Volume</span>
              <p className="text-base font-extrabold font-mono text-[#0A0A0A] dark:text-white tabular-nums mt-0.5">
                {formatCurrency(activeMetrics.totalSpent, profile.currencySymbol)}
              </p>
              <span className="text-[10px] text-[#57524C]">{activeMetrics.orderCount} total orders</span>
            </div>

            <div className="p-3 bg-[#FAF7F0] dark:bg-[#140A0D] rounded-xl border border-[#EBE4D5] dark:border-[#3A1921]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">Collected Paid</span>
              <p className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                {formatCurrency(activeMetrics.totalPaid, profile.currencySymbol)}
              </p>
              <span className="text-[10px] text-[#57524C]">Settled in full</span>
            </div>

            <div className="p-3 bg-[#FAF7F0] dark:bg-[#140A0D] rounded-xl border border-[#EBE4D5] dark:border-[#3A1921]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D1F] dark:text-[#F6E49E] block">Outstanding Due</span>
              <p className="text-base font-extrabold font-mono text-[#8C6D1F] dark:text-[#F6E49E] tabular-nums mt-0.5">
                {formatCurrency(activeMetrics.unpaidBalance, profile.currencySymbol)}
              </p>
              <span className="text-[10px] text-[#57524C]">Current liability</span>
            </div>

            <div className="p-3 bg-[#FAF7F0] dark:bg-[#140A0D] rounded-xl border border-[#EBE4D5] dark:border-[#3A1921]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B1426] dark:text-[#F6E49E] block">Avg Order Value</span>
              <p className="text-base font-extrabold font-mono text-[#6B1426] dark:text-[#F6E49E] tabular-nums mt-0.5">
                {formatCurrency(activeMetrics.orderCount > 0 ? activeMetrics.totalSpent / activeMetrics.orderCount : 0, profile.currencySymbol)}
              </p>
              <span className="text-[10px] text-[#57524C]">Per receipt average</span>
            </div>
          </div>
        </div>

        {/* Customer Order History Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#57524C] dark:text-[#FAF7F2]/70">
                Complete Order History
              </h3>
              <span className="text-xs font-mono font-bold text-[#57524C]">
                ({activeMetrics.receipts.length})
              </span>
            </div>

            <button
              onClick={() => onCreateReceiptForCustomer(activeCustomer)}
              className="text-xs font-bold text-[#6B1426] dark:text-[#F6E49E] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Issue New Receipt</span>
            </button>
          </div>

          {activeMetrics.receipts.length === 0 ? (
            <div className="p-8 text-center bg-[#FFFDF9] dark:bg-[#1E1015] rounded-2xl border border-dashed border-[#EBE4D5] dark:border-[#3A1921] space-y-2">
              <ReceiptIcon className="w-8 h-8 text-[#57524C] mx-auto opacity-50" />
              <p className="text-sm font-bold text-[#0A0A0A] dark:text-white">
                No receipts recorded for this customer yet
              </p>
              <button
                onClick={() => onCreateReceiptForCustomer(activeCustomer)}
                className="mt-2 px-4 py-2 bg-[#6B1426] hover:bg-[#520E1C] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Issue First Receipt</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {activeMetrics.receipts.map(receipt => {
                const isPaid = receipt.paymentStatus === 'PAID';
                const isPartial = receipt.paymentStatus === 'PARTIAL';

                return (
                  <div
                    key={receipt.id}
                    onClick={() => onSelectReceipt(receipt)}
                    className="p-4 bg-[#FFFDF9] dark:bg-[#1E1015] rounded-2xl border border-[#EBE4D5] dark:border-[#3A1921] hover:border-[#6B1426]/50 dark:hover:border-[#F6E49E]/50 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          isPaid
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : isPartial
                            ? 'bg-[#FFF9E3] dark:bg-[#2A2312] text-[#8C6D1F] dark:text-[#F6E49E] border-[#F6E49E]'
                            : 'bg-[#FAF0F2] dark:bg-[#2D0E15] text-[#6B1426] dark:text-[#E8B6C0] border-[#E8B6C0]'
                        }`}
                      >
                        {isPaid ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : isPartial ? (
                          <Clock className="w-5 h-5" />
                        ) : (
                          <AlertCircle className="w-5 h-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#0A0A0A] dark:text-white">
                            {receipt.receiptNumber}
                          </span>
                          <span className="text-[10px] text-slate-400">·</span>
                          <span className="text-xs text-[#57524C] dark:text-[#FAF7F2]/70">
                            {formatDateTime(receipt.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-[#57524C] dark:text-[#FAF7F2]/80 truncate mt-0.5">
                          {receipt.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </p>
                        <p className="text-[11px] text-[#57524C] mt-0.5">
                          Method: {receipt.paymentMethod}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-3">
                      <div>
                        <div className="text-sm font-extrabold font-mono text-[#0A0A0A] dark:text-white tabular-nums">
                          {formatCurrency(receipt.grandTotal, profile.currencySymbol)}
                        </div>
                        <span
                          className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : isPartial
                              ? 'bg-[#FFF9E3] text-[#8C6D1F] dark:bg-[#2A2312] dark:text-[#F6E49E] border border-[#F6E49E]'
                              : 'bg-[#FAF0F2] text-[#6B1426] dark:bg-[#2D0E15] dark:text-[#E8B6C0] border border-[#E8B6C0]'
                          }`}
                        >
                          {receipt.paymentStatus}
                        </span>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#6B1426] transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: ALL CUSTOMERS DIRECTORY & SEARCH
  // =========================================================================
  return (
    <div className="flex-1 p-3 sm:p-6 pb-28 max-w-4xl mx-auto w-full space-y-4">
      {/* Top Search & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by customer name, phone, email, address..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-10 pr-9 py-3 bg-[#FFFDF9] dark:bg-[#1E1015] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B1426] shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-2.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Add Customer Button */}
        <button
          onClick={() => onAddOrEditCustomer()}
          className="px-4 py-3 bg-[#6B1426] hover:bg-[#520E1C] active:scale-98 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-[#6B1426]/20 transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5">
        <div className="flex items-center gap-1 p-1 bg-[#FAF7F0] dark:bg-[#140A0D] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl text-xs font-semibold">
          <button
            onClick={() => setCustomerFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              customerFilter === 'ALL'
                ? 'bg-[#6B1426] text-white font-bold shadow-2xs'
                : 'text-[#57524C] dark:text-[#FAF7F2]/70 hover:text-[#0A0A0A]'
            }`}
          >
            All Contacts ({customers.length})
          </button>
          <button
            onClick={() => setCustomerFilter('WITH_ORDERS')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              customerFilter === 'WITH_ORDERS'
                ? 'bg-[#6B1426] text-white font-bold shadow-2xs'
                : 'text-[#57524C] dark:text-[#FAF7F2]/70 hover:text-[#0A0A0A]'
            }`}
          >
            With Active Orders
          </button>
          <button
            onClick={() => setCustomerFilter('WITH_UNPAID')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              customerFilter === 'WITH_UNPAID'
                ? 'bg-[#6B1426] text-white font-bold shadow-2xs'
                : 'text-[#57524C] dark:text-[#FAF7F2]/70 hover:text-[#0A0A0A]'
            }`}
          >
            Has Pending Balance
          </button>
        </div>

        <span className="text-xs text-[#57524C] font-medium shrink-0">
          Showing {filteredCustomers.length} of {customers.length}
        </span>
      </div>

      {/* Customer Cards List */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-[#FFFDF9] dark:bg-[#1E1015] rounded-2xl p-10 text-center border border-dashed border-[#EBE4D5] dark:border-[#3A1921] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF0F2] dark:bg-[#2D0E15] text-[#6B1426] dark:text-[#F6E49E] mx-auto flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0A0A0A] dark:text-slate-200">
              {searchQuery ? 'No matching customers found' : 'No customers in directory yet'}
            </h3>
            <p className="text-xs text-[#57524C] dark:text-[#FAF7F2]/70 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No client matches "${searchQuery}". Check the spelling or clear the search filter.`
                : 'Add commercial clients and customer accounts to track order history, invoices, and balances.'}
            </p>
          </div>

          <div className="pt-2">
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-[#FAF7F0] hover:bg-[#FAF0F2] dark:bg-[#140A0D] text-[#0A0A0A] dark:text-slate-200 text-xs font-bold rounded-xl border border-[#EBE4D5] dark:border-[#3A1921] cursor-pointer"
              >
                Clear Search Query
              </button>
            ) : (
              <button
                onClick={() => onAddOrEditCustomer()}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6B1426] hover:bg-[#520E1C] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Your First Customer</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredCustomers.map(customer => {
            const metrics = getCustomerMetrics(customer.id);

            return (
              <div
                key={customer.id}
                onClick={() => setSelectedCustomerId(customer.id)}
                className="bg-[#FFFDF9] dark:bg-[#1E1015] rounded-2xl p-4 sm:p-5 border border-[#EBE4D5] dark:border-[#3A1921] shadow-xs hover:border-[#6B1426]/50 dark:hover:border-[#F6E49E]/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3 group"
              >
                {/* Top Row: Avatar, Name & Action Menu */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF0F2] dark:bg-[#2D0E15] text-[#6B1426] dark:text-[#F6E49E] font-extrabold text-sm flex items-center justify-center shrink-0 border border-[#E8B6C0] dark:border-[#4E1A25] group-hover:bg-[#6B1426] group-hover:text-[#F6E49E] transition-colors">
                      {customer.name.charAt(0).toUpperCase() || 'C'}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-extrabold text-[#0A0A0A] dark:text-white truncate">
                        {customer.name}
                      </h3>
                      {customer.taxNumber && (
                        <p className="text-[10px] font-mono text-[#57524C] truncate">
                          Tax ID: {customer.taxNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Count Badge */}
                  <span className="text-[11px] font-mono font-bold text-[#57524C] dark:text-slate-300 bg-[#FAF7F0] dark:bg-[#140A0D] border border-[#EBE4D5] dark:border-[#3A1921] px-2.5 py-1 rounded-lg shrink-0">
                    {metrics.orderCount} {metrics.orderCount === 1 ? 'order' : 'orders'}
                  </span>
                </div>

                {/* Middle: Phone, Email, Address */}
                <div className="space-y-1 text-xs text-[#57524C] dark:text-[#FAF7F2]/80 pt-1">
                  {customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#57524C] shrink-0" />
                      <span className="truncate">{customer.phone}</span>
                    </div>
                  )}

                  {customer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#57524C] shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}

                  {customer.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#57524C] shrink-0" />
                      <span className="truncate text-[#57524C] dark:text-[#FAF7F2]/70">{customer.address}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Row: Total Spend, Unpaid Balance & Card Controls */}
                <div className="pt-3 border-t border-[#EBE4D5] dark:border-[#3A1921] flex items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#57524C] block">
                      Total Spend
                    </span>
                    <span className="font-mono font-extrabold text-[#0A0A0A] dark:text-white tabular-nums">
                      {formatCurrency(metrics.totalSpent, profile.currencySymbol)}
                    </span>
                    {metrics.unpaidBalance > 0 && (
                      <span className="text-[10px] font-semibold text-[#8C6D1F] dark:text-[#F6E49E] block">
                        Due: {formatCurrency(metrics.unpaidBalance, profile.currencySymbol)}
                      </span>
                    )}
                  </div>

                  {/* Card Inline Actions */}
                  <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onCreateReceiptForCustomer(customer)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#FAF0F2] hover:bg-[#F6E49E]/40 text-[#6B1426] dark:bg-[#2D0E15] dark:text-[#F6E49E] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border border-[#E8B6C0]/40"
                      title="Create Receipt"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Receipt</span>
                    </button>

                    <button
                      onClick={() => onAddOrEditCustomer(customer)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#0A0A0A] dark:text-slate-400 dark:hover:text-[#FAF7F2] hover:bg-[#FAF0F2] dark:hover:bg-[#2D0E15] transition-colors cursor-pointer"
                      title="Edit Customer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete customer "${customer.name}"?`)) {
                          onDeleteCustomer(customer.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-[#6B1426] hover:bg-[#FAF0F2] dark:hover:bg-[#2D0E15] transition-colors cursor-pointer"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
