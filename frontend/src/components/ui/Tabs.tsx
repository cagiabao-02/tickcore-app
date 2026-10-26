/**
 * Component tab dùng chung.
 * Hỗ trợ điều hướng bằng bàn phím và aria-selected.
 */
import { type ReactNode } from 'react';

interface Tab {
  key: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
  variant?: 'default' | 'pill';
}

export default function Tabs({ tabs, activeTab, onChange, variant = 'default' }: TabsProps) {
  return (
    <div
      className={`flex gap-1 ${
        variant === 'pill' ? 'bg-secondary rounded-xl p-1' : 'border-b border-base-primary'
      }`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`
              flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
              ${
                variant === 'pill'
                  ? isActive
                    ? 'bg-card text-base-primary rounded-lg shadow-theme-sm'
                    : 'text-base-secondary hover:text-base-primary'
                  : isActive
                    ? 'text-primary-600 border-b-2 border-primary-600 -mb-px'
                    : 'text-base-secondary hover:text-base-primary'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
