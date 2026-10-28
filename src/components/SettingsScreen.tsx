import React, { useState, useRef, useEffect } from 'react';
import {
  Save,
  RefreshCw,
  Download,
  Upload,
  Check,
  Building2,
  DollarSign,
  Percent,
  Moon,
  Sun,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Globe,
  FileText,
  Cloud,
  CloudOff,
  CheckCircle2,
  AlertCircle,
  LogIn,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { BusinessProfile, CloudSyncState } from '../types';
import { StorageService } from '../storage/db';
import { CloudSync } from '../firebase/syncService';

interface SettingsScreenProps {
  profile: BusinessProfile;
  onSaveProfile: (profile: BusinessProfile) => void;
  onThemeToggle: () => void;
  onResetData: () => void;
  onRefreshAllData: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  profile,
  onSaveProfile,
  onThemeToggle,
  onResetData,
  onRefreshAllData,
}) => {
  const [formData, setFormData] = useState<BusinessProfile>({ ...profile });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [customCurrency, setCustomCurrency] = useState(false);
  const [syncState, setSyncState] = useState<CloudSyncState>(() => CloudSync.getState());
  const [authLoading, setAuthLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync if profile changes externally
  useEffect(() => {
    setFormData({ ...profile });
  }, [profile]);

  // Subscribe to Cloud Sync state
  useEffect(() => {
    const unsub = CloudSync.subscribeState(setSyncState);
    return () => unsub();
  }, []);

  const handleChange = (field: keyof BusinessProfile, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const loadRichysProfile = () => {
    setFormData({
      name: "RICHY'SCAKERY AND MORE",
      tagline: 'Excellence in Every Bite!',
      phone: '08104781626',
      email: 'richyscakery@gmail.com',
      address: 'No. 74 Odozi, before Osuhor, Agbor, Delta State',
      website: 'www.richyscakery.com',
      taxNumber: 'NG-RC-389104',
      currencySymbol: '₦',
      currencyCode: 'NGN',
      defaultTaxRate: 0,
      paymentInstructions: 'GTBank / Access Bank. Send proof to WhatsApp: 08104781626',
      footerNote: 'Thank you for choosing Richy’s Cakery! Excellence in Every Bite.',
      theme: formData.theme,
      logoUrl: formData.logoUrl,
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image file size must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      handleChange('logoUrl', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    handleChange('logoUrl', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      await CloudSync.signInWithGoogle();
      onRefreshAllData();
    } catch (err) {
      // Handled in CloudSync
    } finally {
      setAuthLoading(false);
    }
  };

  // Google Sign-Out
  const handleSignOut = async () => {
    if (confirm('Sign out of Google Account? Local database will remain fully available.')) {
      await CloudSync.signOut();
    }
  };

  // Toggle Cloud Sync
  const handleToggleSync = async (enabled: boolean) => {
    await CloudSync.setSyncEnabled(enabled);
  };

  // Force Sync Now
  const handleForceSync = async () => {
    await CloudSync.syncNow();
  };

  const handleExportData = () => {
    const backup = {
      profile: StorageService.getProfile(),
      receipts: StorageService.getReceipts(),
      customers: StorageService.getCustomers(),
      presets: StorageService.getPresets(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoicy_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.profile) StorageService.saveProfile(json.profile);
        if (json.receipts) StorageService.saveReceipts(json.receipts);
        if (json.customers) StorageService.saveCustomers(json.customers);
        onRefreshAllData();
        alert('Data backup successfully restored!');
      } catch (err) {
        alert('Failed to parse backup file. Please ensure it is valid JSON.');
      }
    };
    reader.readAsText(file);
  };

  const currencies = [
    { symbol: '₦', code: 'NGN', name: '₦ Nigerian Naira' },
    { symbol: '$', code: 'USD', name: '$ US Dollar' },
    { symbol: '€', code: 'EUR', name: '€ Euro' },
    { symbol: '£', code: 'GBP', name: '£ British Pound' },
    { symbol: '₹', code: 'INR', name: '₹ Indian Rupee' },
    { symbol: '¥', code: 'JPY', name: '¥ Japanese Yen' },
    { symbol: 'CA$', code: 'CAD', name: 'CA$ Canadian Dollar' },
    { symbol: 'A$', code: 'AUD', name: 'A$ Australian Dollar' },
    { symbol: 'R', code: 'ZAR', name: 'R South African Rand' },
    { symbol: '₱', code: 'PHP', name: '₱ Philippine Peso' },
    { symbol: '₵', code: 'GHS', name: '₵ Ghanaian Cedi' },
    { symbol: 'KSh', code: 'KES', name: 'KSh Kenyan Shilling' },
  ];

  return (
    <div className="flex-1 p-3 sm:p-6 pb-28 max-w-4xl mx-auto w-full">
      <form onSubmit={handleSave} className="space-y-6">

        {/* Save confirmation toast */}
        {savedSuccess && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Business settings saved! New receipts will reflect these details.</span>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">Updated</span>
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-[#FFFDF9] dark:bg-[#1E1015] rounded-2xl p-4 sm:p-5 border border-[#EBE4D5] dark:border-[#3A1921] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#0A0A0A] dark:text-white">
              Business Profile & Configuration
            </h2>
            <p className="text-xs text-[#57524C] dark:text-[#FAF7F2]/70 mt-0.5">
              Customize your business identity, tax rates, currencies, and receipt appearance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={loadRichysProfile}
              className="py-2.5 px-3.5 bg-[#FFF9E3] hover:bg-[#F6E49E] text-[#8C6D1F] dark:bg-[#2A2312] dark:text-[#F6E49E] border border-[#F6E49E] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Quickly fill with Richy's Cakery business details from sample screenshot"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E5C358]" />
              <span>Load Richy's Profile</span>
            </button>

            <button
              type="submit"
              className="py-2.5 px-5 bg-[#6B1426] hover:bg-[#520E1C] active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#6B1426]/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* CLOUD BACKUP & FIREBASE SYNC SECTION */}
        <div className="bg-[#FFFDF9] dark:bg-[#1E1015] rounded-2xl border border-[#EBE4D5] dark:border-[#3A1921] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-gradient-to-r from-[#FAF0F2] via-[#FFFDF9] to-[#FFF9E3]/50 dark:from-[#2D0E15] dark:via-[#1E1015] dark:to-[#2A2312]/30 border-b border-[#EBE4D5] dark:border-[#3A1921] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-[#6B1426] text-[#F6E49E] text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                <Cloud className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white flex items-center gap-2">
                  <span>Cloud Backup & Sync</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#FFF9E3] text-[#8C6D1F] dark:bg-[#2A2312] dark:text-[#F6E49E] border border-[#F6E49E]/50">
                    Firebase & Google
                  </span>
                </h3>
                <p className="text-xs text-[#57524C] dark:text-[#FAF7F2]/70">
                  Optional real-time synchronization with Cloud Firestore while keeping offline Room database primary
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {/* Google Authentication Box */}
            <div className="p-4 rounded-xl border border-[#EBE4D5] dark:border-[#3A1921] bg-[#FAF7F0] dark:bg-[#140A0D] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {syncState.user ? (
                <div className="flex items-center gap-3">
                  {syncState.user.photoURL ? (
                    <img
                      src={syncState.user.photoURL}
                      alt={syncState.user.displayName || 'User'}
                      className="w-10 h-10 rounded-full border border-[#EBE4D5] dark:border-[#3A1921] object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#6B1426] text-[#F6E49E] font-bold text-sm flex items-center justify-center">
                      {(syncState.user.displayName || syncState.user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-[#0A0A0A] dark:text-white">
                      {syncState.user.displayName || 'Google User'}
                    </p>
                    <p className="text-[11px] text-[#57524C] dark:text-[#FAF7F2]/70 font-mono">
                      {syncState.user.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#0A0A0A] dark:text-white">
                    Sign in with your Google Account
                  </p>
                  <p className="text-[11px] text-[#57524C] dark:text-[#FAF7F2]/70">
                    Securely access your receipts and customers across all your phones and tablets
                  </p>
                </div>
              )}

              {syncState.user ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-3.5 py-2 text-xs font-bold text-[#6B1426] hover:bg-[#FAF0F2] dark:hover:bg-[#2D0E15] border border-[#E8B6C0] dark:border-[#4E1A25] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="px-4 py-2.5 text-xs font-bold text-[#0A0A0A] dark:text-white bg-[#FFFDF9] dark:bg-[#1E1015] hover:bg-[#FAF0F2] dark:hover:bg-[#2D0E15] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl flex items-center gap-2 shadow-2xs transition-all cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{authLoading ? 'Connecting...' : 'Sign in with Google'}</span>
                </button>
              )}
            </div>

            {/* Enable Cloud Backup & Sync Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#EBE4D5] dark:border-[#3A1921] bg-[#FFFDF9] dark:bg-[#1E1015]">
              <div className="space-y-0.5 pr-2">
                <span className="text-xs font-bold text-[#0A0A0A] dark:text-white block">
                  Enable Cloud Backup & Sync
                </span>
                <span className="text-[11px] text-[#57524C] dark:text-[#FAF7F2]/70 block">
                  Keep receipts, customers, and business settings synchronized to Cloud Firestore
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={syncState.enabled}
                  onChange={(e) => handleToggleSync(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-[#6B1426]"></div>
              </label>
            </div>

            {/* Live Sync Status Indicator & Manual Sync Button */}
            <div className="p-3.5 rounded-xl border border-[#EBE4D5] dark:border-[#3A1921] bg-[#FAF7F0] dark:bg-[#140A0D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {syncState.status === 'synced' ? (
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                ) : syncState.status === 'syncing' ? (
                  <div className="w-7 h-7 rounded-lg bg-[#FFF9E3] text-[#8C6D1F] flex items-center justify-center shrink-0 animate-spin">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                ) : syncState.status === 'offline' ? (
                  <div className="w-7 h-7 rounded-lg bg-[#FFF9E3] text-[#8C6D1F] flex items-center justify-center shrink-0">
                    <CloudOff className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
                    <Cloud className="w-4 h-4" />
                  </div>
                )}

                <div>
                  <p className="text-xs font-bold text-[#0A0A0A] dark:text-slate-200">
                    {syncState.status === 'synced'
                      ? 'All records synchronized to Cloud'
                      : syncState.status === 'syncing'
                      ? 'Syncing changes to Firestore...'
                      : syncState.status === 'offline'
                      ? 'Offline Mode — Changes saved locally in Room database'
                      : syncState.user
                      ? 'Cloud sync active'
                      : 'Sign in to enable cloud backup'}
                  </p>
                  {syncState.lastSyncedAt && (
                    <p className="text-[10px] text-[#57524C] font-mono">
                      Last backup: {new Date(syncState.lastSyncedAt).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>

              {syncState.user && syncState.enabled && (
                <button
                  type="button"
                  onClick={handleForceSync}
                  className="px-3 py-1.5 text-xs font-bold text-[#6B1426] dark:text-[#F6E49E] bg-[#FFFDF9] dark:bg-[#1E1015] border border-[#EBE4D5] dark:border-[#3A1921] hover:bg-[#FAF0F2] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync Now</span>
                </button>
              )}
            </div>

            {/* Offline-First Guarantee Banner */}
            <div className="flex items-start gap-2 text-[11px] text-[#57524C] dark:text-[#FAF7F2]/70 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Offline-First Architecture:</strong> Local Room storage remains primary at all times. You can create receipts and manage customers with zero internet connection.
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 1: BUSINESS BRANDING & LOGO */}
        <div className="bg-[#FFFDF9] dark:bg-[#1E1015] rounded-2xl border border-[#EBE4D5] dark:border-[#3A1921] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-[#FAF7F0] dark:bg-[#140A0D] border-b border-[#EBE4D5] dark:border-[#3A1921] flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#6B1426] text-[#F6E49E] text-xs font-bold flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">
                Branding & Logo
              </h3>
              <p className="text-xs text-[#57524C] dark:text-[#FAF7F2]/70">
                Uploaded logo and company name appear prominently on your receipts and PDF invoices
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-5">
            {/* Logo Upload Box */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#57524C] dark:text-[#FAF7F2]/70 block mb-2">
                Business Logo
              </label>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                {/* Logo Preview */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-dashed border-[#EBE4D5] dark:border-[#3A1921] bg-[#FAF7F0] dark:bg-[#140A0D] flex items-center justify-center overflow-hidden relative group shrink-0">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Business logo preview"
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <div className="text-center p-2">
                      <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-1 opacity-60" />
                      <span className="text-[10px] text-slate-400 block font-medium">No Logo</span>
                    </div>
                  )}
                </div>

                {/* Upload & Remove Controls */}
                <div className="space-y-2 text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 bg-[#FAF0F2] hover:bg-[#F6E49E]/40 text-[#6B1426] dark:bg-[#2D0E15] dark:text-[#F6E49E] border border-[#E8B6C0] dark:border-[#4E1A25] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{formData.logoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                    </button>

                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove Logo</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-[#57524C] dark:text-[#FAF7F2]/70">
                    Supports PNG, JPG, WebP, SVG up to 2MB. Logo renders in high resolution on screen & PDF.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Business Name & Tagline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#57524C] dark:text-[#FAF7F2]/70 block mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  placeholder="e.g. Richy's Cakery & More"
                  className="w-full text-xs font-semibold bg-[#FAF7F0] dark:bg-[#140A0D] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl px-3.5 py-2.5 text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B1426]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#57524C] dark:text-[#FAF7F2]/70 block mb-1">
                  Business Tagline / Slogan
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={e => handleChange('tagline', e.target.value)}
                  placeholder="e.g. Excellence in Every Bite!"
                  className="w-full text-xs bg-[#FAF7F0] dark:bg-[#140A0D] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl px-3.5 py-2.5 text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B1426]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: CONTACT & LOCATION */}
        <div className="bg-[#FFFDF9] dark:bg-[#1E1015] rounded-2xl border border-[#EBE4D5] dark:border-[#3A1921] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-[#FAF7F0] dark:bg-[#140A0D] border-b border-[#EBE4D5] dark:border-[#3A1921] flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#6B1426] text-[#F6E49E] text-xs font-bold flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">
                Contact & Address
              </h3>
              <p className="text-xs text-[#57524C] dark:text-[#FAF7F2]/70">
                Official contact channels printed on your commercial documents
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#57524C] dark:text-[#FAF7F2]/70 block mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    placeholder="e.g. 08104781626"
                    className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-[#FAF7F0] dark:bg-[#140A0D] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B1426]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#57524C] dark:text-[#FAF7F2]/70 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="e.g. billing@company.com"
                    className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-[#FAF7F0] dark:bg-[#140A0D] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B1426]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#57524C] dark:text-[#FAF7F2]/70 block mb-1">
                Business Street Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => handleChange('address', e.target.value)}
                  placeholder="e.g. No. 74 Odozi, before Osuhor, Agbor, Delta State"
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-[#FAF7F0] dark:bg-[#140A0D] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B1426]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#57524C] dark:text-[#FAF7F2]/70 block mb-1">
                  Website URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.website}
                    onChange={e => handleChange('website', e.target.value)}
                    placeholder="e.g. www.company.com"
                    className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-[#FAF7F0] dark:bg-[#140A0D] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B1426]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#57524C] dark:text-[#FAF7F2]/70 block mb-1">
                  Tax / VAT / Business ID Number
                </label>
                <input
                  type="text"
                  value={formData.taxNumber}
                  onChange={e => handleChange('taxNumber', e.target.value)}
                  placeholder="e.g. RC-1928301 or VAT-449102"
                  className="w-full text-xs font-mono bg-[#FAF7F0] dark:bg-[#140A0D] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl px-3.5 py-2.5 text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B1426]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: CURRENCY & TAX CONFIGURATION */}
        <div className="bg-[#FFFDF9] dark:bg-[#1E1015] rounded-2xl border border-[#EBE4D5] dark:border-[#3A1921] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-[#FAF7F0] dark:bg-[#140A0D] border-b border-[#EBE4D5] dark:border-[#3A1921] flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#6B1426] text-[#F6E49E] text-xs font-bold flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">
                Currency & Tax Rate
              </h3>
              <p className="text-xs text-[#57524C] dark:text-[#FAF7F2]/70">
                Default financial formatting and automated tax rate calculations
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Currency Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#57524C] dark:text-[#FAF7F2]/70">
                    Currency Symbol & Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomCurrency(!customCurrency)}
                    className="text-[11px] font-semibold text-[#6B1426] dark:text-[#F6E49E] hover:underline cursor-pointer"
                  >
                    {customCurrency ? 'Choose from List' : 'Custom Symbol'}
                  </button>
                </div>

                {customCurrency ? (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.currencySymbol}
                      onChange={e => handleChange('currencySymbol', e.target.value)}
                      placeholder="Symbol (e.g. ₦, $, €)"
                      className="text-xs font-bold bg-[#FAF7F0] dark:bg-[#140A0D] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl px-3.5 py-2.5 text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B1426]"
                    />
                    <input
                      type="text"
                      value={formData.currencyCode}
                      onChange={e => handleChange('currencyCode', e.target.value.toUpperCase())}
                      placeholder="Code (e.g. NGN, USD)"
                      className="text-xs font-mono font-bold uppercase bg-[#FAF7F0] dark:bg-[#140A0D] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl px-3.5 py-2.5 text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B1426]"
                    />
                  </div>
                ) : (
                  <select
                    value={`${formData.currencySymbol}|${formData.currencyCode}`}
                    onChange={e => {
                      const [sym, code] = e.target.value.split('|');
                      handleChange('currencySymbol', sym);
                      handleChange('currencyCode', code);
                    }}
                    className="w-full text-xs font-semibold bg-[#FAF7F0] dark:bg-[#140A0D] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl px-3.5 py-2.5 text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B1426] cursor-pointer"
                  >
                    {currencies.map(c => (
                      <option key={c.code} value={`${c.symbol}|${c.code}`}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Default Tax Rate */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#57524C] dark:text-[#FAF7F2]/70 block mb-1">
                  Default Tax Percentage (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.defaultTaxRate}
                    onChange={e => handleChange('defaultTaxRate', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono font-bold bg-[#FAF7F0] dark:bg-[#140A0D] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl px-3.5 py-2.5 text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B1426]"
                  />
                  <Percent className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>

                <div className="flex items-center gap-1.5 pt-1.5">
                  <span className="text-[10px] text-[#57524C] font-medium">Quick set:</span>
                  {[0, 5, 7.5, 8.5, 10, 15, 20].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleChange('defaultTaxRate', r)}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-colors ${
                        formData.defaultTaxRate === r
                          ? 'bg-[#6B1426] text-white font-bold'
                          : 'bg-[#FFF9E3] dark:bg-[#2A2312] text-[#0A0A0A] dark:text-[#FAF7F2] border border-[#EBE4D5] dark:border-[#3A1921]'
                      }`}
                    >
                      {r}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: PAYMENT DETAILS & FOOTER NOTES */}
        <div className="bg-[#FFFDF9] dark:bg-[#1E1015] rounded-2xl border border-[#EBE4D5] dark:border-[#3A1921] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-[#FAF7F0] dark:bg-[#140A0D] border-b border-[#EBE4D5] dark:border-[#3A1921] flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#6B1426] text-[#F6E49E] text-xs font-bold flex items-center justify-center shrink-0">
              4
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">
                Payment Instructions & Receipt Footer
              </h3>
              <p className="text-xs text-[#57524C] dark:text-[#FAF7F2]/70">
                Bank account instructions and customer thank you messages printed on receipts
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#57524C] dark:text-[#FAF7F2]/70 block mb-1">
                Bank / Wire / Payment Settlement Details
              </label>
              <textarea
                rows={2}
                value={formData.paymentInstructions}
                onChange={e => handleChange('paymentInstructions', e.target.value)}
                placeholder="e.g. Bank Account: GTBank #0129384756. Send proof to WhatsApp: 08104781626"
                className="w-full text-xs bg-[#FAF7F0] dark:bg-[#140A0D] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl p-3 text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B1426]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#57524C] dark:text-[#FAF7F2]/70 block mb-1">
                Receipt Footer Closing Message
              </label>
              <input
                type="text"
                value={formData.footerNote}
                onChange={e => handleChange('footerNote', e.target.value)}
                placeholder="e.g. Thank you for your business! Excellence in Every Bite."
                className="w-full text-xs bg-[#FAF7F0] dark:bg-[#140A0D] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl px-3.5 py-2.5 text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B1426]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: APP APPEARANCE (THEME) */}
        <div className="bg-[#FFFDF9] dark:bg-[#1E1015] rounded-2xl border border-[#EBE4D5] dark:border-[#3A1921] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-[#FAF7F0] dark:bg-[#140A0D] border-b border-[#EBE4D5] dark:border-[#3A1921] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#6B1426] text-[#F6E49E] text-xs font-bold flex items-center justify-center shrink-0">
                5
              </span>
              <div>
                <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">
                  App Appearance
                </h3>
                <p className="text-xs text-[#57524C] dark:text-[#FAF7F2]/70">
                  Choose between Light and Dark interface modes
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onThemeToggle}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#FAF0F2] hover:bg-[#F6E49E]/40 text-[#6B1426] dark:bg-[#2D0E15] dark:text-[#F6E49E] border border-[#E8B6C0] dark:border-[#4E1A25] transition-colors cursor-pointer shadow-2xs"
            >
              {profile.theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-[#F6E49E]" />
                  <span>Switch to Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-[#6B1426]" />
                  <span>Switch to Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* SECTION 6: LOCAL STORAGE & DATA MANAGEMENT */}
        <div className="bg-[#FFFDF9] dark:bg-[#1E1015] rounded-2xl border border-[#EBE4D5] dark:border-[#3A1921] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-[#FAF7F0] dark:bg-[#140A0D] border-b border-[#EBE4D5] dark:border-[#3A1921] flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#6B1426] text-[#F6E49E] text-xs font-bold flex items-center justify-center shrink-0">
              6
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">
                Data Storage & Offline Backups
              </h3>
              <p className="text-xs text-[#57524C] dark:text-[#FAF7F2]/70">
                Export offline JSON backup files or restore previously saved records
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExportData}
                className="py-3 px-4 text-xs font-bold text-[#0A0A0A] dark:text-[#FAF7F2] bg-[#FAF7F0] hover:bg-[#FAF0F2] dark:bg-[#140A0D] dark:hover:bg-[#2D0E15] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-all"
              >
                <Download className="w-4 h-4 text-[#6B1426] dark:text-[#F6E49E]" />
                <span>Export Full Backup (JSON)</span>
              </button>

              <label className="py-3 px-4 text-xs font-bold text-[#0A0A0A] dark:text-[#FAF7F2] bg-[#FAF7F0] hover:bg-[#FAF0F2] dark:bg-[#140A0D] dark:hover:bg-[#2D0E15] border border-[#EBE4D5] dark:border-[#3A1921] rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-all">
                <Upload className="w-4 h-4 text-[#6B1426] dark:text-[#F6E49E]" />
                <span>Restore Backup File</span>
                <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
              </label>
            </div>

            <div className="pt-3 border-t border-[#EBE4D5] dark:border-[#3A1921] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-[11px] text-[#57524C]">
                Want to reset all database records to the initial demo data?
              </span>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset all receipts and customers to the default commercial sample data?')) {
                    onResetData();
                  }
                }}
                className="text-xs font-bold text-[#6B1426] dark:text-[#F6E49E] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Sample Commercial Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM SAVE BUTTON */}
        <div className="sticky bottom-2 z-20">
          <button
            type="submit"
            className="w-full py-4 bg-[#6B1426] hover:bg-[#520E1C] active:scale-98 text-white rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-[#6B1426]/25 transition-all cursor-pointer"
          >
            <Save className="w-5 h-5" />
            <span>Save All Changes</span>
          </button>
        </div>

      </form>
    </div>
  );
};
