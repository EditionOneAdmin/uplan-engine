'use client';

import { useCallback } from 'react';

interface ParameterSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  showInput?: boolean;
  formatValue?: (v: number) => string;
  onChange: (value: number) => void;
}

export default function ParameterSlider({
  label, value, min, max, step, unit = '', showInput = false, formatValue, onChange,
}: ParameterSliderProps) {
  const displayValue = formatValue ? formatValue(value) : `${value}`;
  const pct = ((value - min) / (max - min)) * 100;

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  }, [onChange]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v) && v >= min && v <= max) onChange(v);
  }, [onChange, min, max]);

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-white/60">{label}</span>
        {!showInput && (
          <span className="text-xs font-medium text-white/90">{displayValue}{unit && ` ${unit}`}</span>
        )}
        {showInput && (
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={value}
              min={min}
              max={max}
              step={step}
              onChange={handleInput}
              className="w-16 bg-white/10 border border-white/20 rounded px-1.5 py-0.5 text-xs text-white text-right focus:outline-none focus:border-teal-400"
            />
            {unit && <span className="text-xs text-white/50">{unit}</span>}
          </div>
        )}
      </div>
      <div className="relative">
        <div className="h-1.5 bg-white/10 rounded-full">
          <div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSlider}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}
