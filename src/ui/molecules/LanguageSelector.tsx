import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useI18n } from '@/core/i18n/I18nContext';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/core/i18n/i18n.types';
import { cn } from '../utils/cn';

interface LanguageSelectorProps {
  readonly className?: string;
  readonly compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className,
  compact = false,
}) => {
  const { language, setLanguage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentOption =
    SUPPORTED_LANGUAGES.find((opt) => opt.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative inline-block text-left', className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-tertiary/70 hover:bg-surface-tertiary border border-border-default/60 hover:border-border-accent text-xs font-medium text-content-primary transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-brand-primary"
        title="Cambiar idioma / Change language / Сменить язык / 切换语言"
      >
        <span className="text-sm leading-none">{currentOption.flag}</span>
        {!compact && (
          <span className="hidden sm:inline-block font-semibold tracking-wide">
            {currentOption.label}
          </span>
        )}
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-content-muted transition-transform duration-200',
            isOpen && 'rotate-180 text-brand-primary'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {SUPPORTED_LANGUAGES.map((opt) => {
            const isSelected = opt.code === language;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => handleSelect(opt.code)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors',
                  isSelected
                    ? 'bg-brand-primary/20 text-brand-light font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{opt.flag}</span>
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-brand-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
