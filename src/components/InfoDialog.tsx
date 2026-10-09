import React, { useEffect, useId, useRef } from 'react';

let openDialogCount = 0;
let savedBodyOverflow = '';
let savedHtmlOverflow = '';

export interface InfoDialogProps {
  isOpen?: boolean;
  title: string;
  subtitle?: string;
  description?: string;
  children: React.ReactNode;
  closeLabel?: string;
  onClose: () => void;
  maxWidth?: string;
  maxHeight?: string;
  className?: string;
  overlayClassName?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  customChrome?: boolean;
}

export default function InfoDialog({
  isOpen = true,
  title,
  subtitle,
  description,
  children,
  closeLabel = 'ปิด',
  onClose,
  maxWidth = 'max-w-md',
  maxHeight = 'max-h-[85vh]',
  className,
  overlayClassName,
  ariaLabelledBy,
  ariaDescribedBy,
  customChrome = false,
}: InfoDialogProps) {
  const generatedTitleId = useId();
  const generatedContentId = useId();
  const resolvedTitleId = ariaLabelledBy || generatedTitleId;
  const resolvedDescriptionId =
    ariaDescribedBy || (!customChrome || description ? generatedContentId : undefined);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    if (openDialogCount === 0) {
      savedBodyOverflow = document.body.style.overflow;
      savedHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
    openDialogCount += 1;

    return () => {
      openDialogCount = Math.max(0, openDialogCount - 1);
      if (openDialogCount === 0) {
        document.body.style.overflow = savedBodyOverflow;
        document.documentElement.style.overflow = savedHtmlOverflow;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    previousActiveElementRef.current = document.activeElement as HTMLElement | null;

    // Move focus into the dialog (primary close button or first focusable control)
    const focusTimer = window.setTimeout(() => {
      if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      } else if (dialogRef.current) {
        const firstFocusable = dialogRef.current.querySelector<HTMLElement>(
          '[data-dialog-initial-focus], button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          dialogRef.current.focus();
        }
      }
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (event.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) {
          event.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement || !dialogRef.current.contains(document.activeElement)) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement || !dialogRef.current.contains(document.activeElement)) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const dialogContainerClassName = className
    ? `${className} ${maxWidth} ${maxHeight} overscroll-contain focus:outline-none`.trim()
    : `bg-white rounded-3xl ${maxWidth} w-full ${maxHeight} flex flex-col p-5 sm:p-6 shadow-2xl border border-border-default gap-4 overscroll-contain focus:outline-none`;

  return (
    <div
      className={
        overlayClassName ||
        'fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in'
      }
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCloseRef.current();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={resolvedTitleId}
        aria-describedby={resolvedDescriptionId}
        tabIndex={-1}
        className={dialogContainerClassName}
      >
        {customChrome ? (
          <>
            {!ariaLabelledBy && (
              <span id={generatedTitleId} className="sr-only">
                {title}
              </span>
            )}
            {!ariaDescribedBy && description && (
              <span id={generatedContentId} className="sr-only">
                {description}
              </span>
            )}
            {children}
          </>
        ) : (
          <>
            {/* Dialog Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-brand-primary flex items-center justify-center text-white shrink-0 shadow-xs">
                  <span
                    className="material-symbols-outlined text-[22px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    spa
                  </span>
                </div>
                <div className="min-w-0">
                  <h2
                    id={resolvedTitleId}
                    className="text-base sm:text-lg font-bold text-brand-primary leading-snug"
                  >
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-xs text-text-muted font-medium truncate">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={closeLabel}
                className="w-11 h-11 min-w-[44px] min-h-[44px] -mr-1.5 flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-full cursor-pointer transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div
              id={generatedContentId}
              className="overflow-y-auto pr-1 text-sm sm:text-[15px] text-text-secondary leading-relaxed flex flex-col gap-3"
            >
              {children}
            </div>

            {/* Dialog Footer Action */}
            <div className="pt-1 shrink-0">
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="w-full h-11 rounded-2xl bg-brand-primary hover:bg-brand-hover text-white font-bold text-xs sm:text-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              >
                {closeLabel}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
