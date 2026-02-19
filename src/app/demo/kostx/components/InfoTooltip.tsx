'use client';

import { useState, useRef, useEffect } from 'react';

interface InfoTooltipProps {
  text: string;
}

export default function InfoTooltip({ text }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="ml-1 w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white/70 text-[10px] leading-none flex items-center justify-center transition-colors"
        type="button"
        aria-label="Info"
      >
        ⓘ
      </button>
      {open && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 rounded-lg bg-[#1E293B] border border-white/20 shadow-xl text-xs text-white/80 leading-relaxed">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1E293B] border-r border-b border-white/20 rotate-45 -mt-1" />
        </div>
      )}
    </div>
  );
}
