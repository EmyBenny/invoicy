import React, { useState } from 'react';
import {
  X,
  Download,
  Share2,
  Printer,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Phone,
  Mail,
  MapPin,
  Check,
  CreditCard,
  Banknote,
  FileText,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Receipt, BusinessProfile } from '../types';
import { formatCurrency, formatDateTime, formatLongDate } from '../utils/formatters';
import { downloadReceiptPDF, captureReceiptAsImage, shareReceipt } from '../utils/exportReceipt';

interface ReceiptDetailModalProps {
  receipt: Receipt;
  profile: BusinessProfile;
  onClose: () => void;
  onEdit: (receipt: Receipt) => void;
  onDelete: (receiptId: string) => void;
  onMarkPaid: (receiptId: string) => void;
}

export const ReceiptDetailModal: React.FC<ReceiptDetailModalProps> = ({
  receipt,
  profile,
  onClose,
  onEdit,
  onDelete,
  onMarkPaid,
}) => {
  // Default to EXECUTIVE layout matching user screenshot
  const [viewMode, setViewMode] = useState<'EXECUTIVE' | 'STANDARD' | 'THERMAL'>('EXECUTIVE');
  const [isExporting, setIsExporting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      await downloadReceiptPDF(receipt, profile);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadImage = async () => {
    setIsExporting(true);
    try {
      await captureReceiptAsImage('printable-receipt-element', receipt.receiptNumber);
    } catch (err) {
      console.error('Failed to capture image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    const success = await shareReceipt(receipt, profile);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const isPaid = receipt.paymentStatus === 'PAID';
  const isPartial = receipt.paymentStatus === 'PARTIAL';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#FFFDF9] dark:bg-[#1E1015] rounded-2xl max-w-3xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-[#EBE4D5] dark:border-[#3A1921] overflow-hidden my-auto">

        {/* Modal Top Control Bar */}
        <div className="no-print p-3 sm:p-4 border-b border-[#EBE4D5] dark:border-[#3A1921] flex items-center justify-between gap-2 shrink-0 bg-[#FAF7F0] dark:bg-[#190C11]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FAF0F2] dark:bg-[#34111A] text-[#6B1426] dark:text-[#F6E49E] flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#0A0A0A] dark:text-[#FFFDF9]">
                {receipt.receiptType} Preview
              </h3>
              <p className="text-xs font-mono text-[#0A0A0A]/60 dark:text-[#EBE4D5]/70">
                {receipt.receiptNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle: Executive (Screenshot) vs Standard vs POS */}
            <div className="p-1 bg-[#EBE4D5]/70 dark:bg-[#28151B] rounded-xl flex items-center text-xs font-semibold overflow-x-auto">
              <button
                onClick={() => setViewMode('EXECUTIVE')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  viewMode === 'EXECUTIVE'
                    ? 'bg-[#6B1426] text-[#F6E49E] shadow-2xs font-extrabold'
                    : 'text-[#0A0A0A]/70 dark:text-[#EBE4D5]/80 hover:text-[#0A0A0A]'
                }`}
                title="Executive layout matching commercial catering screenshot"
              >
                <Sparkles className="w-3 h-3 text-[#F6E49E]" />
                <span>Executive</span>
              </button>
              <button
                onClick={() => setViewMode('STANDARD')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  viewMode === 'STANDARD'
                    ? 'bg-[#6B1426] text-white shadow-2xs font-bold'
                    : 'text-[#0A0A0A]/70 dark:text-[#EBE4D5]/80 hover:text-[#0A0A0A]'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setViewMode('THERMAL')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  viewMode === 'THERMAL'
                    ? 'bg-[#6B1426] text-white shadow-2xs font-bold'
                    : 'text-[#0A0A0A]/70 dark:text-[#EBE4D5]/80 hover:text-[#0A0A0A]'
                }`}
              >
                POS Slip
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-[#0A0A0A] dark:hover:text-[#FFFDF9] rounded-lg cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-[#FAF7F0] dark:bg-[#140A0D] flex justify-center">
          {viewMode === 'EXECUTIVE' ? (
            /* =========================================================================
               EXECUTIVE INVOICE / RECEIPT (MATCHING USER SCREENSHOT)
               - Business Header on Left with Uppercase Name, Slogan, Phone, Address
               - Uppercase INVOICE on Right with Invoice Date & Event Date
               - Crisp Gold Divider Bar (#c59a3f)
               - Package Title Header (e.g. DESSERT MENU — DIAMOND PACKAGE)
               - Wine/Burgundy Table Header (#6b1426) with S/N column
               ========================================================================= */
            <div
              id="printable-receipt-element"
              className="bg-[#FFFDF9] text-[#0A0A0A] p-5 sm:p-9 rounded-2xl shadow-sm border border-[#EBE4D5] w-full max-w-2xl printable-area font-sans space-y-5 relative"
            >
              {/* Header Section: Business Info (Left) and Invoice Meta (Right) */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-2">
                {/* Left: Business Name & Details */}
                <div className="flex items-start gap-3.5 max-w-sm">
                  {profile.logoUrl && (
                    <div className="w-14 h-14 rounded-xl border border-[#EBE4D5] bg-[#FFFDF9] p-1.5 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                      <img
                        src={profile.logoUrl}
                        alt={profile.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="space-y-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#0A0A0A] leading-tight">
                      {profile.name}
                    </h2>
                    {profile.tagline && (
                      <p className="text-xs text-[#0A0A0A]/70 italic font-medium">
                        {profile.tagline}
                      </p>
                    )}

                    <div className="text-xs text-[#0A0A0A]/80 space-y-0.5 pt-1 leading-relaxed">
                      {profile.phone && (
                        <p>
                          <span className="font-bold text-[#0A0A0A]">Phone:</span> {profile.phone}
                        </p>
                      )}
                      {profile.address && (
                        <p>
                          <span className="font-bold text-[#0A0A0A]">Address:</span> {profile.address}
                        </p>
                      )}
                      {profile.email && (
                        <p>
                          <span className="font-bold text-[#0A0A0A]">Email:</span> {profile.email}
                        </p>
                      )}
                      {profile.taxNumber && (
                        <p className="text-[11px] font-mono text-[#0A0A0A]/60">
                          <span className="font-bold text-[#0A0A0A]">Tax ID:</span> {profile.taxNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Large INVOICE Heading & Dates */}
                <div className="text-left sm:text-right shrink-0 space-y-1 self-start sm:self-auto">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-wide text-[#0A0A0A] uppercase">
                    {receipt.receiptType || 'INVOICE'}
                  </h1>

                  <div className="text-xs text-[#0A0A0A]/70 space-y-0.5">
                    <p>
                      <span className="font-bold text-[#0A0A0A]">Invoice Date:</span>{' '}
                      {formatLongDate(receipt.createdAt)}
                    </p>
                    {receipt.eventDate ? (
                      <p className="text-[#6B1426] font-bold">
                        <span>Event Date:</span> {formatLongDate(receipt.eventDate)}
                      </p>
                    ) : receipt.dueDate ? (
                      <p className="text-[#0A0A0A]/80">
                        <span className="font-bold text-[#0A0A0A]">Due Date:</span> {formatLongDate(receipt.dueDate)}
                      </p>
                    ) : null}
                    <p className="font-mono text-xs text-[#0A0A0A]/60">
                      Ref: <span className="font-bold text-[#0A0A0A]">{receipt.receiptNumber}</span>
                    </p>
                  </div>

                  {/* Payment Status Tag */}
                  <div className="pt-1 sm:flex sm:justify-end">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-2xs ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : isPartial
                          ? 'bg-[#FFF9E3] text-[#8C6D1F] border-[#F6E49E]'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      {isPaid ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : isPartial ? (
                        <Clock className="w-3 h-3 text-[#C59A3F]" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                      )}
                      <span>
                        {isPaid ? 'PAID IN FULL' : isPartial ? 'PARTIALLY PAID' : 'PAYMENT DUE'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Gold / Amber Horizontal Accent Divider Line (From Screenshot) */}
              <div className="w-full h-[2.5px] bg-[#C59A3F] rounded-full my-3"></div>

              {/* Customer / Billed To Info */}
              <div className="bg-[#FAF7F0] rounded-xl p-3 sm:p-4 border border-[#EBE4D5] text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A]/50 block mb-0.5">
                  Client / Billed To:
                </span>
                <p className="text-sm font-black text-[#0A0A0A]">
                  {receipt.customerName || 'Walk-in Customer'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[#0A0A0A]/80 pt-1">
                  {receipt.customerPhone && (
                    <p>Phone: <span className="font-bold text-[#0A0A0A]">{receipt.customerPhone}</span></p>
                  )}
                  {receipt.customerEmail && (
                    <p>Email: <span className="font-bold text-[#0A0A0A]">{receipt.customerEmail}</span></p>
                  )}
                  {receipt.customerAddress && (
                    <p className="sm:col-span-2">Location/Venue: <span className="font-bold text-[#0A0A0A]">{receipt.customerAddress}</span></p>
                  )}
                </div>
              </div>

              {/* Package Title Banner (From Screenshot: e.g. DESSERT MENU — DIAMOND PACKAGE) */}
              {receipt.packageTitle && (
                <div className="pt-2">
                  <div className="text-xs sm:text-sm font-black tracking-widest text-[#0A0A0A] uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C59A3F]"></span>
                    <span>{receipt.packageTitle}</span>
                  </div>
                </div>
              )}

              {/* Table with Wine / Burgundy Header Bar (#6B1426) & S/N Column */}
              <div className="overflow-x-auto rounded-xl border border-[#EBE4D5] shadow-2xs">
                <table className="w-full text-xs text-left min-w-[500px]">
                  <thead className="bg-[#6B1426] text-white font-bold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-12 border-r border-[#842236]">S/N</th>
                      <th className="py-2.5 px-3">
                        {receipt.packageTitle ? 'Dessert Menu / Description' : 'Item / Service Description'}
                      </th>
                      <th className="py-2.5 px-3 text-center w-20">Quantity</th>
                      <th className="py-2.5 px-3 text-right w-28">Price</th>
                      <th className="py-2.5 px-3 text-right w-28">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE4D5]/60 text-[#0A0A0A]">
                    {receipt.items.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 1 ? 'bg-[#FAF7F0]/70' : 'bg-[#FFFDF9]'}>
                        <td className="py-2.5 px-3 text-center font-bold text-[#0A0A0A]/60 border-r border-[#EBE4D5]/60">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#0A0A0A]">
                          {item.name}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-[#0A0A0A]/90">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#0A0A0A]/80">
                          {formatCurrency(item.unitPrice, profile.currencySymbol)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-[#0A0A0A] tabular-nums">
                          {formatCurrency(item.total, profile.currencySymbol)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculations & Summary */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
                {/* Payment Instructions / Notes on Left */}
                <div className="w-full sm:max-w-xs space-y-2 text-xs text-[#0A0A0A]/80">
                  {receipt.notes && (
                    <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#EBE4D5]">
                      <span className="font-bold text-[11px] text-[#0A0A0A] block mb-0.5">Special Notes:</span>
                      <p className="text-[#0A0A0A]/80 leading-relaxed">{receipt.notes}</p>
                    </div>
                  )}

                  {profile.paymentInstructions && (
                    <div className="p-3 bg-[#FFF9E3] rounded-xl border border-[#F6E49E]">
                      <span className="font-bold text-[11px] text-[#8C6D1F] block mb-0.5">Bank Details & Payment:</span>
                      <p className="text-[#0A0A0A] leading-relaxed">{profile.paymentInstructions}</p>
                    </div>
                  )}
                </div>

                {/* Totals Breakdown on Right */}
                <div className="w-full sm:w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#0A0A0A]/70 py-1">
                    <span>Subtotal:</span>
                    <span className="font-mono font-bold text-[#0A0A0A] tabular-nums">
                      {formatCurrency(receipt.subtotal, profile.currencySymbol)}
                    </span>
                  </div>

                  {receipt.discountAmount > 0 && (
                    <div className="flex justify-between text-rose-600 py-1 font-bold">
                      <span>Discount ({receipt.discountType === 'percentage' ? `${receipt.discountValue}%` : 'Fixed'}):</span>
                      <span className="font-mono font-bold tabular-nums">
                        -{formatCurrency(receipt.discountAmount, profile.currencySymbol)}
                      </span>
                    </div>
                  )}

                  {receipt.taxRate > 0 && (
                    <div className="flex justify-between text-[#0A0A0A]/70 py-1">
                      <span>Tax / VAT ({receipt.taxRate}%):</span>
                      <span className="font-mono font-bold text-[#0A0A0A] tabular-nums">
                        +{formatCurrency(receipt.taxAmount, profile.currencySymbol)}
                      </span>
                    </div>
                  )}

                  {/* Grand Total Box in Executive Accent */}
                  <div className="flex justify-between items-center p-3 rounded-xl bg-[#FAF0F2] border-2 border-[#E8B6C0] my-1">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-[#0A0A0A] block">
                        Grand Total
                      </span>
                    </div>
                    <div className="text-base sm:text-lg font-black font-mono text-[#6B1426] tabular-nums">
                      {formatCurrency(receipt.grandTotal, profile.currencySymbol)}
                    </div>
                  </div>

                  <div className="flex justify-between text-[#0A0A0A]/80 py-1 font-medium">
                    <span>Amount Paid ({receipt.paymentMethod}):</span>
                    <span className="font-mono font-bold text-[#0A0A0A] tabular-nums">
                      {formatCurrency(receipt.amountPaid, profile.currencySymbol)}
                    </span>
                  </div>

                  {receipt.balanceDue > 0 && (
                    <div className="flex justify-between text-[#6B1426] font-black py-1 border-t border-[#EBE4D5]">
                      <span>Remaining Balance Due:</span>
                      <span className="font-mono tabular-nums">
                        {formatCurrency(receipt.balanceDue, profile.currencySymbol)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Message */}
              <div className="pt-4 border-t border-slate-200 text-center space-y-1">
                <p className="text-xs text-slate-700 font-semibold italic">
                  {profile.footerNote || 'Thank you for your business! Excellence in every order.'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Official Commercial Record • Powered by Invoicy
                </p>
              </div>
            </div>
          ) : viewMode === 'STANDARD' ? (
            /* =========================================================================
               STANDARD COMMERCIAL INVOICE / RECEIPT
               ========================================================================= */
            <div
              id="printable-receipt-element"
              className="bg-[#FFFDF9] text-[#0A0A0A] p-6 sm:p-8 rounded-2xl shadow-sm border border-[#EBE4D5] w-full max-w-xl printable-area font-sans space-y-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#6B1426] via-[#83182F] to-[#520E1C]"></div>

              {/* 1. Header: Business Info + Document Details */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-1 pb-4 border-b border-[#EBE4D5]">
                <div className="flex items-start gap-3.5 max-w-sm">
                  {profile.logoUrl ? (
                    <div className="w-12 h-12 rounded-xl border border-[#EBE4D5] bg-[#FFFDF9] p-1 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                      <img
                        src={profile.logoUrl}
                        alt={profile.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-[#6B1426] text-[#F6E49E] font-black text-sm flex items-center justify-center shrink-0 mt-0.5">
                      {profile.name.charAt(0) || 'I'}
                    </div>
                  )}
                  <div className="space-y-0.5 min-w-0">
                    <h2 className="text-lg font-black tracking-tight text-[#0A0A0A] leading-tight">
                      {profile.name}
                    </h2>
                    {profile.tagline && (
                      <p className="text-xs text-[#0A0A0A]/60 font-medium">
                        {profile.tagline}
                      </p>
                    )}

                    <div className="text-xs text-[#0A0A0A]/80 space-y-0.5 pt-1">
                      {profile.address && (
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#C59A3F] shrink-0 mt-0.5" />
                          <span>{profile.address}</span>
                        </div>
                      )}
                      {profile.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#C59A3F] shrink-0" />
                          <span>{profile.phone}</span>
                        </div>
                      )}
                      {profile.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#C59A3F] shrink-0" />
                          <span>{profile.email}</span>
                        </div>
                      )}
                      {profile.taxNumber && (
                        <p className="text-[11px] font-mono text-[#0A0A0A]/60 pt-0.5">
                          Tax / VAT ID: <span className="font-bold text-[#0A0A0A]">{profile.taxNumber}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-1.5 shrink-0 self-start sm:self-auto">
                  <span className="text-base sm:text-lg font-black tracking-wider text-[#6B1426] uppercase block">
                    {receipt.receiptType}
                  </span>
                  <div className="font-mono text-sm font-bold text-[#0A0A0A]">
                    #{receipt.receiptNumber}
                  </div>
                  <div className="text-xs text-[#0A0A0A]/60">
                    Issued: {formatDateTime(receipt.createdAt)}
                  </div>
                  <div className="text-xs text-[#0A0A0A]/60">
                    Payment Method: <span className="font-bold text-[#0A0A0A]">{receipt.paymentMethod}</span>
                  </div>

                  <div className="pt-1.5">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border shadow-2xs ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : isPartial
                          ? 'bg-[#FFF9E3] text-[#8C6D1F] border-[#F6E49E]'
                          : 'bg-rose-50 text-rose-700 border-rose-300'
                      }`}
                    >
                      {isPaid ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : isPartial ? (
                        <Clock className="w-3.5 h-3.5 text-[#C59A3F]" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span>
                        {isPaid ? 'PAID IN FULL' : isPartial ? 'PARTIALLY PAID' : 'UNPAID / DUE'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Billed To Customer Box */}
              <div className="p-4 bg-[#FAF7F0] rounded-xl border border-[#EBE4D5] text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A]/50 block">
                  Billed To / Customer
                </span>
                <p className="text-sm font-black text-[#0A0A0A]">
                  {receipt.customerName || 'Walk-in Customer'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[#0A0A0A]/80 pt-0.5">
                  {receipt.customerPhone && (
                    <p>Phone: <span className="font-bold text-[#0A0A0A]">{receipt.customerPhone}</span></p>
                  )}
                  {receipt.customerEmail && (
                    <p>Email: <span className="font-bold text-[#0A0A0A]">{receipt.customerEmail}</span></p>
                  )}
                  {receipt.customerAddress && (
                    <p className="sm:col-span-2">Address: <span className="font-bold text-[#0A0A0A]">{receipt.customerAddress}</span></p>
                  )}
                </div>
              </div>

              {/* 3. Items & Services Table */}
              <div className="overflow-hidden rounded-xl border border-[#EBE4D5]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#6B1426] text-white font-bold uppercase text-[10px] tracking-wider border-b border-[#EBE4D5]">
                    <tr>
                      <th className="py-2.5 px-3">Item / Service Description</th>
                      <th className="py-2.5 px-2 text-center w-16">Qty</th>
                      <th className="py-2.5 px-3 text-right w-24">Price</th>
                      <th className="py-2.5 px-3 text-right w-24">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE4D5]/60 text-[#0A0A0A]">
                    {receipt.items.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 1 ? 'bg-[#FAF7F0]/60' : 'bg-[#FFFDF9]'}>
                        <td className="py-3 px-3 font-bold text-[#0A0A0A]">
                          {item.name}
                        </td>
                        <td className="py-3 px-2 text-center font-mono font-bold text-[#0A0A0A]/90">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-[#0A0A0A]/80">
                          {formatCurrency(item.unitPrice, profile.currencySymbol)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-black text-[#0A0A0A] tabular-nums">
                          {formatCurrency(item.total, profile.currencySymbol)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 4. Financial Calculations & Totals */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
                <div className="w-full sm:max-w-xs space-y-2.5 text-xs text-[#0A0A0A]/80">
                  {receipt.notes && (
                    <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#EBE4D5]">
                      <span className="font-bold text-[11px] text-[#0A0A0A] block mb-0.5">Notes:</span>
                      <p className="text-[#0A0A0A]/80 leading-relaxed">{receipt.notes}</p>
                    </div>
                  )}

                  {profile.paymentInstructions && (
                    <div className="p-3 bg-[#FFF9E3] rounded-xl border border-[#F6E49E]">
                      <span className="font-bold text-[11px] text-[#8C6D1F] block mb-0.5">Payment Instructions:</span>
                      <p className="text-[#0A0A0A] leading-relaxed">{profile.paymentInstructions}</p>
                    </div>
                  )}
                </div>

                <div className="w-full sm:w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#0A0A0A]/70 py-1">
                    <span>Subtotal:</span>
                    <span className="font-mono font-bold text-[#0A0A0A] tabular-nums">
                      {formatCurrency(receipt.subtotal, profile.currencySymbol)}
                    </span>
                  </div>

                  {receipt.discountAmount > 0 && (
                    <div className="flex justify-between text-rose-600 py-1 font-bold">
                      <span>Discount ({receipt.discountType === 'percentage' ? `${receipt.discountValue}%` : 'Fixed'}):</span>
                      <span className="font-mono font-bold tabular-nums">
                        -{formatCurrency(receipt.discountAmount, profile.currencySymbol)}
                      </span>
                    </div>
                  )}

                  {receipt.taxRate > 0 && (
                    <div className="flex justify-between text-[#0A0A0A]/70 py-1">
                      <span>Tax / VAT ({receipt.taxRate}%):</span>
                      <span className="font-mono font-bold text-[#0A0A0A] tabular-nums">
                        +{formatCurrency(receipt.taxAmount, profile.currencySymbol)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center p-3 rounded-xl bg-[#FAF0F2] border border-[#E8B6C0] my-1">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-[#0A0A0A] block">
                        Grand Total
                      </span>
                    </div>
                    <div className="text-base sm:text-lg font-black font-mono text-[#6B1426] tabular-nums">
                      {formatCurrency(receipt.grandTotal, profile.currencySymbol)}
                    </div>
                  </div>

                  <div className="flex justify-between text-[#0A0A0A]/80 py-1 font-medium">
                    <span>Amount Paid ({receipt.paymentMethod}):</span>
                    <span className="font-mono font-bold text-[#0A0A0A] tabular-nums">
                      {formatCurrency(receipt.amountPaid, profile.currencySymbol)}
                    </span>
                  </div>

                  {receipt.balanceDue > 0 && (
                    <div className="flex justify-between text-[#6B1426] font-black py-1 border-t border-[#EBE4D5]">
                      <span>Remaining Balance Due:</span>
                      <span className="font-mono tabular-nums">
                        {formatCurrency(receipt.balanceDue, profile.currencySymbol)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Footer Message */}
              <div className="pt-4 border-t border-[#EBE4D5] text-center space-y-1">
                <p className="text-xs text-[#0A0A0A]/80 font-bold italic">
                  {profile.footerNote || 'Thank you for your business!'}
                </p>
                <p className="text-[10px] text-[#0A0A0A]/40 font-mono">
                  Official Commercial Record • Generated via Invoicy
                </p>
              </div>
            </div>
          ) : (
            /* =========================================================================
               80mm POS THERMAL CASHIER SLIP
               ========================================================================= */
            <div
              id="printable-receipt-element"
              className="bg-[#FFFDF9] text-[#0A0A0A] p-6 rounded-xl shadow-md font-mono text-xs w-full max-w-[350px] printable-area border-t-4 border-[#6B1426] border-x border-b border-[#EBE4D5] space-y-3"
            >
              <div className="text-center space-y-0.5">
                {profile.logoUrl && (
                  <div className="flex justify-center mb-1.5">
                    <img
                      src={profile.logoUrl}
                      alt={profile.name}
                      className="h-10 max-w-[120px] object-contain grayscale"
                    />
                  </div>
                )}
                <h2 className="text-sm font-black uppercase tracking-tight text-[#0A0A0A]">
                  {profile.name}
                </h2>
                {profile.tagline && <p className="text-[11px] text-[#0A0A0A]/60">{profile.tagline}</p>}
                {profile.address && <p className="text-[11px] text-[#0A0A0A]/60">{profile.address}</p>}
                {profile.phone && <p className="text-[10px] text-[#0A0A0A]/60">TEL: {profile.phone}</p>}
                {profile.taxNumber && (
                  <p className="text-[10px] text-[#0A0A0A]/60">TAX ID: {profile.taxNumber}</p>
                )}
              </div>

              <div className="border-t border-dashed border-[#EBE4D5] my-2"></div>

              <div className="flex justify-between text-[11px] text-[#0A0A0A]">
                <span className="font-bold">RCVD: #{receipt.receiptNumber}</span>
                <span className="font-extrabold">{receipt.paymentStatus}</span>
              </div>
              <div className="text-[10px] text-[#0A0A0A]/60">
                {formatDateTime(receipt.createdAt)}
              </div>
              <div className="text-[11px] font-bold text-[#0A0A0A]">
                CUSTOMER: {receipt.customerName || 'Walk-in'}
              </div>

              <div className="border-t border-dashed border-[#EBE4D5] my-2"></div>

              <div className="space-y-2 text-[11px]">
                {receipt.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="font-bold text-[#0A0A0A]">{item.name}</div>
                    <div className="flex justify-between text-[#0A0A0A]/70 text-[10px]">
                      <span>{item.quantity} × {formatCurrency(item.unitPrice, profile.currencySymbol)}</span>
                      <span className="font-bold text-[#0A0A0A]">{formatCurrency(item.total, profile.currencySymbol)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-[#EBE4D5] my-2"></div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-[#0A0A0A]/70">
                  <span>SUBTOTAL:</span>
                  <span className="font-bold text-[#0A0A0A]">{formatCurrency(receipt.subtotal, profile.currencySymbol)}</span>
                </div>
                {receipt.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>DISCOUNT:</span>
                    <span>-{formatCurrency(receipt.discountAmount, profile.currencySymbol)}</span>
                  </div>
                )}
                {receipt.taxAmount > 0 && (
                  <div className="flex justify-between text-[#0A0A0A]/70 font-semibold">
                    <span>TAX ({receipt.taxRate}%):</span>
                    <span>+{formatCurrency(receipt.taxAmount, profile.currencySymbol)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-black border-t border-[#0A0A0A] pt-1.5 text-[#6B1426]">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(receipt.grandTotal, profile.currencySymbol)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-[#0A0A0A]">
                  <span>PAID ({receipt.paymentMethod}):</span>
                  <span className="font-bold">{formatCurrency(receipt.amountPaid, profile.currencySymbol)}</span>
                </div>
                {receipt.balanceDue > 0 && (
                  <div className="flex justify-between text-xs font-black text-[#6B1426]">
                    <span>BAL DUE:</span>
                    <span>{formatCurrency(receipt.balanceDue, profile.currencySymbol)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-dashed border-[#EBE4D5] my-3"></div>

              <div className="text-center space-y-1">
                <div className="inline-block tracking-widest text-[#0A0A0A] text-base font-bold scale-y-150 select-none">
                  ||||| | |||| ||| ||||| ||| |||
                </div>
                <p className="text-[10px] text-[#0A0A0A]/50 uppercase">*{receipt.receiptNumber}*</p>
                <p className="text-[10px] text-[#0A0A0A] font-bold italic mt-2">
                  {profile.footerNote || 'THANK YOU FOR YOUR PATRONAGE!'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Bar */}
        <div className="no-print p-3 sm:p-4 border-t border-[#EBE4D5] dark:border-[#3A1921] bg-[#FAF7F0] dark:bg-[#190C11] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            {!isPaid && (
              <button
                onClick={() => onMarkPaid(receipt.id)}
                className="px-3 py-2 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                title="Mark this receipt as Fully Paid"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Paid</span>
              </button>
            )}

            <button
              onClick={() => onEdit(receipt)}
              className="p-2 text-[#0A0A0A] dark:text-[#FAF7F0] hover:bg-[#EBE4D5] dark:hover:bg-[#28151B] rounded-xl cursor-pointer transition-colors"
              title="Edit receipt"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (confirm('Delete this receipt permanently?')) {
                  onDelete(receipt.id);
                  onClose();
                }
              }}
              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl cursor-pointer transition-colors"
              title="Delete receipt"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2.5 text-[#0A0A0A] dark:text-[#FAF7F0] bg-[#FFFDF9] dark:bg-[#28151B] border border-[#EBE4D5] dark:border-[#4A202A] hover:bg-[#FAF7F0] rounded-xl cursor-pointer shadow-2xs transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 text-[#0A0A0A] dark:text-[#FAF7F0] bg-[#FFFDF9] dark:bg-[#28151B] border border-[#EBE4D5] dark:border-[#4A202A] hover:bg-[#FAF7F0] rounded-xl cursor-pointer shadow-2xs transition-colors"
              title="Share Receipt"
            >
              {copySuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={handleDownloadImage}
              disabled={isExporting}
              className="px-3 py-2 text-xs font-bold text-[#0A0A0A] dark:text-[#FAF7F0] bg-[#FFFDF9] dark:bg-[#28151B] border border-[#EBE4D5] dark:border-[#4A202A] hover:bg-[#FAF7F0] rounded-xl cursor-pointer shadow-2xs transition-colors"
              title="Save Image (PNG)"
            >
              Image (PNG)
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="px-4 py-2 text-xs font-black text-white bg-[#6B1426] hover:bg-[#520E1C] rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
