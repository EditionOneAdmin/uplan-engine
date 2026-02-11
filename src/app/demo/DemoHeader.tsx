"use client";

import { ArrowLeft, Building2 } from "lucide-react";

export function DemoHeader() {
  return (
    <header className="bg-[#1E3A5F] px-4 py-3 flex items-center justify-between border-b border-white/10 shrink-0">
      <div className="flex items-center gap-3">
        <a
          href="/bplan-engine/"
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Zurück zur Website</span>
        </a>
        <div className="w-px h-6 bg-white/20 hidden sm:block" />
        <div className="flex items-center gap-2">
          <Building2 size={20} className="text-[#0D9488]" />
          <h1 className="text-base sm:text-lg font-semibold">
            Interaktive Demo{" "}
            <span className="text-white/50 font-normal">— Konzepterstellung</span>
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/40 hidden sm:inline">B-Plan Engine v0.1 · Build 014</span>
        <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
      </div>
    </header>
  );
}
