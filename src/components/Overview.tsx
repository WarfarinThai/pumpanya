import React, { useState } from 'react';

interface OverviewProps {
  onStart: () => void;
}

export default function Overview({ onStart }: OverviewProps) {
  const [consentChecked, setConsentChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const handleStart = () => {
    if (!consentChecked) return;
    setLoading(true);
    setTimeout(() => {
      onStart();
    }, 600);
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-md mx-auto animate-fade-in">
      
      {/* Premium Minimalist Hero Card */}
      <div className="w-full bg-white rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col items-center text-center border border-border-default/60">
        
        {/* Emblem */}
        <div className="relative w-20 h-20 rounded-full bg-surface-muted flex items-center justify-center p-1 mb-4 border border-brand-gold/20">
          <img 
            alt="ภูมิปัญญา | PUM PANYA" 
            className="w-full h-full object-contain rounded-full" 
            src="/logo.png"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Title */}
        <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-brand-tint/30 text-brand-primary font-bold text-xs uppercase tracking-wider mb-2">
          <span aria-hidden="true" className="material-symbols-outlined text-xs">eco</span>
          <span>Digital Twin Platform</span>
        </span>
        <h1 className="text-2xl text-brand-primary font-bold tracking-tight">
          ภูมิปัญญา | PUM PANYA
        </h1>
        <p className="text-xs text-brand-secondary font-bold tracking-wide mt-1">
          ระบบคัดกรองความปลอดภัยสมุนไพรไทยเฉพาะบุคคล
        </p>
        <p className="text-xs text-text-secondary max-w-xs mt-3 leading-relaxed">
          จำลองความปลอดภัย ป้องกันภาวะยาตีกัน (Drug-Herb Interactions) และปรับสมดุลสุขภาพของคุณแบบอัจฉริยะ
        </p>

        {/* Visual Banner Accent */}
        <div className="w-full mt-5 rounded-xl overflow-hidden relative h-24 shadow-sm">
          <img 
            className="w-full h-full object-cover" 
            alt="Thai medicinal herbs" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhXaTwRRw1HpgV0uVKiFAkfjrSLAK02MI-uDJImgIv2pNtr9APzcMixt6XR7Lmg6qJktyKyzXdk3XjudFy7MepuPAHhisQvgiNp_1DS7IzYXd9eDScN0rY-hNAuLzRBsO4Uk_PPS9OFnebATehnmTgpimqTd-TnEN_-FWQwvzSXhfTXYVWN070ORj4-inWe-afaTNXAVXf9NR9XVdZnJUKJBTJefOHVYHNTTW_ohtJ37tc0ORuKzoB"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/90 to-transparent flex items-end p-2.5">
            <span className="text-xs text-white font-semibold flex items-center gap-1">
              <span aria-hidden="true" className="material-symbols-outlined text-xs text-brand-badge">verified</span>
              มาตรฐานข้อมูลเภสัชพฤกษศาสตร์ไทย (TTM Clinical Evidence)
            </span>
          </div>
        </div>
      </div>

      {/* Simplified Benefits Grid */}
      <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-border-default/40">
        <h2 className="text-xs font-bold text-text-muted tracking-wider mb-3 text-center">3 ขั้นตอนสู่ความปลอดภัยสูงสุด</h2>
        <div className="grid grid-cols-3 gap-2">
          
          <div className="flex flex-col items-center text-center p-2 rounded-xl bg-neutral-50/50">
            <div className="w-8 h-8 rounded-full bg-brand-tint/40 flex items-center justify-center text-brand-primary mb-2">
              <span aria-hidden="true" className="material-symbols-outlined text-base">person</span>
            </div>
            <strong className="text-xs text-text-primary font-bold">1. สร้างโปรไฟล์</strong>
            <span className="text-xs text-text-muted mt-0.5">ระบุอายุและยาเดิม</span>
          </div>

          <div className="flex flex-col items-center text-center p-2 rounded-xl bg-neutral-50/50">
            <div className="w-8 h-8 rounded-full bg-brand-tint/40 flex items-center justify-center text-brand-primary mb-2">
              <span aria-hidden="true" className="material-symbols-outlined text-base">eco</span>
            </div>
            <strong className="text-xs text-text-primary font-bold">2. เลือกสมุนไพร</strong>
            <span className="text-xs text-text-muted mt-0.5">ระบุชื่อหรือตำรับยา</span>
          </div>

          <div className="flex flex-col items-center text-center p-2 rounded-xl bg-neutral-50/50">
            <div className="w-8 h-8 rounded-full bg-brand-tint/40 flex items-center justify-center text-brand-primary mb-2">
              <span aria-hidden="true" className="material-symbols-outlined text-base">verified_user</span>
            </div>
            <strong className="text-xs text-text-primary font-bold">3. รับผลจำลอง</strong>
            <span className="text-xs text-text-muted mt-0.5">คัดกรองความเสี่ยง</span>
          </div>

        </div>
      </div>

      {/* Simplified Consent / Privacy notice */}
      <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-border-default/40 flex flex-col gap-3">
        <label className="flex items-start gap-3 cursor-pointer select-none group">
          <div className="relative flex items-center justify-center shrink-0 w-6 h-6 mt-0.5">
            <input 
              type="checkbox" 
              checked={consentChecked} 
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="peer sr-only"
            />
            <div className="w-5 h-5 rounded-md bg-neutral-100 peer-checked:bg-brand-primary border border-neutral-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-primary transition-all flex items-center justify-center shadow-inner">
              <span aria-hidden="true" className="material-symbols-outlined text-white text-xs opacity-0 peer-checked:opacity-100 transition-opacity font-bold">
                check
              </span>
            </div>
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold text-text-primary leading-snug block">
              ฉันเข้าใจว่านี่คือระบบคัดกรองทางเทคโนโลยี และยอมรับการวิเคราะห์เบื้องต้น
            </span>
            <span className="text-xs text-text-muted block mt-0.5 leading-relaxed">
              ข้อมูลทั้งหมดจะประมวลผลบนเบราว์เซอร์ส่วนตัว ไม่มีการบันทึกระบุตัวตนของคุณ
            </span>
          </div>
        </label>
      </div>

      {/* Collapsible Disclaimer / Standards Box */}
      <div className="bg-white rounded-xl border border-border-default/40 overflow-hidden shadow-sm">
        <button 
          type="button"
          onClick={() => setShowDisclaimer(!showDisclaimer)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-brand-secondary hover:bg-neutral-50 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <span aria-hidden="true" className="material-symbols-outlined text-sm">shield</span>
            <span>ข้อจำกัดความรับผิดชอบและมาตรฐานข้อมูล</span>
          </div>
          <span aria-hidden="true" className="material-symbols-outlined text-xs transition-transform duration-200">
            {showDisclaimer ? 'expand_less' : 'expand_more'}
          </span>
        </button>
        
        {showDisclaimer && (
          <div className="px-4 pb-4 text-sm text-text-secondary leading-relaxed border-t border-neutral-100 pt-3 space-y-2 bg-neutral-50/50">
            <p>
              • <strong>ความยินยอมทางคลินิก:</strong> ระบบนี้เป็นเครื่องมือคัดกรองเพื่อการวิเคราะห์เบื้องต้น ไม่สามารถนำมาใช้แทนใบสั่งยา หรือแทนคำปรึกษาโดยตรงจากแพทย์และเภสัชกรผู้รักษาได้
            </p>
            <p>
              • <strong>มาตรฐานข้อมูล:</strong> พัฒนาขึ้นโดยอ้างอิงประกาศกระทรวงสาธารณสุข มาตรฐานตำรับยาสมุนไพรและตำรายาของประเทศไทย ร่วมกับฐานข้อมูลสารออกฤทธิ์ทางชีวภาพ
            </p>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button 
        type="button"
        onClick={handleStart}
        disabled={!consentChecked || loading}
        className={`w-full h-12 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] ${
          consentChecked 
            ? 'bg-brand-primary cursor-pointer hover:bg-brand-hover' 
            : 'bg-neutral-300 cursor-not-allowed opacity-60'
        }`}
      >
        {loading ? (
          <>
            <span aria-hidden="true" className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
            <span>กำลังเตรียมแบบประเมิน...</span>
          </>
        ) : (
          <>
            <span>เริ่มคัดกรองข้อมูลสุขภาพของคุณ</span>
            <span aria-hidden="true" className="material-symbols-outlined text-xs">arrow_forward</span>
          </>
        )}
      </button>

      {/* Clinical Footnote */}
      <p className="text-xs text-text-muted text-center leading-relaxed">
        พัฒนาขึ้นตามหลักเภสัชกรรมแผนไทยแห่งชาติ ร่วมกับมาตรฐานข้อมูลแพทย์ยุคดิจิทัล
      </p>

    </div>
  );
}
