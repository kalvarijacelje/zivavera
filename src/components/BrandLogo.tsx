import React from 'react';

export interface BrandLogoProps {
  variant?: 'responsive' | 'full' | 'compact';
  subAppTitle?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  isLight?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'responsive',
  subAppTitle,
  href,
  onClick,
  className = '',
  isLight = false,
}) => {
  const content = (
    <div className={`flex items-center select-none ${className}`}>
      {/* 1. Compact Circular Flame Emblem */}
      {variant === 'compact' && (
        <img
          src="/logo.png"
          alt="Živa Vera"
          className="h-8 w-8 object-contain shrink-0"
          loading="eager"
        />
      )}

      {/* 2. Full Horizontal Brand Logotype */}
      {variant === 'full' && (
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Živa Vera"
            className="h-8 md:h-9 w-auto object-contain shrink-0"
            loading="eager"
          />
          <div className="leading-tight">
            <span className={`font-bold text-sm md:text-base font-['Nohemi',sans-serif] tracking-tight block ${isLight ? 'text-white' : 'text-stone-900'}`}>
              ŽIVA VERA
            </span>
            <span className="text-[9px] md:text-[10px] tracking-widest text-amber-600 font-semibold uppercase block">
              Kavarna
            </span>
          </div>
        </div>
      )}

      {/* 3. Responsive Switching: Compact on Mobile (< md), Full on Desktop (>= md) */}
      {variant === 'responsive' && (
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Živa Vera"
            className="h-8 md:h-9 w-auto object-contain shrink-0"
            loading="eager"
          />
          <div className="hidden sm:block leading-tight">
            <span className={`font-bold text-sm md:text-base font-['Nohemi',sans-serif] tracking-tight block ${isLight ? 'text-white' : 'text-stone-900'}`}>
              ŽIVA VERA
            </span>
            <span className="text-[9px] md:text-[10px] tracking-widest text-amber-600 font-semibold uppercase block">
              Kavarna
            </span>
          </div>
        </div>
      )}

      {/* Sub-App Divider & Title */}
      {subAppTitle && (
        <>
          <span className={`border-r ${isLight ? 'border-white/25' : 'border-stone-300'} h-5 mx-3 shrink-0`} />
          <span className={`font-semibold text-xs md:text-sm tracking-wide uppercase whitespace-nowrap font-['Nohemi',sans-serif] ${isLight ? 'text-white' : 'text-stone-800'}`}>
            {subAppTitle}
          </span>
        </>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center text-left group focus:outline-none cursor-pointer transition-opacity hover:opacity-90"
        title="Živa Vera — Kavarna"
      >
        {content}
      </button>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        className="inline-flex items-center group focus:outline-none transition-opacity hover:opacity-90"
        title="Živa Vera — Kavarna"
      >
        {content}
      </a>
    );
  }

  return content;
};
