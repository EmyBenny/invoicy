import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Sun, Moon, Terminal, Cloud, CloudOff, CheckCircle2, RefreshCw } from 'lucide-react';
import { CloudSyncState } from '../types';

interface AndroidFrameProps {
  children: React.ReactNode;
  theme: 'light' | 'dark';
  logoUrl?: string;
  syncState?: CloudSyncState;
  onToggleTheme: () => void;
  onOpenCodeViewer: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  theme,
  logoUrl,
  syncState,
  onToggleTheme,
  onOpenCodeViewer,
}) => {
  // On desktop, user can toggle a phone preview if they want; default is full responsive!
  const [devicePreviewMode, setDevicePreviewMode] = useState(false);
  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-[#140A0D] text-[#FAF7F2]' : 'bg-[#FAF7F0] text-[#0A0A0A]'} transition-colors duration-200 flex flex-col`}>
      {/* Top Utility Header Bar: Shown ONLY on desktop (md:) to avoid double-sticky header collision on mobile */}
      <div className="no-print hidden md:flex border-b border-[#EBE4D5] dark:border-[#3A1921] bg-[#FFFDF9]/95 dark:bg-[#1E1015]/95 backdrop-blur-md px-4 sm:px-6 py-2 items-center justify-between shadow-2xs shrink-0 z-40">
        <div className="flex items-center gap-2.5 min-w-0">
          {logoUrl ? (
            <div className="w-7 h-7 rounded-lg border border-[#EBE4D5] dark:border-[#3A1921] bg-[#FFFDF9] p-0.5 flex items-center justify-center overflow-hidden shadow-2xs shrink-0">
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-[#6B1426] flex items-center justify-center text-[#F6E49E] font-black text-xs shadow-xs shrink-0">
              Iv
            </div>
          )}
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-extrabold text-sm tracking-tight text-[#0A0A0A] dark:text-white truncate">
              Invoicy
            </span>
            <span className="text-[10px] font-bold text-[#6B1426] dark:text-[#F6E49E] bg-[#FAF0F2] dark:bg-[#2D0E15] px-2 py-0.5 rounded-full border border-[#E8B6C0] dark:border-[#4E1A25] shrink-0">
              Commercial Edition
            </span>
            <span className="text-xs text-[#6E685F] hidden lg:inline">• Works Offline & Instant PDF</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Cloud Sync Status Indicator */}
          {syncState && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-xl border transition-colors ${
                syncState.status === 'synced'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : syncState.status === 'syncing'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                  : syncState.status === 'offline'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
              title={
                syncState.status === 'synced'
                  ? 'Cloud Synced: Connected to Cloud Firestore'
                  : syncState.status === 'syncing'
                  ? 'Syncing changes to Cloud Firestore...'
                  : syncState.status === 'offline'
                  ? 'Offline: Changes saved locally in Room database'
                  : 'Local Room database only'
              }
            >
              {syncState.status === 'synced' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[11px] font-bold hidden sm:inline">Cloud Synced</span>
                </>
              ) : syncState.status === 'syncing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin" />
                  <span className="text-[11px] font-bold hidden sm:inline">Syncing...</span>
                </>
              ) : syncState.status === 'offline' ? (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="text-[11px] font-bold hidden sm:inline">Offline</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] font-medium hidden sm:inline">Local Room</span>
                </>
              )}
            </div>
          )}

          {/* Kotlin Code Viewer Button */}
          <button
            onClick={onOpenCodeViewer}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-200 dark:border-emerald-800/50 cursor-pointer"
            title="Inspect Kotlin & Jetpack Compose Room Architecture"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Kotlin & Compose Code</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-xl text-[#0A0A0A] dark:text-[#FAF7F2] hover:bg-[#FAF0F2] dark:hover:bg-[#2D0E15] transition-colors cursor-pointer border border-[#EBE4D5] dark:border-[#3A1921] bg-[#FFFDF9] dark:bg-[#1E1015]"
            title="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#F6E49E]" />
            ) : (
              <Moon className="w-4 h-4 text-[#6B1426]" />
            )}
          </button>

          {/* Device Frame View Toggle on desktop */}
          <div className="flex items-center p-0.5 bg-[#FAF7F0] dark:bg-[#140A0D] rounded-xl border border-[#EBE4D5] dark:border-[#3A1921]">
            <button
              onClick={() => setDevicePreviewMode(false)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                !devicePreviewMode
                  ? 'bg-[#6B1426] text-white shadow-2xs'
                  : 'text-[#57524C] dark:text-[#FAF7F2]/70 hover:text-[#0A0A0A]'
              }`}
              title="Full responsive screen"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Full Screen</span>
            </button>
            <button
              onClick={() => setDevicePreviewMode(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                devicePreviewMode
                  ? 'bg-[#6B1426] text-white shadow-2xs'
                  : 'text-[#57524C] dark:text-[#FAF7F2]/70 hover:text-[#0A0A0A]'
              }`}
              title="Simulated phone ergonomics"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Phone Frame</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 w-full flex flex-col justify-start items-center">
        {devicePreviewMode ? (
          /* Phone Frame preview on desktop with responsive max-height and proper internal scrolling */
          <div className="py-4 px-4 w-full flex justify-center items-center flex-1">
            <div className="w-full max-w-[420px] h-[min(840px,calc(100vh-80px))] bg-[#FFFDF9] dark:bg-[#1E1015] rounded-[44px] shadow-2xl border-[10px] border-[#3A1921] overflow-hidden flex flex-col relative transition-all">
              {/* Android Status Bar */}
              <div className="no-print h-9 px-6 bg-[#140A0D] text-[#FAF7F2] flex items-center justify-between text-xs font-medium select-none shrink-0 z-30">
                <span className="font-mono text-[11px]">{currentTime}</span>
                <div className="w-3.5 h-3.5 rounded-full bg-black border border-[#3A1921]"></div>
                <div className="text-[10px] text-[#F6E49E] font-medium">5G • 100%</div>
              </div>

              {/* App Viewport with scroll */}
              <div className="flex-1 overflow-y-auto flex flex-col relative bg-[#FAF7F0] dark:bg-[#140A0D]">
                {children}
              </div>

              {/* Android Gesture Bar */}
              <div className="no-print h-4 bg-[#FFFDF9] dark:bg-[#1E1015] flex items-center justify-center shrink-0">
                <div className="w-24 h-1 rounded-full bg-[#EBE4D5] dark:bg-[#3A1921]"></div>
              </div>
            </div>
          </div>
        ) : (
          /* 100% Fluid Mobile & Tablet Layout */
          <div className="w-full flex-1 flex flex-col min-h-0 bg-[#FAF7F0] dark:bg-[#140A0D]">
            {children}
          </div>
        )}
      </main>
    </div>
  );
};
