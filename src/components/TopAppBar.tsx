import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface TopAppBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  subtitle,
  onBack,
  actions,
}) => {
  return (
    <header className="no-print sticky top-[48px] sm:top-[53px] z-30 bg-[#FFFDF9]/95 dark:bg-[#1E1015]/95 backdrop-blur-md border-b border-[#EBE4D5] dark:border-[#3A1921] px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-center gap-2.5 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 rounded-full text-[#6B1426] dark:text-[#F6E49E] hover:bg-[#FAF0F2] dark:hover:bg-[#2D0E15] transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#0A0A0A] dark:text-white truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[#57524C] dark:text-[#FAF7F2]/70 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actions && <div className="flex items-center gap-1.5 shrink-0">{actions}</div>}
    </header>
  );
};
