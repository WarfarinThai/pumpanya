import React, { useState } from 'react';

interface WelcomeGateProps {
  onAccept: () => void;
}

export default function WelcomeGate({ onAccept }: WelcomeGateProps) {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="min-h-screen bg-[#fcf9f4] flex flex-col justify-center items-center px-4 py-8 max-w-md mx-auto animate-fade-in">
      
      {/* Brand Card */}
      <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-border-default flex flex-col items-center text-center">
        
        {/* Emblem Logo */}
        <div className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center p-2 mb-3 shadow-sm border border-brand-border-subtle overflow-hidden">
          <img
            src="/logo.png"
            alt="ภูมิปัญญา | PUM PANYA"
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Title */}
        <span className="text-xs font-bold text-brand-secondary bg-brand-surface px-3 py-1 rounded-full border border-brand-border-subtle tracking-wide mb-1.5">
          Old Wisdom. New Vibes. • ภูมิปัญญาเก่า แต่เล่าใหม่
        </span>
        <h1 className="text-2xl font-bold text-brand-primary mt-1">
          ภูมิปัญญา | PUM PANYA
        </h1>
        <p className="text-xs font-semibold text-text-muted mt-0.5">
          Thai Herbal Wisdom, With You.
        </p>

        {/* Core Pillars (5 Highlights) */}
        <div className="w-full mt-5 text-left flex flex-col gap-2.5">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <span aria-hidden="true" className="material-symbols-outlined text-emerald-700 text-lg shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
              health_and_safety
            </span>
            <div className="flex flex-col text-xs leading-relaxed">
              <strong className="text-brand-primary font-bold">1. ป้องกันพิษต่อตับและไต</strong>
              <span className="text-text-secondary mt-0.5">เตือนระยะเวลาทานยาที่ปลอดภัย ไม่ทานติดต่อกันนานเกินจำเป็น</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <span aria-hidden="true" className="material-symbols-outlined text-amber-700 text-lg shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
              balance
            </span>
            <div className="flex flex-col text-xs leading-relaxed">
              <strong className="text-brand-primary font-bold">2. แยกธาตุเกิด VS ธาตุปัจจุบัน</strong>
              <span className="text-text-secondary mt-0.5">แก้ไขอาการเจ็บป่วยปัจจุบันก่อนธาตุกำเนิด</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <span aria-hidden="true" className="material-symbols-outlined text-rose-700 text-lg shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
              warning
            </span>
            <div className="flex flex-col text-xs leading-relaxed">
              <strong className="text-brand-primary font-bold">3. สกัดกั้นยาตีกัน (High Alert)</strong>
              <span className="text-text-secondary mt-0.5">ตรวจจับปฏิกิริยาระหว่างสมุนไพรกับยาประจำตัว และรสยาขัดกัน</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <span aria-hidden="true" className="material-symbols-outlined text-blue-700 text-lg shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
            <div className="flex flex-col text-xs leading-relaxed">
              <strong className="text-brand-primary font-bold">4. ตรวจสอบทะเบียนยาแผนโบราณ</strong>
              <span className="text-text-secondary mt-0.5">เช็กเลขทะเบียนตัวยา G สังเกตยาปลอม และระวังสารสเตียรอยด์ปนเปื้อน</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <span aria-hidden="true" className="material-symbols-outlined text-teal-700 text-lg shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
              routine
            </span>
            <div className="flex flex-col text-xs leading-relaxed">
              <strong className="text-brand-primary font-bold">5. รับมือไข้เปลี่ยนฤดู (หัวลมไหว)</strong>
              <span className="text-text-secondary mt-0.5">คำแนะนำปรับอาหารและเครื่องดื่มล่วงหน้าตามหลักกาลสมุฏฐาน</span>
            </div>
          </div>
        </div>

        {/* Medical Disclaimer Box */}
        <div className="mt-4 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-left">
          <div className="flex items-center gap-1.5 text-amber-950 font-bold text-sm">
            <span aria-hidden="true" className="material-symbols-outlined text-base">shield</span>
            <span>ข้อกำหนดทางการแพทย์</span>
          </div>
          <p className="text-sm text-amber-950 leading-relaxed mt-1.5">
            ข้อมูลในระบบนี้เป็นเครื่องมือคัดกรองเบื้องต้นตามหลักเภสัชกรรมแผนไทยและการแพทย์ผสมผสาน ไม่สามารถใช้ทดแทนการตรวจวินิจฉัย ใบสั่งยา หรือคำแนะนำโดยตรงจากแพทย์และเภสัชกร
          </p>
        </div>

        {/* Locked Checkbox Consent */}
        <label className="flex items-start gap-3 cursor-pointer mt-4 select-none text-left w-full p-2 rounded-xl hover:bg-neutral-50 transition-colors">
          <input 
            type="checkbox" 
            checked={isChecked} 
            onChange={(e) => setIsChecked(e.target.checked)}
            className="w-5 h-5 rounded border-neutral-600 text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary mt-0.5 shrink-0"
          />
          <span className="text-sm font-bold text-text-primary leading-relaxed">
            ข้าพเจ้าเข้าใจวัตถุประสงค์และข้อกำหนดการใช้งานระบบ ภูมิปัญญา | PUM PANYA แล้ว
          </span>
        </label>

        {/* Action Button */}
        <button
          type="button"
          onClick={onAccept}
          disabled={!isChecked}
          className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-3 shadow-md transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 ${
            isChecked
              ? 'bg-brand-primary hover:bg-brand-hover text-white cursor-pointer'
              : 'bg-neutral-300 text-neutral-500 cursor-not-allowed opacity-60'
          }`}
        >
          <span>ยอมรับและเริ่มใช้งาน</span>
          <span aria-hidden="true" className="material-symbols-outlined text-base">arrow_forward</span>
        </button>

      </div>

    </div>
  );
}
