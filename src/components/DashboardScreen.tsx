import React from 'react';
import {
  Plus,
  Users,
  FileText,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Settings,
  Building2,
  Calendar,
  Wallet,
  RotateCcw,
  ChevronRight,
  TrendingUp,
  Receipt as ReceiptIcon
} from 'lucide-react';
import { Receipt, BusinessProfile } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface DashboardScreenProps {
  receipts: Receipt[];
  profile: BusinessProfile;
  onNavigate: (tab: 'create' | 'orders' | 'customers' | 'settings') => void;
  onSelectReceipt: (receipt: Receipt) => void;
  onResetData?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  receipts,
  profile,
  onNavigate,
  onSelectReceipt,
  onResetData,
}) => {
  // Compute Today's metrics
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayReceipts = receipts.filter(r => {
    const d = new Date(r.createdAt);
    return d >= todayStart;
  });

  const todaySales = todayReceipts.reduce((sum, r) => sum + r.grandTotal, 0);
  const todayOrdersCount = todayReceipts.length;

  // Unpaid balance across all active receipts
  const unpaidTotal = receipts.reduce((sum, r) => sum + (r.balanceDue || 0), 0);

  // This Month sales
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthReceipts = receipts.filter(r => {
    const d = new Date(r.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const monthSales = monthReceipts.reduce((sum, r) => sum + r.grandTotal, 0);

  // Recent receipts (top 5)
  const recentReceipts = receipts.slice(0, 5);

  // Formatted date string for mobile header
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex-1 p-3 sm:p-5 pb-28 space-y-4 max-w-4xl mx-auto w-full animate-in fade-in duration-150">
      
      {/* 1. COMPACT BUSINESS GREETING & DATE BAR */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="min-w-0 flex items-center gap-2.5">
          {profile.logoUrl ? (
            <div className="w-10 h-10 rounded-xl bg-[#FFFDF9] border border-[#EBE4D5] dark:border-[#3A1921] p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs">
              <img
                src={profile.logoUrl}
                alt={profile.name}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-[#6B1426] text-[#F6E49E] font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
              {profile.name.charAt(0) || 'I'}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-extrabold text-base sm:text-lg text-[#0A0A0A] dark:text-white truncate leading-tight">
              {profile.name || 'Invoicy Business'}
            </h1>
            <p className="text-xs text-[#57524C] dark:text-[#FAF7F2]/70 truncate">
              {profile.tagline || profile.address || 'Commercial Dashboard'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('settings')}
          className="p-2 text-[#6B1426] dark:text-[#F6E49E] hover:bg-[#FAF0F2] dark:hover:bg-[#2D0E15] rounded-xl transition-colors cursor-pointer shrink-0"
          title="Business settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* 2. TODAY'S SALES HERO CARD (HORSE BLOOD & BUTTER YELLOW ACCENT) */}
      <div className="bg-gradient-to-br from-[#6B1426] via-[#520E1C] to-[#3B0711] text-white rounded-2xl shadow-lg border border-[#851C33]/50 overflow-hidden relative">
        {/* Butter Yellow Accent Divider Bar at top */}
        <div className="h-1 bg-gradient-to-r from-[#F6E49E] via-[#E5C358] to-[#F6E49E]"></div>

        <div className="p-4 sm:p-6 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F6E49E] animate-pulse"></span>
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-[#F6E49E]">
                Today's Total Sales
              </span>
            </div>
            <span className="text-[11px] font-medium text-white/80 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
              {todayFormatted}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white tabular-nums">
              {formatCurrency(todaySales, profile.currencySymbol)}
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#F6E49E] bg-black/25 border border-[#F6E49E]/40 px-2.5 py-1 rounded-full">
                <ArrowUpRight className="w-3.5 h-3.5 text-[#F6E49E]" />
                <span>{todayOrdersCount} {todayOrdersCount === 1 ? 'order' : 'orders'} today</span>
              </span>
            </div>
          </div>

          {/* Quick Create CTA inside Hero Card */}
          <div className="pt-2 border-t border-white/15 flex items-center justify-between">
            <p className="text-[11px] text-white/80 truncate">
              {todayOrdersCount === 0 ? 'No orders recorded yet today' : 'All transactions synchronized offline'}
            </p>
            <button
              onClick={() => onNavigate('create')}
              className="px-3.5 py-1.5 bg-[#F6E49E] hover:bg-[#ECD178] text-[#0A0A0A] text-xs font-black rounded-xl flex items-center gap-1 shadow-sm transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.8]" />
              <span>New Receipt</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. FINANCIAL HEALTH METRICS (BALANCED 2-CARD GRID ON MOBILE) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: This Month's Total */}
        <div className="bg-[#FFFDF9] dark:bg-[#1E1015] rounded-2xl p-3.5 sm:p-4 border border-[#EBE4D5] dark:border-[#3A1921] shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#57524C] dark:text-[#FAF7F2]/70">
              This Month
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF0F2] dark:bg-[#2D0E15] text-[#6B1426] dark:text-[#F6E49E] flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-[#0A0A0A] dark:text-white truncate tabular-nums">
            {formatCurrency(monthSales, profile.currencySymbol)}
          </div>
          <p className="text-[10px] text-[#57524C] dark:text-[#FAF7F2]/60 truncate">
            {monthReceipts.length} {monthReceipts.length === 1 ? 'order' : 'orders'} this month
          </p>
        </div>

        {/* Card 2: Outstanding Balance */}
        <div className="bg-[#FFFDF9] dark:bg-[#1E1015] rounded-2xl p-3.5 sm:p-4 border border-[#EBE4D5] dark:border-[#3A1921] shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#57524C] dark:text-[#FAF7F2]/70">
              Pending Due
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#FFF9E3] dark:bg-[#2A2312] text-[#8C6D1F] dark:text-[#F6E49E] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-[#6B1426] dark:text-[#F6E49E] truncate tabular-nums">
            {formatCurrency(unpaidTotal, profile.currencySymbol)}
          </div>
          <p className="text-[10px] text-[#57524C] dark:text-[#FAF7F2]/60 truncate">
            {unpaidTotal > 0 ? 'Awaiting collection' : 'All accounts settled'}
          </p>
        </div>
      </div>

      {/* 4. BALANCED QUICK ACTIONS (2x2 ON MOBILE, 4x1 ON DESKTOP) */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#57524C] dark:text-[#FAF7F2]/70">
            Quick Actions
          </h2>
          <span className="text-[11px] text-[#57524C]">Tap to manage</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* New Receipt Action */}
          <button
            onClick={() => onNavigate('create')}
            className="p-3.5 rounded-2xl bg-[#FFFDF9] dark:bg-[#1E1015] hover:bg-[#FAF0F2] dark:hover:bg-[#2D0E15] active:scale-[0.98] border border-[#EBE4D5] dark:border-[#3A1921] shadow-2xs transition-all text-left flex flex-col justify-between cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FAF0F2] dark:bg-[#2D0E15] text-[#6B1426] dark:text-[#F6E49E] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#0A0A0A] dark:text-white">New Receipt</p>
              <p className="text-[10px] text-[#57524C] dark:text-[#FAF7F2]/60">Invoice or Slip</p>
            </div>
          </button>

          {/* Customers Directory Action */}
          <button
            onClick={() => onNavigate('customers')}
            className="p-3.5 rounded-2xl bg-[#FFFDF9] dark:bg-[#1E1015] hover:bg-[#FAF0F2] dark:hover:bg-[#2D0E15] active:scale-[0.98] border border-[#EBE4D5] dark:border-[#3A1921] shadow-2xs transition-all text-left flex flex-col justify-between cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FFF9E3] dark:bg-[#2A2312] text-[#8C6D1F] dark:text-[#F6E49E] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#0A0A0A] dark:text-white">Customers</p>
              <p className="text-[10px] text-[#57524C] dark:text-[#FAF7F2]/60">Client Directory</p>
            </div>
          </button>

          {/* All Records Action */}
          <button
            onClick={() => onNavigate('orders')}
            className="p-3.5 rounded-2xl bg-[#FFFDF9] dark:bg-[#1E1015] hover:bg-[#FAF0F2] dark:hover:bg-[#2D0E15] active:scale-[0.98] border border-[#EBE4D5] dark:border-[#3A1921] shadow-2xs transition-all text-left flex flex-col justify-between cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FAF0F2] dark:bg-[#2D0E15] text-[#6B1426] dark:text-[#F6E49E] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#0A0A0A] dark:text-white">All Records</p>
              <p className="text-[10px] text-[#57524C] dark:text-[#FAF7F2]/60">{receipts.length} past orders</p>
            </div>
          </button>

          {/* Settings & Profile Action */}
          <button
            onClick={() => onNavigate('settings')}
            className="p-3.5 rounded-2xl bg-[#FFFDF9] dark:bg-[#1E1015] hover:bg-[#FAF0F2] dark:hover:bg-[#2D0E15] active:scale-[0.98] border border-[#EBE4D5] dark:border-[#3A1921] shadow-2xs transition-all text-left flex flex-col justify-between cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FFF9E3] dark:bg-[#2A2312] text-[#8C6D1F] dark:text-[#F6E49E] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#0A0A0A] dark:text-white">Settings</p>
              <p className="text-[10px] text-[#57524C] dark:text-[#FAF7F2]/60">Profile & Tax</p>
            </div>
          </button>
        </div>
      </div>

      {/* 5. RECENT RECEIPTS (MOBILE-FIRST POLISHED CARD LIST) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#57524C] dark:text-[#FAF7F2]/70">
              Recent Receipts
            </h2>
            <span className="text-xs font-mono font-bold text-[#57524C]">
              ({receipts.length})
            </span>
          </div>

          {receipts.length > 0 && (
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs font-bold text-[#6B1426] dark:text-[#F6E49E] hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentReceipts.length === 0 ? (
          /* Empty State for Dashboard */
          <div className="bg-[#FFFDF9] dark:bg-[#1E1015] border border-dashed border-[#EBE4D5] dark:border-[#3A1921] rounded-2xl p-7 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF0F2] dark:bg-[#2D0E15] text-[#6B1426] dark:text-[#F6E49E] mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0A0A0A] dark:text-white">
                No receipts generated yet
              </p>
              <p className="text-xs text-[#57524C] dark:text-[#FAF7F2]/70 mt-1 max-w-sm mx-auto">
                Issue your first commercial receipt to calculate sales, or seed sample business records to explore the app.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                onClick={() => onNavigate('create')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6B1426] hover:bg-[#520E1C] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create Receipt</span>
              </button>

              {onResetData && (
                <button
                  onClick={onResetData}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFF9E3] hover:bg-[#F6E49E] text-[#0A0A0A] text-xs font-bold rounded-xl border border-[#EBE4D5] cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#6B1426]" />
                  <span>Load Sample Records</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Mobile-Optimized Recent Receipts Cards */
          <div className="space-y-2">
            {recentReceipts.map(receipt => {
              const isPaid = receipt.paymentStatus === 'PAID';
              const isPartial = receipt.paymentStatus === 'PARTIAL';

              return (
                <div
                  key={receipt.id}
                  onClick={() => onSelectReceipt(receipt)}
                  className="p-3.5 sm:p-4 rounded-2xl border border-[#EBE4D5] dark:border-[#3A1921] bg-[#FFFDF9] dark:bg-[#1E1015] shadow-2xs hover:shadow-xs hover:border-[#6B1426]/30 dark:hover:border-[#F6E49E]/30 transition-all active:scale-[0.99] cursor-pointer flex flex-col gap-2"
                >
                  {/* Top line: Number, Date, Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-mono font-bold text-[#0A0A0A] dark:text-white truncate">
                        #{receipt.receiptNumber}
                      </span>
                      <span className="text-[10px] text-[#57524C]">·</span>
                      <span className="text-[11px] text-[#57524C] dark:text-[#FAF7F2]/70 whitespace-nowrap">
                        {formatDate(receipt.createdAt)}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : isPartial
                          ? 'bg-[#FFF9E3] text-[#8C6D1F] dark:bg-[#2A2312] dark:text-[#F6E49E] border border-[#F6E49E]'
                          : 'bg-[#FAF0F2] text-[#6B1426] dark:bg-[#2D0E15] dark:text-[#E8B6C0] border border-[#E8B6C0]'
                      }`}
                    >
                      {isPaid ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : isPartial ? (
                        <Clock className="w-3 h-3 text-[#8C6D1F]" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-[#6B1426]" />
                      )}
                      <span>{receipt.paymentStatus}</span>
                    </span>
                  </div>

                  {/* Customer name and package heading */}
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-extrabold text-[#0A0A0A] dark:text-white truncate">
                      {receipt.customerName || 'Walk-in Customer'}
                    </p>
                    <span className="text-sm sm:text-base font-black font-mono text-[#0A0A0A] dark:text-white tabular-nums shrink-0">
                      {formatCurrency(receipt.grandTotal, profile.currencySymbol)}
                    </span>
                  </div>

                  {/* Bottom Line: Items details & balance due */}
                  <div className="flex items-center justify-between text-[11px] text-[#57524C] dark:text-[#FAF7F2]/70 pt-1 border-t border-[#EBE4D5]/60 dark:border-[#3A1921]/60">
                    <div className="flex items-center gap-1.5 truncate">
                      <span>{receipt.items.length} {receipt.items.length === 1 ? 'item' : 'items'}</span>
                      <span>·</span>
                      <span className="font-medium text-[#0A0A0A] dark:text-white capitalize">
                        {receipt.paymentMethod.replace('_', ' ').toLowerCase()}
                      </span>
                      {receipt.packageTitle && (
                        <>
                          <span>·</span>
                          <span className="text-[#6B1426] dark:text-[#F6E49E] font-bold truncate">
                            {receipt.packageTitle}
                          </span>
                        </>
                      )}
                    </div>

                    {isPartial && receipt.balanceDue > 0 && (
                      <span className="text-[#8C6D1F] dark:text-[#F6E49E] font-bold shrink-0">
                        Due: {formatCurrency(receipt.balanceDue, profile.currencySymbol)}
                      </span>
                    )}
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
