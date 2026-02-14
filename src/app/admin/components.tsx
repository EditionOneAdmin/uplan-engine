"use client";
import React from "react";
import type { BuildingShape } from "../demo/types";

export function ShapeSVG({ shape, width, depth, size = 80 }: { shape: BuildingShape; width: number; depth: number; size?: number }) {
  const s = size;
  const pad = 4;
  const maxDim = Math.max(width, depth);
  const scale = (s - pad * 2) / maxDim;
  const w = width * scale;
  const d = depth * scale;
  const cx = s / 2;
  const cy = s / 2;

  let path = "";
  switch (shape) {
    case "riegel":
      path = `M${cx - w / 2},${cy - d / 2} h${w} v${d} h${-w} Z`;
      break;
    case "punkthaus":
      path = `M${cx - w / 2},${cy - d / 2} h${w} v${d} h${-w} Z`;
      break;
    case "l-winkel": {
      const hw = w / 2, hd = d / 2, t = Math.min(w, d) * 0.4;
      path = `M${cx - hw},${cy - hd} h${w} v${t} h${-(w - t)} v${d - t} h${-t} Z`;
      break;
    }
    case "u-form": {
      const hw = w / 2, hd = d / 2, t = w * 0.25, tb = d * 0.4;
      path = `M${cx - hw},${cy - hd} h${w} v${d} h${-t} v${-(d - tb)} h${-(w - 2 * t)} v${d - tb} h${-t} Z`;
      break;
    }
    case "t-form": {
      const hw = w / 2, hd = d / 2, t = w * 0.3;
      path = `M${cx - hw},${cy - hd} h${w} v${d * 0.35} h${-(w - t) / 2} v${d * 0.65} h${-t} v${-d * 0.65} h${-(w - t) / 2} Z`;
      break;
    }
    case "doppelhaus": {
      const hw = w / 2, hd = d / 2, gap = 2;
      const bw = (w - gap) / 2;
      path = `M${cx - hw},${cy - hd} h${bw} v${d} h${-bw} Z M${cx - hw + bw + gap},${cy - hd} h${bw} v${d} h${-bw} Z`;
      break;
    }
  }

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className="inline-block">
      <path d={path} fill="currentColor" opacity={0.3} stroke="currentColor" strokeWidth={1.5} />
      <text x={cx} y={s - 2} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.6}>
        {width}×{depth}
      </text>
    </svg>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );
}

export function Button({
  children, onClick, variant = "primary", className = "", type = "button", disabled = false,
}: {
  children: React.ReactNode; onClick?: () => void; variant?: "primary" | "danger" | "ghost"; className?: string; type?: "button" | "submit"; disabled?: boolean;
}) {
  const base = "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 cursor-pointer";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20",
    danger: "bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/30",
    ghost: "bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border border-slate-600/30",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

export function Input({
  label, value, onChange, type = "text", placeholder = "", className = "",
}: {
  label?: string; value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string; className?: string;
}) {
  return (
    <div className={className}>
      {label && <label className="block text-sm text-slate-400 mb-1">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
      />
    </div>
  );
}

export function Select({
  label, value, onChange, options, className = "",
}: {
  label?: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; className?: string;
}) {
  return (
    <div className={className}>
      {label && <label className="block text-sm text-slate-400 mb-1">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition appearance-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export function ColorPicker({
  label, value, onChange,
}: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded cursor-pointer border border-slate-700 bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
        />
      </div>
    </div>
  );
}

export function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = React.useState("");
  const add = () => {
    const t = input.trim().toLowerCase();
    if (t && !tags.includes(t)) { onChange([...tags, t]); }
    setInput("");
  };
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-1">Tags</label>
      <div className="flex flex-wrap gap-1 mb-2">
        {tags.map((t) => (
          <span key={t} className="bg-blue-600/20 text-blue-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
            {t}
            <button onClick={() => onChange(tags.filter((x) => x !== t))} className="hover:text-white cursor-pointer">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="Tag hinzufügen..."
          className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none"
        />
        <Button variant="ghost" onClick={add}>+</Button>
      </div>
    </div>
  );
}
