import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Receipt, BusinessProfile } from '../types';
import { formatCurrency, formatDateTime, formatLongDate } from './formatters';

export async function downloadReceiptPDF(receipt: Receipt, profile: BusinessProfile): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const currency = profile.currencySymbol || '$';
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2; // 174mm
  const rightX = pageWidth - margin;
  let y = 18;
  let textStartX = margin;
  let logoBottomY = y;
  if (profile.logoUrl) {
    try {
      doc.addImage(profile.logoUrl, margin, y - 4, 15, 15);
      textStartX = margin + 18;
      logoBottomY = y - 4 + 16;
    } catch {
      // Graceful fallback
    }
  }

  // Business Name in Bold Uppercase (Screenshot Style)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42); // dark slate / black
  doc.text((profile.name || 'INVOICE').toUpperCase(), textStartX, y);

  if (profile.tagline) {
    y += 5;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(profile.tagline, textStartX, y);
  }

  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  if (profile.phone) {
    doc.setFont('helvetica', 'bold');
    doc.text('Phone: ', textStartX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(profile.phone, textStartX + 11, y);
    y += 4.2;
  }

  if (profile.address) {
    doc.setFont('helvetica', 'bold');
    doc.text('Address: ', textStartX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(profile.address, textStartX + 13, y, { maxWidth: 85 });
    y += 4.5;
  }

  if (profile.email) {
    doc.setFont('helvetica', 'bold');
    doc.text('Email: ', textStartX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(profile.email, textStartX + 10, y);
    y += 4.2;
  }

  if (profile.taxNumber) {
    doc.text(`Tax ID: ${profile.taxNumber}`, textStartX, y);
    y += 4.2;
  }

  y = Math.max(y, logoBottomY + 2);

  // Header Right: Big Bold INVOICE + Dates (from Screenshot)
  let rightY = 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // Black / deep slate
  doc.text(receipt.receiptType || 'INVOICE', rightX, rightY, { align: 'right' });

  rightY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Invoice Date: ${formatLongDate(receipt.createdAt)}`, rightX, rightY, { align: 'right' });

  if (receipt.eventDate) {
    rightY += 4.8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 20, 38); // Wine/Burgundy highlight for event date
    doc.text(`Event Date: ${formatLongDate(receipt.eventDate)}`, rightX, rightY, { align: 'right' });
  } else if (receipt.dueDate) {
    rightY += 4.8;
    doc.setTextColor(71, 85, 105);
    doc.text(`Due Date: ${formatLongDate(receipt.dueDate)}`, rightX, rightY, { align: 'right' });
  }

  rightY += 4.8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Ref: ${receipt.receiptNumber}`, rightX, rightY, { align: 'right' });

  // Payment Status Stamp on Right
  rightY += 5.5;
  const status = receipt.paymentStatus;
  if (status === 'PAID') {
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(16, 185, 129);
    doc.roundedRect(rightX - 30, rightY - 3.8, 30, 5.5, 1.2, 1.2, 'FD');
    doc.setTextColor(5, 150, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('PAID IN FULL', rightX - 15, rightY, { align: 'center' });
  } else if (status === 'PARTIAL') {
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(rightX - 30, rightY - 3.8, 30, 5.5, 1.2, 1.2, 'FD');
    doc.setTextColor(180, 83, 9);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('PARTIALLY PAID', rightX - 15, rightY, { align: 'center' });
  } else {
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(239, 68, 68);
    doc.roundedRect(rightX - 30, rightY - 3.8, 30, 5.5, 1.2, 1.2, 'FD');
    doc.setTextColor(185, 28, 28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('PAYMENT DUE', rightX - 15, rightY, { align: 'center' });
  }

  // Sync Y position
  y = Math.max(y + 3, rightY + 8);

  // Gold / Amber Accent Divider Bar (Exactly matching user screenshot #c59a3f)
  doc.setFillColor(197, 154, 63); // #c59a3f Gold
  doc.rect(margin, y, contentWidth, 0.8, 'F');
  y += 6;

  // Customer "Billed To" Card
  const boxWidth = contentWidth;
  const boxHeight = 22;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, boxWidth, boxHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('CLIENT / BILLED TO:', margin + 4, y + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(receipt.customerName || 'Walk-in Customer', margin + 4, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  let custDetails = [];
  if (receipt.customerPhone) custDetails.push(`Phone: ${receipt.customerPhone}`);
  if (receipt.customerEmail) custDetails.push(`Email: ${receipt.customerEmail}`);
  if (receipt.customerAddress) custDetails.push(`Location: ${receipt.customerAddress}`);

  if (custDetails.length > 0) {
    doc.text(custDetails.join('   |   '), margin + 4, y + 16, { maxWidth: boxWidth - 8 });
  }

  y += boxHeight + 5;

  // Package / Section Title Banner (from Screenshot: e.g. DESSERT MENU — DIAMOND PACKAGE)
  if (receipt.packageTitle) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(receipt.packageTitle.toUpperCase(), margin, y + 1);
    y += 5.5;
  }

  // Table Columns Setup
  const colX = {
    sn: margin + 3,
    desc: margin + 14,
    qty: margin + 105,
    price: margin + 138,
    amount: rightX - 3,
  };

  // Table Header Bar: Wine / Burgundy (#6b1426) with Bold White Text
  doc.setFillColor(107, 20, 38); // #6b1426 deep burgundy
  doc.rect(margin, y, contentWidth, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('S/N', colX.sn, y + 5.5);
  doc.text(receipt.packageTitle ? 'DESSERT MENU / ITEM' : 'ITEM / DESCRIPTION', colX.desc, y + 5.5);
  doc.text('QUANTITY', colX.qty, y + 5.5, { align: 'center' });
  doc.text(`PRICE (${currency})`, colX.price, y + 5.5, { align: 'right' });
  doc.text(`TOTAL (${currency})`, colX.amount, y + 5.5, { align: 'right' });

  y += 8;

  // Table Items
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  receipt.items.forEach((item, index) => {
    if (y > 245) {
      doc.addPage();
      y = 20;
    }

    const rowBg = index % 2 === 1;
    if (rowBg) {
      doc.setFillColor(250, 250, 252);
      doc.rect(margin, y, contentWidth, 7.5, 'F');
    }

    // S/N column
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(148, 163, 184);
    doc.text(String(index + 1), colX.sn + 1, y + 5);

    // Item Name
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(item.name, colX.desc, y + 5, { maxWidth: 85 });

    // Quantity
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(String(item.quantity), colX.qty, y + 5, { align: 'center' });

    // Price
    doc.text(formatCurrency(item.unitPrice, currency), colX.price, y + 5, { align: 'right' });

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(formatCurrency(item.total, currency), colX.amount, y + 5, { align: 'right' });

    y += 7.5;
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y, rightX, y);
  });

  y += 4;

  // Financial Summary Section (Right-aligned)
  const summaryWidth = 85;
  const summaryX = rightX - summaryWidth;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);

  // Subtotal
  doc.text('Subtotal:', summaryX, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(formatCurrency(receipt.subtotal, currency), colX.amount, y, { align: 'right' });
  y += 5;

  // Discount
  if (receipt.discountAmount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(220, 38, 38);
    const discLabel = receipt.discountType === 'percentage' ? `Discount (${receipt.discountValue}%):` : 'Discount (Fixed):';
    doc.text(discLabel, summaryX, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`-${formatCurrency(receipt.discountAmount, currency)}`, colX.amount, y, { align: 'right' });
    y += 5;
  }

  // Tax
  if (receipt.taxRate > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Tax / VAT (${receipt.taxRate}%):`, summaryX, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(formatCurrency(receipt.taxAmount, currency), colX.amount, y, { align: 'right' });
    y += 5;
  }

  // Divider above Grand Total
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(summaryX - 2, y, rightX, y);
  y += 2.5;

  // Grand Total Highlight Box (Burgundy text #6b1426)
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(summaryX - 4, y, summaryWidth + 4, 9.5, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Grand Total:', summaryX, y + 6.5);

  doc.setFontSize(11.5);
  doc.setTextColor(107, 20, 38); // Burgundy grand total
  doc.text(formatCurrency(receipt.grandTotal, currency), colX.amount, y + 6.5, { align: 'right' });

  y += 12;

  // Amount Paid & Balance Due
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Amount Paid (${receipt.paymentMethod}):`, summaryX, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(formatCurrency(receipt.amountPaid, currency), colX.amount, y, { align: 'right' });
  y += 5;

  if (receipt.balanceDue > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9); // Amber
    doc.text('Remaining Balance Due:', summaryX, y);
    doc.text(formatCurrency(receipt.balanceDue, currency), colX.amount, y, { align: 'right' });
    y += 6;
  }

  // Special Notes & Payment Instructions (Bottom section)
  y = Math.max(y + 6, 228);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, y, rightX, y);
  y += 5;

  if (receipt.notes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('SPECIAL NOTES & TERMS:', margin, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(receipt.notes, margin, y, { maxWidth: contentWidth });
    y += 7;
  }

  if (profile.paymentInstructions) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('BANK DETAILS & PAYMENT INSTRUCTIONS:', margin, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(profile.paymentInstructions, margin, y, { maxWidth: contentWidth });
    y += 7;
  }

  // Footer Note & Watermark
  const footerText = profile.footerNote || 'Thank you for your business! Excellence in every order.';
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(footerText, pageWidth / 2, 282, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Official Commercial Record • Generated via Invoicy`, pageWidth / 2, 287, { align: 'center' });

  doc.save(`${receipt.receiptNumber || 'Receipt'}.pdf`);
}

export async function captureReceiptAsImage(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  const image = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = image;
  a.download = `${filename}.png`;
  a.click();
}

export async function shareReceipt(receipt: Receipt, profile: BusinessProfile): Promise<boolean> {
  const shareText = `${receipt.receiptType} ${receipt.receiptNumber} from ${profile.name}\nTotal: ${formatCurrency(receipt.grandTotal, profile.currencySymbol)}\nCustomer: ${receipt.customerName}\nStatus: ${receipt.paymentStatus}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `${receipt.receiptNumber} - ${profile.name}`,
        text: shareText,
      });
      return true;
    } catch {
      // User cancelled
    }
  }

  try {
    await navigator.clipboard.writeText(shareText);
    return true;
  } catch {
    return false;
  }
}
