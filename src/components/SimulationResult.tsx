import React, { useState } from 'react';
import { SimulationResult, Herb } from '../types';

interface SimulationResultProps {
  result: SimulationResult;
  herb: Herb;
  onReset: () => void;
  onViewSafetyCard: () => void;
}

export default function SimulationResultView({ result, herb, onReset, onViewSafetyCard }: SimulationResultProps) {
  const [showEvidence, setShowEvidence] = useState(false);
  const [expandedDimension, setExpandedDimension] = useState<string | null>('interactions'); // Default expand interaction because it's most important

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'safe': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'info': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'cautionary': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'warning': return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'alert': return 'bg-red-50 text-red-800 border-red-200';
      default: return 'bg-neutral-50 text-neutral-800 border-neutral-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'match': return 'check_circle';
      case 'info': return 'info';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'help_center';
    }
  };

  const getStatusIconColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'match': return 'text-emerald-600';
      case 'info': return 'text-blue-600';
      case 'warning': return 'text-amber-600';
      case 'error': return 'text-red-600';
      default: return 'text-neutral-500';
    }
  };

  // SVG parameters for circular score gauge
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const score = result.safetyScore || 70;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const toggleDimension = (dim: string) => {
    if (expandedDimension === dim) {
      setExpandedDimension(null);
    } else {
      setExpandedDimension(dim);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 max-w-md mx-auto pb-10 animate-fade-in">
      
      {/* Title Header */}
      <div className="text-center py-1 flex flex-col items-center gap-1">
        <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-secondary bg-brand-badge/40 px-3 py-1 rounded-full">
          <span aria-hidden="true" className="material-symbols-outlined text-xs animate-spin">progress_activity</span>
          <span>วิเคราะห์ผลเสร็จสิ้น • Clinical Report</span>
        </span>
        <h2 className="text-2xl font-bold text-brand-primary">ผลลัพธ์จำลองความปลอดภัย</h2>
        <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
          ความเข้ากันได้เฉพาะบุคคลของ <strong className="font-bold text-brand-primary">“{herb.name}”</strong> ร่วมกับโปรไฟล์สุขภาพเดิมของคุณ
        </p>
      </div>

      {/* Main Score Ring & Safety Banner Card */}
      <div className="w-full rounded-2xl overflow-hidden border border-border-default/60 shadow-sm bg-white p-5 flex flex-col items-center gap-4">
        
        {/* SVG Circular Safety Gauge */}
        <div className="relative flex items-center justify-center w-28 h-28">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background track circle */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className="text-neutral-100"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Animated foreground score circle */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className={`${
                result.safetyLevel === 'safe' ? 'text-emerald-600' : 'text-amber-500'
              }`}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          
          {/* Centered Score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-brand-primary leading-none">{score}</span>
            <span className="text-xs text-text-muted font-bold mt-0.5">ดัชนีความปลอดภัย</span>
          </div>
        </div>

        {/* Dynamic Warning Alert Ribbon */}
        <div className={`p-4 rounded-xl flex items-start gap-3 w-full border ${
          result.safetyLevel === 'safe' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-950' 
            : 'bg-amber-50/75 border-amber-200/50 text-amber-950'
        }`}>
          <span aria-hidden="true" className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${
            result.safetyLevel === 'safe' ? 'text-emerald-600' : 'text-amber-600'
          }`} style={{ fontVariationSettings: "'FILL' 1" }}>
            {result.safetyLevel === 'safe' ? 'check_circle' : 'warning'}
          </span>
          <div className="flex flex-col min-w-0">
            <strong className="text-sm font-bold leading-tight">
              ระดับการเฝ้าระวัง: {result.safetyLevelText}
            </strong>
            <p className="text-[15px] mt-1 leading-relaxed">
              {result.summary}
            </p>
          </div>
        </div>

        {/* Data Completeness rating */}
        <div className="w-full border-t border-neutral-100 pt-3 flex items-center justify-between text-xs">
          <span className="text-text-muted font-medium">ความสมบูรณ์ข้อมูลทางการแพทย์ (Completeness)</span>
          <span className="font-bold text-brand-secondary">{result.completenessText}</span>
        </div>

      </div>

      {/* 5-Dimensional Collapsible Accordions (Zero Clutter!) */}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-xs font-bold text-text-muted mb-1 px-1">ผลการวิเคราะห์ระดับโมเลกุล 5 มิติ</h3>

        {/* 1. Symptom Fit */}
        <div className="bg-white rounded-xl border border-border-default/50 overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => toggleDimension('symptom')}
            className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-text-primary text-left hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span aria-hidden="true" className={`material-symbols-outlined text-sm shrink-0 ${getStatusIconColor(result.dimensions.symptomFit.status)}`}>
                {getStatusIcon(result.dimensions.symptomFit.status)}
              </span>
              <span className="truncate">{result.dimensions.symptomFit.title}</span>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded font-bold shrink-0 ml-2">
              {result.dimensions.symptomFit.statusText}
            </span>
          </button>
          {expandedDimension === 'symptom' && (
            <div className="px-4 pb-4 pt-1.5 border-t border-neutral-100 text-xs text-text-secondary leading-relaxed bg-surface-muted/40">
              {result.dimensions.symptomFit.content}
            </div>
          )}
        </div>

        {/* 2. Chronic Conditions */}
        <div className="bg-white rounded-xl border border-border-default/50 overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => toggleDimension('chronic')}
            className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-text-primary text-left hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span aria-hidden="true" className={`material-symbols-outlined text-sm shrink-0 ${getStatusIconColor(result.dimensions.chronicConditions.status)}`}>
                {getStatusIcon(result.dimensions.chronicConditions.status)}
              </span>
              <span className="truncate">{result.dimensions.chronicConditions.title}</span>
            </div>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.2 rounded font-bold shrink-0 ml-2">
              {result.dimensions.chronicConditions.statusText}
            </span>
          </button>
          {expandedDimension === 'chronic' && (
            <div className="px-4 pb-4 pt-1.5 border-t border-neutral-100 text-[15px] text-text-secondary leading-relaxed bg-surface-muted/40">
              {result.dimensions.chronicConditions.content}
            </div>
          )}
        </div>

        {/* 3. Drug Interactions (Default Open, Highly Important!) */}
        <div className="bg-white rounded-xl border border-border-default/50 overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => toggleDimension('interactions')}
            className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-text-primary text-left hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span aria-hidden="true" className="material-symbols-outlined text-sm text-warning-text-strong shrink-0">medication_liquid</span>
              <span className="truncate">ปฏิกิริยาระหว่างยา (Drug-Herb Interactions)</span>
            </div>
            <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.2 rounded font-bold shrink-0 ml-2">
              เฝ้าระวัง {result.dimensions.interactions.items.length} รายการ
            </span>
          </button>
          {expandedDimension === 'interactions' && (
            <div className="px-4 pb-4 pt-3 border-t border-neutral-100 bg-surface-muted/40 flex flex-col gap-2">
              {result.dimensions.interactions.items.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white border border-neutral-200 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-xs font-bold text-brand-primary">{herb.name} + {item.drugName}</strong>
                    <span className={`text-xs px-2 py-0.2 rounded-full border font-bold ${getSeverityColor(item.severity)}`}>
                      {item.severityText}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    <strong>กลไก:</strong> {item.mechanism}
                  </p>
                  <p className="text-[15px] text-brand-secondary leading-relaxed font-semibold bg-brand-tint/10 p-2.5 rounded-lg border border-brand-secondary/10">
                    💡 <strong>ข้อแนะนำ:</strong> {item.recommendation}
                  </p>
                </div>
              ))}
              {result.dimensions.interactions.items.length === 0 && (
                <div className="text-xs text-neutral-500 py-1 pl-2">
                  ไม่พบปฏิกิริยาอันตรายกับยาที่คุณระบุไว้ในฐานข้อมูลคัดกรอง
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. Special Populations */}
        <div className="bg-white rounded-xl border border-border-default/50 overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => toggleDimension('special')}
            className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-text-primary text-left hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span aria-hidden="true" className={`material-symbols-outlined text-sm shrink-0 ${getStatusIconColor(result.dimensions.specialPopulations.status)}`}>
                {getStatusIcon(result.dimensions.specialPopulations.status)}
              </span>
              <span className="truncate">{result.dimensions.specialPopulations.title}</span>
            </div>
            <span className="text-xs bg-neutral-100 text-text-secondary px-2 py-0.2 rounded font-bold shrink-0 ml-2">
              {result.dimensions.specialPopulations.statusText}
            </span>
          </button>
          {expandedDimension === 'special' && (
            <div className="px-4 pb-4 pt-1.5 border-t border-neutral-100 text-[15px] text-text-secondary leading-relaxed bg-surface-muted/40">
              {result.dimensions.specialPopulations.content}
            </div>
          )}
        </div>

        {/* 5. Data Completeness limit */}
        <div className="bg-white rounded-xl border border-border-default/50 overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => toggleDimension('completeness')}
            className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-text-primary text-left hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span aria-hidden="true" className="material-symbols-outlined text-sm text-warning-text shrink-0">help_center</span>
              <span className="truncate">{result.dimensions.dataCompleteness.title}</span>
            </div>
            <span className="text-xs bg-warning-bg text-warning-text px-2 py-0.2 rounded font-bold shrink-0 ml-2">
              {result.dimensions.dataCompleteness.statusText}
            </span>
          </button>
          {expandedDimension === 'completeness' && (
            <div className="px-4 pb-4 pt-1.5 border-t border-neutral-100 text-xs text-warning-text leading-relaxed bg-warning-bg/10">
              {result.dimensions.dataCompleteness.content}
            </div>
          )}
        </div>

      </div>

      {/* Accordion: Sources and Evidence References */}
      <div className="bg-white rounded-xl border border-border-default/50 shadow-sm overflow-hidden">
        <button 
          type="button"
          onClick={() => setShowEvidence(!showEvidence)}
          className="w-full p-3.5 flex items-center justify-between font-bold text-xs text-brand-primary bg-neutral-50 hover:bg-neutral-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="material-symbols-outlined text-sm">menu_book</span>
            <span>แหล่งข้อมูลอ้างอิงทางวิชาการ (Evidence Sources)</span>
          </div>
          <span aria-hidden="true" className="material-symbols-outlined transition-transform">
            {showEvidence ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {showEvidence && (
          <div className="p-4 border-t border-border-default/40 text-xs text-text-secondary leading-relaxed space-y-1.5 bg-neutral-50/50">
            <p>
              • <strong>อ้างอิง:</strong> National Drug Formulary (NDF) บัญชียาหลักแห่งชาติ พ.ศ. 2565
            </p>
            <p>
              • <strong>ข้อมูลปฏิกิริยา CYP450:</strong> เอนไซม์หลักในการขจัดยาของกลุ่มแคลเซียมแชนแนลบล็อกเกอร์ (<strong className="font-semibold">Amlodipine</strong>) ผ่านกลไกต้าน CYP3A4
            </p>
            <p>
              • <strong>คัมภีร์เวชศาสตร์:</strong> คู่มือข้อบ่งใช้และข้อห้ามสมุนไพร กรมการแพทย์แผนไทย กระทรวงสาธารณสุข
            </p>
          </div>
        )}
      </div>

      {/* Action CTA Buttons */}
      <div className="flex flex-col gap-2 mt-2">
        <button
          type="button"
          onClick={onViewSafetyCard}
          className="w-full h-12 bg-brand-primary hover:bg-brand-hover text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-sm">verified_user</span>
          <span>สร้างบัตรสรุปความปลอดภัย (Safety Card)</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="w-full h-12 bg-white text-brand-secondary border border-border-default hover:bg-neutral-50 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-sm">refresh</span>
          <span>เลือกสมุนไพรอื่นเพื่อวิเคราะห์ความเหมาะสม</span>
        </button>
      </div>

    </div>
  );
}
