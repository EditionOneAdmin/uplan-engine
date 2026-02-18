"use client";

import { useState, useEffect, useRef } from "react";

export function InfoTooltip({ term, definition, formula }: { term: string; definition: string; formula?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [open]);

  return (
    <span className="relative inline-block" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="ml-1 text-[10px] text-white/30 hover:text-white/60 transition-colors"
        aria-label={`Info: ${term}`}
      >
        ⓘ
      </button>
      {open && (
        <div
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 w-56 p-2 rounded-lg bg-gray-900 border border-white/10 shadow-xl text-[10px] text-white/80"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="font-bold text-white mb-1">{term}</div>
          <div className="leading-relaxed">{definition}</div>
          {formula && <div className="mt-1 text-white/50 font-mono text-[9px]">📐 {formula}</div>}
        </div>
      )}
    </span>
  );
}
