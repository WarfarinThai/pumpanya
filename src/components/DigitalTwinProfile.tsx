import React, { useState } from 'react';
import { HealthProfile } from '../types';

interface DigitalTwinProfileProps {
  profile: HealthProfile;
  onEdit: () => void;
  onProceed: () => void;
}

export default function DigitalTwinProfile({ profile, onEdit, onProceed }: DigitalTwinProfileProps) {
  const [showDetailedTTM, setShowDetailedTTM] = useState(false);

  // Extract profiles
  const hasMetformin = profile.medications.some(m => m.name.toLowerCase().includes('metformin'));
  const hasAmlodipine = profile.medications.some(m => m.name.toLowerCase().includes('amlodipine'));
  const hasUnknown = profile.medications.some(m => m.isUnknown);

  return (
    <div className="w-full flex flex-col gap-5 max-w-md mx-auto pb-10 animate-fade-in">
      
      {/* Dashboard Brand Header */}
      <div className="text-center py-1 flex flex-col items-center gap-1">
        <span className="inline-flex items-center gap-1 bg-brand-tint/30 text-brand-primary text-xs font-bold px-3 py-1 rounded-full border border-brand-secondary/10">
          <span aria-hidden="true" className="material-symbols-outlined text-[14px] animate-pulse">analytics</span>
          <span>โมเดลบุคคลจำลอง (Personal Digital Twin)</span>
        </span>
        <h2 className="text-2xl font-bold text-brand-primary">ฝาแฝดสุขภาพของคุณ</h2>
        <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
          โครงสร้างโปรไฟล์สุขภาพองค์รวมที่นำมาใช้เป็นฐานจำลองการใช้ยาสมุนไพรอย่างปลอดภัย
        </p>
      </div>

      {/* Main Core Diagnostic Card */}
      <div className="w-full bg-white rounded-2xl p-5 shadow-sm border border-border-default/50 flex flex-col gap-4 relative overflow-hidden">
        
        {/* Patient Identity */}
        <div className="flex items-center justify-between border-b pb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center shrink-0">
              <span aria-hidden="true" className="material-symbols-outlined text-lg">clinical_suite</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-text-muted uppercase font-bold tracking-wider leading-none">ID: TH-TWIN-8290</span>
              <span className="text-sm font-bold text-text-primary truncate mt-1">
                {profile.ageRange ? `ผู้ประเมิน (อายุ ${profile.ageRange})` : 'ผู้ประเมิน (ยังไม่ได้ระบุช่วงอายุ)'}
              </span>
            </div>
          </div>
          
          <span className="text-xs font-bold text-brand-secondary bg-brand-tint/30 px-2.5 py-1 rounded-lg shrink-0">
            วิเคราะห์พร้อมทดสอบ
          </span>
        </div>

        {/* Dynamic Balance Summary */}
        <div className="bg-surface-muted p-3 rounded-xl border border-border-default/50 flex flex-col items-center text-center gap-0.5">
          <span className="text-xs text-text-muted font-bold">สถานะสมดุลปฐมภูมิ (Primary Body Status)</span>
          <span className="text-sm font-bold text-brand-primary">
            {profile.currentSymptoms.some(s => s.includes('ท้องอืด'))
              ? 'ระบบธาตุลมคั่งค้างในลำไส้ / เฝ้าระวังยาตีกันระดับปานกลาง'
              : 'สมดุลทั่วไปมีเสถียรภาพ / พร้อมทดสอบรสยาคัดกรอง'}
          </span>
        </div>

        {/* Clean Metric Grid Tiles */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 flex flex-col gap-0.5">
            <span className="text-xs text-text-muted font-bold">โรคคัดกรองพบ</span>
            <span className="text-xs font-bold text-danger-primary truncate">
              {profile.chronicConditions.length > 0 ? profile.chronicConditions.join(', ') : 'ไม่มีรายงาน'}
            </span>
          </div>
          
          <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 flex flex-col gap-0.5">
            <span className="text-xs text-text-muted font-bold">ยาที่ใช้อยู่ประจำ</span>
            <span className="text-xs font-bold text-neutral-800 truncate">
              {profile.medications.length} รายการ (เฝ้าระวัง)
            </span>
          </div>

          <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 flex flex-col gap-0.5">
            <span className="text-xs text-text-muted font-bold">เด่นแผนไทย</span>
            <span className="text-xs font-bold text-brand-secondary truncate">วาโยธาตุ (ลมเด่น)</span>
          </div>

          <div className="bg-warning-bg/40 p-3 rounded-xl border border-warning-border/20 flex flex-col gap-0.5">
            <span className="text-xs text-warning-text font-bold">ประเด็นเสี่ยง</span>
            <span className="text-xs font-bold text-warning-text truncate">
              {hasUnknown ? 'มียาสมุนไพรซองไม่ทราบชื่อ' : 'เฝ้าระวังยาตีกัน'}
            </span>
          </div>
        </div>

      </div>

      {/* Dim 1: Medication & Disease Badges (Tag View instead of Paragraphs) */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-border-default/40 flex flex-col gap-3">
        <h3 className="text-xs font-bold text-text-muted">มิติที่ 1: รายการยาแผนปัจจุบันและโรคเดิมของคุณ</h3>
        
        {/* Diseases Badges Row */}
        <div className="flex flex-wrap gap-1">
          {profile.chronicConditions.map((c) => (
            <span key={c} className="text-xs font-bold bg-danger-primary/10 text-danger-primary px-2.5 py-1 rounded-full border border-danger-primary/20">
              {c}
            </span>
          ))}
          {profile.chronicConditions.length === 0 && (
            <span className="text-xs text-neutral-600">ไม่มีรายงานโรคประจำตัว</span>
          )}
        </div>

        {/* Medications list layout */}
        <div className="space-y-1.5 mt-1">
          {profile.medications.length > 0 ? (
            profile.medications.map((m) => (
              <div key={m.id} className="flex flex-col gap-0.5 text-xs p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-blue-700 shrink-0">
                      medication
                    </span>
                    <span className="font-bold text-neutral-900 truncate">{m.name}</span>
                  </div>
                  <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded shrink-0">
                    เฝ้าระวังยาตีกัน
                  </span>
                </div>
                {m.notes && (
                  <p className="text-xs text-neutral-500 pl-6 line-clamp-1">
                    {m.notes}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-xs text-neutral-500 bg-neutral-50 rounded-xl border border-neutral-100">
              ✓ ไม่ได้รับประทานยาแผนปัจจุบันเป็นประจำ
            </div>
          )}
        </div>
      </div>

      {/* Dim 2: Traditional Elements Dashboard Balancing */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-border-default/40 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-text-muted">มิติที่ 2: ดุลธาตุพื้นฐานทางคลินิกแผนไทย</h3>
          <span className="text-xs text-brand-secondary font-bold">คัมภีร์เวชศาสตร์สมุนไพร</span>
        </div>

        {/* Element status balances rows (Highly simplified) */}
        <div className="space-y-2">
          
          <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/40 border border-emerald-100">
            <span className="text-xs font-bold text-brand-primary flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>ธาตุลม (วาโยธาตุ)</span>
            </span>
            <span className="text-xs text-brand-secondary font-bold">คั่งค้าง / แน่นท้องบ่อย</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/40 border border-amber-100">
            <span className="text-xs font-bold text-warning-text flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              <span>ธาตุไฟ (เตโชธาตุ)</span>
            </span>
            <span className="text-xs text-amber-800 font-bold">สมดุลปานกลาง</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/40 border border-blue-100">
            <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>ธาตุน้ำ (อาโปธาตุ)</span>
            </span>
            <span className="text-xs text-blue-800 font-bold">ปกติ</span>
          </div>

        </div>

        {/* Collapsible details for traditional theory to hide text clutter */}
        <div className="mt-1 border-t pt-2 border-neutral-100 text-center">
          <button 
            type="button"
            onClick={() => setShowDetailedTTM(!showDetailedTTM)}
            className="text-xs text-brand-secondary font-bold flex items-center justify-center gap-1 mx-auto min-h-[44px] px-2"
          >
            <span>{showDetailedTTM ? 'ย่อรายละเอียดธาตุและการวิเคราะห์' : 'ขยายอ่านการวิเคราะห์รสสมุนไพรเด่น'}</span>
            <span aria-hidden="true" className="material-symbols-outlined text-[14px]">
              {showDetailedTTM ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {showDetailedTTM && (
            <div className="text-left mt-3 bg-surface-muted p-3 rounded-xl border border-neutral-100 space-y-3.5 text-xs text-text-secondary leading-relaxed animate-fade-in">
              <div>
                <strong className="text-neutral-900">🔥 สมุนไพรรสเผ็ดร้อน (เช่น ขมิ้นชัน, กานพลู, ขิง):</strong>
                <p className="mt-0.5">ช่วยขับและกระจายลมค้าง บรรเทาอาการท้องอืด ท้องเฟ้อ แน่นท้องได้สอดคล้องกับอาการจุกแน่นลม</p>
              </div>
              <div className="border-t pt-2 border-neutral-200">
                <strong className="text-neutral-900">🌿 สมุนไพรรสขม (เช่น ฟ้าทะลายโจร, บอระเพ็ด):</strong>
                <p className="mt-0.5">ช่วยบำรุงน้ำดี ย่อยอาหาร แต่ในโรคไตหรือใช้ยาหลายชนิดควรระมัดระวังเป็นพิเศษ</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dim 3: Safety Action Summary (Crucial safety highlight simplified) */}
      <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200/60 flex gap-3 items-start">
        <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0">
          <span aria-hidden="true" className="material-symbols-outlined text-sm">shield</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-amber-950 font-bold">ประเด็นคัดกรองความปลอดภัยหลัก</span>
          <p className="text-[15px] text-amber-900 mt-1 leading-relaxed">
            {profile.medications.length > 0
              ? `ระบบตรวจพบรายการยาประจำตัวของคุณ (${profile.medications.map(m => m.name).join(', ')}) ควรจำลองผลความเหมาะสมก่อนเริ่มใช้ยาสมุนไพรทุกชนิด`
              : 'ยังไม่มีรายการยาประจำตัวที่บันทึกไว้ ควรตรวจสอบข้อมูลสุขภาพและจำลองผลความเหมาะสมก่อนเริ่มใช้ยาสมุนไพร'}
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3 mt-1">
        <button
          type="button"
          onClick={onEdit}
          className="flex-1 h-11 bg-white border border-border-default text-text-secondary font-bold text-xs rounded-xl flex items-center justify-center gap-1 hover:bg-neutral-50 transition-colors"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-sm">edit_note</span>
          <span>แก้ไขข้อมูลสุขภาพ</span>
        </button>

        <button
          type="button"
          onClick={onProceed}
          className="flex-[2] h-11 bg-brand-primary text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md hover:bg-brand-hover transition-all active:scale-[0.98]"
        >
          <span>ทดลองวิเคราะห์สมุนไพร</span>
          <span aria-hidden="true" className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>

    </div>
  );
}
