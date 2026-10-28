import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpDown,
  Calendar,
  X,
  FileText,
  Edit2,
  Trash2,
  Eye,
  ChevronRight,
  Download,
  CreditCard,
  Banknote,
  Landmark,
  Receipt as ReceiptIcon
} from 'lucide-react';
import { Receipt, BusinessProfile, PaymentStatus } from '../types';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';

interface OrdersScreenProps {
  receipts: Receipt[];
  profile: BusinessProfile;
  onSelectReceipt: (receipt: Receipt) => void;
  onEditReceipt?: (receipt: Receipt) => void;
  onDeleteReceipt?: (id: string) => void;
  onCreateReceipt: () => void;
}

export const OrdersScreen: React.FC<OrdersScreenProps> = ({
  receipts,
  profile,
  onSelectReceipt,
  onEditReceipt,
  onDeleteReceipt,
  onCreateReceipt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PaymentStatus>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM'>('ALL');
  const [customDate, setCustomDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST' | 'AMOUNT_HIGH' | 'AMOUNT_LOW'>('NEWEST');

  // Filter & Search
  const filtered = receipts.filter(r => {
    // 1. Status filter
    if (statusFilter !== 'ALL' && r.paymentStatus !== statusFilter) {
      return false;
    }

    // 2. Search query: receiptNumber, customerName, or item name
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchNumber = r.receiptNumber.toLowerCase().includes(q);
      const matchCustomer = r.customerName.toLowerCase().includes(q);
      const matchItem = r.items.some(i => i.name.toLowerCase().includes(q));
      if (!matchNumber && !matchCustomer && !matchItem) {
        return false;
      }
    }

    // 3. Date range filter
    const receiptTime = new Date(r.createdAt).getTime();
    const now = Date.now();

    if (dateFilter === 'TODAY') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      if (receiptTime < startOfDay.getTime()) return false;
    } else if (dateFilter === 'WEEK') {
      const oneWeekAgo = now - 7 * 86400000;
      if (receiptTime < oneWeekAgo) return false;
    } else if (dateFilter === 'MONTH') {
      const oneMonthAgo = now - 30 * 86400000;
      if (receiptTime < oneMonthAgo) return false;
    } else if (dateFilter === 'CUSTOM' && customDate) {
      const targetDate = new Date(customDate).toDateString();
      const recDate = new Date(r.createdAt).toDateString();
      if (targetDate !== recDate) return false;
    }

    return true;
  });

  // Sort logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === 'NEWEST') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortOrder === 'OLDEST') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortOrder === 'AMOUNT_HIGH') {
      return b.grandTotal - a.grandTotal;
    }
    if (sortOrder === 'AMOUNT_LOW') {
      return a.grandTotal - b.grandTotal;
    }
    return 0;
  });

  // Aggregate KPI figures for active set
  const totalVolume = sorted.reduce((sum, r) => sum + r.grandTotal, 0);
  const totalCollected = sorted.reduce((sum, r) => sum + r.amountPaid, 0);
  const totalOutstanding = sorted.reduce((sum, r) => sum + (r.balanceDue || 0), 0);

  return (
    <div className="flex-1 p-3 sm:p-6 pb-28 max-w-4xl mx-auto w-full space-y-4 animate-in fade-in duration-150">

      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by receipt # (REC-...), customer name, item..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-10 pr-9 py-3 bg-[#FFFDF9] dark:bg-[#1E1015] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B1426] shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-2.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Create Receipt Button */}
        <button
          onClick={onCreateReceipt}
          className="px-4 py-3 bg-[#6B1426] hover:bg-[#520E1C] active:scale-98 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-[#6B1426]/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Receipt</span>
        </button>
      </div>

      {/* Filter and Date Strip */}
      <div className="space-y-2">
        {/* Row 1: Status Filters & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Status Segmented Buttons */}
          <div className="flex items-center gap-1 p-1 bg-[#FAF7F0] dark:bg-[#140A0D] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl text-xs font-semibold overflow-x-auto">
            {(['ALL', 'PAID', 'UNPAID', 'PARTIAL'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === tab
                    ? 'bg-[#6B1426] text-white shadow-2xs font-bold'
                    : 'text-[#57524C] dark:text-[#FAF7F2]/70 hover:text-[#0A0A0A]'
                }`}
              >
                {tab === 'ALL' ? 'All Status' : tab === 'PAID' ? 'Paid' : tab === 'UNPAID' ? 'Unpaid' : 'Partial'}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] text-[#57524C] font-medium hidden sm:inline">Sort:</span>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as any)}
              className="text-xs font-semibold bg-[#FFFDF9] dark:bg-[#1E1015] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl px-2.5 py-1.5 text-[#0A0A0A] dark:text-[#FAF7F2] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#6B1426] cursor-pointer"
            >
              <option value="NEWEST">Date: Newest First</option>
              <option value="OLDEST">Date: Oldest First</option>
              <option value="AMOUNT_HIGH">Amount: High to Low</option>
              <option value="AMOUNT_LOW">Amount: Low to High</option>
            </select>
          </div>
        </div>

        {/* Row 2: Date Range Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <div className="flex items-center gap-1 text-[#57524C] dark:text-[#FAF7F2]/70 shrink-0">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Date:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All Time' },
              { id: 'TODAY', label: 'Today' },
              { id: 'WEEK', label: 'Last 7 Days' },
              { id: 'MONTH', label: 'Last 30 Days' },
              { id: 'CUSTOM', label: 'Pick Date' },
            ].map(d => (
              <button
                key={d.id}
                onClick={() => setDateFilter(d.id as any)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                  dateFilter === d.id
                    ? 'bg-[#6B1426] text-white font-bold'
                    : 'bg-[#FFFDF9] dark:bg-[#1E1015] text-[#57524C] dark:text-[#FAF7F2]/70 border border-[#EBE4D5] dark:border-[#3A1921] hover:bg-[#FAF0F2]'
                }`}
              >
                {d.label}
              </button>
            ))}

            {dateFilter === 'CUSTOM' && (
              <input
                type="date"
                value={customDate}
                onChange={e => setCustomDate(e.target.value)}
                className="text-xs bg-[#FFFDF9] dark:bg-[#1E1015] border border-[#EBE4D5] dark:border-[#3A1921] rounded-lg px-2 py-0.5 text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B1426]"
              />
            )}
          </div>
        </div>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-3 gap-2.5 bg-[#FFFDF9] dark:bg-[#1E1015] rounded-2xl p-4 border border-[#EBE4D5] dark:border-[#3A1921] shadow-xs text-center">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#57524C] block tracking-wider">
            Total Invoiced ({sorted.length})
          </span>
          <span className="text-sm sm:text-base font-mono font-black text-[#0A0A0A] dark:text-white tabular-nums mt-0.5 block">
            {formatCurrency(totalVolume, profile.currencySymbol)}
          </span>
        </div>

        <div className="border-x border-[#EBE4D5] dark:border-[#3A1921]">
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block tracking-wider">
            Collected Paid
          </span>
          <span className="text-sm sm:text-base font-mono font-black text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5 block">
            {formatCurrency(totalCollected, profile.currencySymbol)}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-[#8C6D1F] dark:text-[#F6E49E] block tracking-wider">
            Outstanding Due
          </span>
          <span className="text-sm sm:text-base font-mono font-black text-[#8C6D1F] dark:text-[#F6E49E] tabular-nums mt-0.5 block">
            {formatCurrency(totalOutstanding, profile.currencySymbol)}
          </span>
        </div>
      </div>

      {/* Records Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#57524C] dark:text-[#FAF7F2]/70">
          <span className="font-bold uppercase tracking-wider">
            Receipt Records ({sorted.length})
          </span>
          <span className="text-[#57524C]">
            Tap record to preview, print or download PDF
          </span>
        </div>

        {sorted.length === 0 ? (
          /* Empty State */
          <div className="bg-[#FFFDF9] dark:bg-[#1E1015] rounded-2xl p-10 text-center border border-dashed border-[#EBE4D5] dark:border-[#3A1921] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF0F2] dark:bg-[#2D0E15] text-[#6B1426] dark:text-[#F6E49E] mx-auto flex items-center justify-center">
              <Filter className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0A0A0A] dark:text-slate-200">
                {searchQuery || statusFilter !== 'ALL' || dateFilter !== 'ALL'
                  ? 'No receipts match your search filters'
                  : 'No receipts or invoices recorded yet'}
              </h3>
              <p className="text-xs text-[#57524C] dark:text-[#FAF7F2]/70 mt-1 max-w-sm mx-auto">
                {searchQuery || statusFilter !== 'ALL' || dateFilter !== 'ALL'
                  ? 'Try clearing the search query or changing your status/date filters above.'
                  : 'Issue your first commercial receipt to begin tracking customer orders and cash flow.'}
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-2">
              {searchQuery || statusFilter !== 'ALL' || dateFilter !== 'ALL' ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setDateFilter('ALL');
                    setCustomDate('');
                  }}
                  className="px-4 py-2 bg-[#FAF7F0] hover:bg-[#FAF0F2] dark:bg-[#140A0D] text-[#0A0A0A] dark:text-slate-200 text-xs font-bold rounded-xl border border-[#EBE4D5] dark:border-[#3A1921] cursor-pointer"
                >
                  Reset All Filters
                </button>
              ) : (
                <button
                  onClick={onCreateReceipt}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6B1426] hover:bg-[#520E1C] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Issue First Receipt</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* List of Receipts */
          <div className="space-y-2.5">
            {sorted.map(receipt => {
              const isPaid = receipt.paymentStatus === 'PAID';
              const isPartial = receipt.paymentStatus === 'PARTIAL';

              return (
                <div
                  key={receipt.id}
                  onClick={() => onSelectReceipt(receipt)}
                  className="bg-[#FFFDF9] dark:bg-[#1E1015] rounded-2xl p-4 sm:p-5 border border-[#EBE4D5] dark:border-[#3A1921] shadow-xs hover:border-[#6B1426]/50 dark:hover:border-[#F6E49E]/50 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 group"
                >
                  {/* Left: Status Icon & Details */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${
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
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#0A0A0A] dark:text-white">
                          #{receipt.receiptNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">·</span>
                        <span className="text-[11px] font-semibold text-[#57524C] dark:text-[#FAF7F2]/70">
                          {formatDateTime(receipt.createdAt)}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-[#6B1426] dark:text-[#F6E49E] bg-[#FAF0F2] dark:bg-[#2D0E15] px-1.5 py-0.5 rounded border border-[#E8B6C0]/40">
                          {receipt.receiptType}
                        </span>
                      </div>

                      <h4 className="text-sm font-extrabold text-[#0A0A0A] dark:text-white truncate mt-1">
                        {receipt.customerName || 'Walk-in Customer'}
                      </h4>

                      <p className="text-xs text-[#57524C] dark:text-[#FAF7F2]/70 truncate mt-0.5">
                        {receipt.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                      </p>

                      <div className="flex items-center gap-2 text-[11px] text-[#57524C] dark:text-[#FAF7F2]/60 mt-1">
                        <span>Payment: {receipt.paymentMethod}</span>
                        {receipt.notes && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[200px]">"{receipt.notes}"</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amounts, Status Stamp & Inline Controls */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EBE4D5]/60 dark:border-[#3A1921]/60 gap-2 shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="text-base sm:text-lg font-black font-mono text-[#0A0A0A] dark:text-white tabular-nums">
                        {formatCurrency(receipt.grandTotal, profile.currencySymbol)}
                      </div>

                      <div className="flex items-center gap-1.5 sm:justify-end mt-0.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : isPartial
                              ? 'bg-[#FFF9E3] text-[#8C6D1F] dark:bg-[#2A2312] dark:text-[#F6E49E] border border-[#F6E49E]'
                              : 'bg-[#FAF0F2] text-[#6B1426] dark:bg-[#2D0E15] dark:text-[#E8B6C0] border border-[#E8B6C0]'
                          }`}
                        >
                          {receipt.paymentStatus}
                        </span>

                        {isPartial && receipt.balanceDue > 0 && (
                          <span className="text-[10px] font-mono font-bold text-[#8C6D1F] dark:text-[#F6E49E]">
                            Due: {formatCurrency(receipt.balanceDue, profile.currencySymbol)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Row Buttons */}
                    <div
                      className="flex items-center gap-1.5 pt-1"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onSelectReceipt(receipt)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#6B1426] hover:bg-[#FAF0F2] dark:hover:bg-[#2D0E15] transition-colors cursor-pointer"
                        title="View / Print / PDF"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {onEditReceipt && (
                        <button
                          onClick={() => onEditReceipt(receipt)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#0A0A0A] dark:text-slate-400 dark:hover:text-[#FAF7F2] hover:bg-[#FAF0F2] dark:hover:bg-[#2D0E15] transition-colors cursor-pointer"
                          title="Edit Receipt"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}

                      {onDeleteReceipt && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete receipt #${receipt.receiptNumber} permanently?`)) {
                              onDeleteReceipt(receipt.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-[#6B1426] hover:bg-[#FAF0F2] dark:hover:bg-[#2D0E15] transition-colors cursor-pointer"
                          title="Delete Receipt"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#6B1426] group-hover:translate-x-0.5 transition-all hidden sm:inline ml-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
