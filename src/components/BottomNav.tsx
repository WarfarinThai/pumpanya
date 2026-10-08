import React from 'react';

interface BottomNavProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
}

export default function BottomNav({ currentTab, onChangeTab }: BottomNavProps) {
  const tabs = [
    {
      id: 'home',
      label: 'หน้าหลัก',
      icon: 'home',
      action: () => onChangeTab('home')
    },
    {
      id: 'organ-safety',
      label: 'ตับ/ไต',
      icon: 'health_and_safety',
      action: () => onChangeTab('organ-safety')
    },
    {
      id: 'elements',
      label: 'ปรับธาตุ',
      icon: 'balance',
      action: () => onChangeTab('elements')
    },
    {
      id: 'interaction',
      label: 'ยาตีกัน',
      icon: 'warning',
      action: () => onChangeTab('interaction')
    },
    {
      id: 'g2c-season',
      label: 'ยาแท้/ฤดู',
      icon: 'verified',
      action: () => onChangeTab('g2c-season')
    }
  ];

  return (
    <nav
      aria-label="เมนูหลัก"
      className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-white/95 backdrop-blur-xl border-t border-border-default shadow-nav"
    >
      <div className="flex justify-around items-center h-16 lg:h-14 px-1 md:px-6 lg:px-8 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">
        {tabs.map((tab) => {
          const active = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={tab.action}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col lg:flex-row items-center justify-center gap-0.5 lg:gap-2 min-w-[60px] min-h-[44px] px-1.5 lg:px-4 h-12 lg:h-11 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                active 
                  ? 'text-brand-primary font-semibold bg-brand-tint/35' 
                  : 'text-text-muted hover:text-text-primary hover:bg-neutral-50 font-medium'
              }`}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: active ? "'FILL' 1" : undefined }}>
                {tab.icon}
              </span>
              <span className="text-xs leading-tight whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
