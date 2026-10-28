import React from 'react';
import { LayoutDashboard, PlusCircle, FileText, Users, Settings } from 'lucide-react';

export type NavTab = 'dashboard' | 'create' | 'orders' | 'customers' | 'settings';

interface BottomNavBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create' as NavTab, label: 'New Receipt', icon: PlusCircle, isPrimary: true },
    { id: 'orders' as NavTab, label: 'Records', icon: FileText },
    { id: 'customers' as NavTab, label: 'Customers', icon: Users },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      className="no-print fixed bottom-0 left-0 right-0 z-40 border-t border-[#EBE4D5] dark:border-[#3A1921] bg-[#FFFDF9]/95 dark:bg-[#1E1015]/95 backdrop-blur-lg shadow-[0_-4px_25px_rgba(107,20,38,0.06)] pb-[max(env(safe-area-inset-bottom),6px)]"
      aria-label="Bottom Navigation"
    >
      <div className="max-w-4xl mx-auto w-full grid grid-cols-5 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isPrimary) {
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center justify-center -mt-3.5 group cursor-pointer focus:outline-none"
                title="Create New Receipt / Invoice"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all transform group-active:scale-95 shadow-md ${
                    isActive
                      ? 'bg-[#6B1426] text-[#F6E49E] ring-4 ring-[#F6E49E]/50 shadow-[#6B1426]/40'
                      : 'bg-[#6B1426] hover:bg-[#520E1C] text-white shadow-[#6B1426]/30'
                  }`}
                >
                  <Icon className="w-6 h-6 stroke-[2.3]" />
                </div>
                <span className="text-[10px] font-extrabold tracking-tight text-[#0A0A0A] dark:text-[#FAF7F2] mt-1">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 transition-colors group cursor-pointer focus:outline-none ${
                isActive
                  ? 'text-[#6B1426] dark:text-[#F6E49E] font-bold'
                  : 'text-[#6E685F] hover:text-[#0A0A0A] dark:text-[#FAF7F2]/60 dark:hover:text-[#FAF7F2]'
              }`}
            >
              <div
                className={`px-3 py-1 rounded-full transition-all ${
                  isActive
                    ? 'bg-[#FAF0F2] dark:bg-[#2D0E15] text-[#6B1426] dark:text-[#F6E49E]'
                    : 'group-hover:bg-[#FAF0F2]/70 dark:group-hover:bg-[#2D0E15]/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
