import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Customer } from '../types';

interface CustomerModalProps {
  customer?: Customer | null;
  onSave: (customerData: Omit<Customer, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  customer,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [address, setAddress] = useState(customer?.address || '');
  const [taxNumber, setTaxNumber] = useState(customer?.taxNumber || '');
  const [notes, setNotes] = useState(customer?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      taxNumber: taxNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFDF9] dark:bg-[#1E1015] rounded-2xl max-w-md w-full shadow-2xl border border-[#EBE4D5] dark:border-[#3A1921] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#EBE4D5] dark:border-[#3A1921] flex items-center justify-between">
          <h3 className="font-extrabold text-base text-[#0A0A0A] dark:text-[#FFFDF9]">
            {customer ? 'Edit Customer' : 'Add New Customer'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-[#FFFDF9] rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#0A0A0A]/70 dark:text-[#EBE4D5] block mb-1">
              Customer / Business Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Corp or John Smith"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-xs bg-[#FAF7F0] dark:bg-[#28151B] border border-[#EBE4D5] dark:border-[#4A202A] rounded-lg px-3 py-2 text-[#0A0A0A] dark:text-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#6B1426]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-[#0A0A0A]/70 dark:text-[#EBE4D5] block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full text-xs bg-[#FAF7F0] dark:bg-[#28151B] border border-[#EBE4D5] dark:border-[#4A202A] rounded-lg px-3 py-2 text-[#0A0A0A] dark:text-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#6B1426]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#0A0A0A]/70 dark:text-[#EBE4D5] block mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="billing@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full text-xs bg-[#FAF7F0] dark:bg-[#28151B] border border-[#EBE4D5] dark:border-[#4A202A] rounded-lg px-3 py-2 text-[#0A0A0A] dark:text-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#6B1426]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#0A0A0A]/70 dark:text-[#EBE4D5] block mb-1">
              Physical / Billing Address
            </label>
            <input
              type="text"
              placeholder="Suite, Street, City, State/ZIP"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full text-xs bg-[#FAF7F0] dark:bg-[#28151B] border border-[#EBE4D5] dark:border-[#4A202A] rounded-lg px-3 py-2 text-[#0A0A0A] dark:text-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#6B1426]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#0A0A0A]/70 dark:text-[#EBE4D5] block mb-1">
              Tax ID / VAT Registration (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. VAT-892184"
              value={taxNumber}
              onChange={e => setTaxNumber(e.target.value)}
              className="w-full text-xs bg-[#FAF7F0] dark:bg-[#28151B] border border-[#EBE4D5] dark:border-[#4A202A] rounded-lg px-3 py-2 text-[#0A0A0A] dark:text-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#6B1426]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#0A0A0A]/70 dark:text-[#EBE4D5] block mb-1">
              Internal Customer Notes
            </label>
            <textarea
              rows={2}
              placeholder="Special billing terms, preferences, etc."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full text-xs bg-[#FAF7F0] dark:bg-[#28151B] border border-[#EBE4D5] dark:border-[#4A202A] rounded-lg p-2 text-[#0A0A0A] dark:text-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#6B1426]"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold text-[#0A0A0A] dark:text-[#FAF7F0] bg-[#FAF7F0] hover:bg-[#EBE4D5] dark:bg-[#28151B] dark:hover:bg-[#3A1921] border border-[#EBE4D5] dark:border-[#4A202A] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-2 py-2 text-xs font-extrabold text-white bg-[#6B1426] hover:bg-[#520E1C] rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{customer ? 'Update Customer' : 'Save Customer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
