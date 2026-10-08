import React, { useState } from 'react';
import InfoDialog from './InfoDialog';

interface HeaderProps {
  onExit?: () => void;
  showExit?: boolean;
}

export default function Header({ onExit, showExit = false }: HeaderProps) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-b border-border-default shadow-header pt-[max(env(safe-area-inset-top),0.75rem)] pb-2.5">
        <div className="px-4 md:px-6 lg:px-8 flex items-center justify-between max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center p-1 shrink-0 border border-brand-border-subtle shadow-xs overflow-hidden">
              <img
                src="/logo.png"
                alt="ภูมิปัญญา | PUM PANYA"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-thai-header text-lg sm:text-xl text-brand-primary font-bold leading-none tracking-tight">
                  ภูมิปัญญา | PUM PANYA
                </span>
              </div>
              <span className="text-[11px] sm:text-xs font-medium text-text-muted truncate mt-0.5">
                Old Wisdom. New Vibes. • ภูมิปัญญาเก่า แต่เล่าใหม่
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button 
              type="button"
              aria-label="ข้อกำหนดและคำชี้แจงทางการแพทย์" 
              aria-haspopup="dialog"
              aria-expanded={isAboutOpen}
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-text-secondary hover:bg-neutral-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              onClick={() => setIsAboutOpen(true)}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[22px]">help_outline</span>
            </button>

            <div className="w-9 h-9 rounded-full bg-emerald-100 text-brand-primary border border-emerald-300 flex items-center justify-center" aria-hidden="true">
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
          </div>
        </div>
      </header>

      <InfoDialog
        isOpen={isAboutOpen}
        title="เกี่ยวกับระบบ ภูมิปัญญา | PUM PANYA"
        subtitle="ข้อกำหนดและคำชี้แจงทางการแพทย์"
        closeLabel="ปิด"
        onClose={() => setIsAboutOpen(false)}
      >
        <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-text-primary font-medium">
          ภูมิปัญญา | PUM PANYA: ระบบช่วยคัดกรองความปลอดภัยสมุนไพรเฉพาะบุคคล เพื่อป้องกันอันตรายต่อตับและไต ป้องกันยาตีกัน และปรับสมดุลธาตุตามหลักกาลสมุฏฐาน
        </div>
      </InfoDialog>
    </>
  );
}
