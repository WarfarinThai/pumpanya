import React from 'react';
import { SavedSimulation } from '../types';

interface HistoryListProps {
  history: SavedSimulation[];
  onSelect: (item: SavedSimulation) => void;
  onClear: () => void;
}

export default function HistoryList({ history, onSelect, onClear }: HistoryListProps) {
  return (
    <div className="w-full flex flex-col gap-4 max-w-lg mx-auto pb-10">
      
      {/* Title Header */}
      <div className="text-center py-2 flex flex-col items-center gap-1">
        <span className="text-xs font-semibold text-brand-secondary bg-brand-badge/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <span aria-hidden="true" className="material-symbols-outlined text-xs">history</span>
          <span>Safety Archive • ประวัติการคัดกรอง</span>
        </span>
        <h2 className="text-2xl font-bold text-brand-primary">ประวัติการคัดกรองความปลอดภัย</h2>
        <p className="text-xs text-text-secondary max-w-sm mt-1">
          เรียกดูบัตรความปลอดภัยสมุนไพรและผลลัพธ์จำลองก่อนหน้าของคุณที่เคยบันทึกไว้ในอุปกรณ์นี้
        </p>
      </div>

      {history.length > 0 && (
        <div className="flex justify-end">
          <button 
            type="button"
            onClick={onClear}
            className="min-h-[44px] px-2 text-xs text-red-600 hover:text-red-800 font-bold flex items-center gap-1 transition-colors"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-sm">delete_sweep</span>
            <span>ลบประวัติทั้งหมด</span>
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {history.map((item) => (
          <div 
            key={item.id}
            onClick={() => onSelect(item)}
            className="p-4 rounded-2xl bg-white border border-border-default/30 shadow-sm hover:border-brand-hover cursor-pointer transition-all flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted font-bold">{item.timestamp}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                item.result.safetyLevel === 'safe' 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {item.result.safetyLevelText}
              </span>
            </div>
            
            <div className="flex items-start justify-between gap-3 pt-1">
              <div>
                <h3 className="text-md font-bold text-brand-primary">{item.herb.name} ({item.herb.botanicalName})</h3>
                <p className="text-xs text-text-secondary leading-relaxed mt-1 line-clamp-2">
                  {item.result.summary}
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-brand-badge/40 text-brand-primary flex items-center justify-center shrink-0 border">
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">eco</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-brand-secondary font-bold pt-2 border-t border-neutral-100 mt-1">
              <span aria-hidden="true" className="material-symbols-outlined text-xs">visibility</span>
              <span>แตะเพื่อเปิดดูผลลัพธ์และบัตรความปลอดภัยอีกครั้ง</span>
            </div>
          </div>
        ))}

        {history.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-neutral-200 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
              <span aria-hidden="true" className="material-symbols-outlined text-[28px]">history</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-neutral-800">ยังไม่มีประวัติการประเมิน</span>
              <span className="text-xs text-text-muted">เริ่มสร้างแบบประเมินสุขภาพและสมุนไพร เพื่อบันทึกประวัติของคุณ</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
