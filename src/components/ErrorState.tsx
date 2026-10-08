import React from 'react';

interface ErrorStateProps {
  id?: string;
  message?: string;
  detail?: string;
  isSafetyCritical?: boolean;
  onRetry: () => void;
}

export default function ErrorState({
  id,
  message,
  detail,
  isSafetyCritical = false,
  onRetry,
}: ErrorStateProps) {
  const displayMessage =
    message ||
    (isSafetyCritical
      ? 'ไม่สามารถตรวจสอบข้อมูลความปลอดภัยได้ในขณะนี้ กรุณาลองอีกครั้ง หรือปรึกษาเภสัชกรก่อนใช้สมุนไพรนี้'
      : 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองอีกครั้ง');

  return (
    <div
      id={id}
      role="alert"
      data-testid="error-state"
      className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center gap-3.5 shadow-2xs ${
        isSafetyCritical
          ? 'bg-rose-50/90 border-rose-300 text-rose-950'
          : 'bg-amber-50/80 border-amber-300 text-amber-950'
      }`}
    >
      <div
        aria-hidden="true"
        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
          isSafetyCritical ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'
        }`}
      >
        <span aria-hidden="true" className="material-symbols-outlined text-2xl">error</span>
      </div>

      <div className="flex flex-col gap-1 max-w-md">
        <p className="text-[15px] sm:text-base font-bold leading-relaxed">
          {displayMessage}
        </p>
        {detail && (
          <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed">
            {detail}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="min-h-[44px] min-w-[44px] px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-hover active:scale-95 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
      >
        <span aria-hidden="true" className="material-symbols-outlined text-base">refresh</span>
        <span>ลองอีกครั้ง</span>
      </button>
    </div>
  );
}
