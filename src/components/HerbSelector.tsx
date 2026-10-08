import React, { useState } from 'react';
import { Herb } from '../types';
import { HERBS_DATABASE } from '../data/herbs';

interface HerbSelectorProps {
  onBack: () => void;
  onSelect: (herb: Herb) => void;
  onSelectCustom: (customHerbName: string) => void;
  loading: boolean;
}

export default function HerbSelector({ onBack, onSelect, onSelectCustom, loading }: HerbSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHerbId, setSelectedHerbId] = useState<string>('kamin-chan'); // Default to Curcuma Longa
  const [activeCategory, setActiveCategory] = useState('ทั้งหมด');
  
  // Custom herb state
  const [customHerbName, setCustomHerbName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const categories = ['ทั้งหมด', 'ระบบทางเดินอาหาร', 'ระบบทางเดินหายใจ', 'ตำรับยาแก้ไข้โบราณ', 'ยาสามัญประจำบ้านแผนโบราณ'];

  const filteredHerbs = HERBS_DATABASE.filter(herb => {
    const matchesSearch = 
      herb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      herb.botanicalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      herb.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeCategory === 'ทั้งหมด') return matchesSearch;
    return matchesSearch && herb.category === activeCategory;
  });

  const handleProceed = () => {
    if (showCustomInput && customHerbName.trim()) {
      onSelectCustom(customHerbName.trim());
    } else {
      const selected = HERBS_DATABASE.find(h => h.id === selectedHerbId);
      if (selected) {
        onSelect(selected);
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 max-w-md mx-auto pb-8 animate-fade-in">
      
      {/* Title Header */}
      <div className="text-center py-1 flex flex-col items-center gap-1">
        <span className="inline-flex items-center gap-1 bg-brand-tint/30 text-brand-primary text-xs font-bold px-2.5 py-0.5 rounded-full">
          <span>ขั้นตอนที่ 4: คัดกรองสมุนไพร</span>
        </span>
        <h2 className="text-2xl font-bold text-brand-primary">คุณต้องการทดสอบสมุนไพรอะไร?</h2>
        <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
          เลือกสมุนไพรเดี่ยวหรือตำรับยาไทยโบราณที่ต้องการจำลองความปลอดภัย
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="h-11 bg-white rounded-xl flex items-center px-4 gap-3 border border-neutral-600 shadow-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-primary">
          <span aria-hidden="true" className="material-symbols-outlined text-text-muted text-[18px]">search</span>
          <input 
            type="text" 
            aria-label="ค้นหาสมุนไพร"
            aria-invalid={!showCustomInput && searchTerm.trim().length > 0 && filteredHerbs.length === 0 ? true : undefined}
            aria-describedby={!showCustomInput && searchTerm.trim().length > 0 && filteredHerbs.length === 0 ? 'herb-search-empty-error' : undefined}
            placeholder="ค้นหา เช่น ขมิ้นชัน, ฟ้าทะลายโจร..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-text-primary focus-visible:outline-none placeholder-text-muted"
            disabled={showCustomInput}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              aria-label="ล้างคำค้นหา"
              className="w-11 h-11 min-w-[44px] min-h-[44px] -mr-3 flex items-center justify-center text-text-muted hover:text-text-primary rounded-full cursor-pointer"
              type="button"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[14px]">cancel</span>
            </button>
          )}
        </div>
      </div>

      {/* Categories Horizontal Scroll Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1.5 no-scrollbar snap-x snap-mandatory">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setActiveCategory(cat);
              setShowCustomInput(false);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
              activeCategory === cat && !showCustomInput
                ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                : 'bg-white text-text-secondary border-border-default hover:bg-neutral-50'
            }`}
          >
            {cat}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowCustomInput(true)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
            showCustomInput
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
              : 'bg-white text-amber-900 border-amber-200 hover:bg-neutral-50'
          }`}
        >
          🔍 ระบุสมุนไพรอื่น (ใช้ AI)
        </button>
      </div>

      {/* Custom Herb Input Panel */}
      {showCustomInput ? (
        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 shadow-sm flex flex-col gap-3.5 animate-fade-in">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-950 flex items-center justify-center shrink-0">
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">psychology</span>
            </div>
            <div className="flex flex-col min-w-0">
              <h4 className="text-xs font-bold text-amber-950">จำลองด้วยพลังปัญญาประดิษฐ์ (AI Custom Engine)</h4>
              <p className="text-xs text-amber-800 leading-relaxed mt-0.5">
                ระบบ ภูมิปัญญา | PUM PANYA สามารถประเมินสมุนไพรและตำรับยาได้ทุกชนิด กรุณาระบุชื่อพืชหรือตำรับยาด้านล่าง
              </p>
            </div>
          </div>
          
          <input
            type="text"
            aria-label="ระบุชื่อพืชหรือตำรับยาสมุนไพร"
            placeholder="เช่น มะรุม, กระชายดำ, กวาวเครือขาว, ใบมะรุมป่น..."
            value={customHerbName}
            onChange={(e) => setCustomHerbName(e.target.value)}
            className="h-10 px-3 rounded-xl bg-white border border-amber-700 text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-600 text-amber-950"
          />
        </div>
      ) : (
        /* Standard Database Herb List (Highly Redesigned, Less Cluttered) */
        <div className="flex flex-col gap-2">
          {filteredHerbs.map((herb) => {
            const isSelected = selectedHerbId === herb.id;
            return (
              <div 
                key={herb.id}
                onClick={() => setSelectedHerbId(herb.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 ${
                  isSelected 
                    ? 'bg-white border-brand-primary shadow-sm ring-2 ring-brand-tint/20' 
                    : 'bg-white border-border-default/30 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-brand-badge/40 text-brand-primary flex items-center justify-center shrink-0">
                      <span aria-hidden="true" className="material-symbols-outlined text-[18px]">spa</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-text-primary">{herb.name}</span>
                        <span className="text-xs bg-neutral-100 text-text-secondary px-1.5 py-0.2 rounded border">
                          {herb.category}
                        </span>
                      </div>
                      <span className="text-xs text-text-muted italic font-medium leading-none block">{herb.botanicalName}</span>
                    </div>
                  </div>
                  
                  {/* Select radio marker */}
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-brand-primary text-white' : 'border border-neutral-600'
                  }`}>
                    {isSelected && <span aria-hidden="true" className="material-symbols-outlined text-xs font-bold">check</span>}
                  </div>
                </div>

                <div className="text-xs text-text-secondary leading-relaxed border-t border-neutral-100 pt-1.5">
                  <strong>สรรพคุณหลัก:</strong> {herb.purpose}
                  <div className="text-xs text-text-muted mt-0.5 line-clamp-1">{herb.description}</div>
                </div>
              </div>
            );
          })}

          {filteredHerbs.length === 0 && (
            <div id="herb-search-empty-error" role="alert" className="text-center py-6 text-xs text-text-muted">
              ไม่พบข้อมูล คุณสามารถเลือก "ระบุสมุนไพรอื่น (ใช้ AI)" ด้านบนเพื่อตรวจสอบชื่ออื่นได้
            </div>
          )}
        </div>
      )}

      {/* Action CTA Buttons */}
      <div className="flex items-center gap-3 mt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex-1 h-11 rounded-xl bg-white border border-border-default text-text-secondary font-bold text-xs flex items-center justify-center gap-1 hover:bg-neutral-50 transition-colors"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-sm">arrow_back</span>
          <span>ย้อนกลับ</span>
        </button>

        <button
          type="button"
          onClick={handleProceed}
          disabled={loading || (showCustomInput && !customHerbName.trim())}
          className={`flex-[2] h-11 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] ${
            loading || (showCustomInput && !customHerbName.trim())
              ? 'bg-neutral-300 cursor-not-allowed opacity-60'
              : 'bg-brand-primary hover:bg-brand-hover cursor-pointer'
          }`}
        >
          {loading ? (
            <>
              <span aria-hidden="true" className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
              <span>กำลังวิเคราะห์ความปลอดภัยด้วย AI...</span>
            </>
          ) : (
            <>
              <span>เริ่มจำลองความปลอดภัย</span>
              <span aria-hidden="true" className="material-symbols-outlined text-sm">arrow_forward</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
