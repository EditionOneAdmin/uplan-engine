'use client';

import InfoTooltip from './InfoTooltip';

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  info?: string;
}

export default function ToggleSwitch({ label, checked, onChange, info }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs text-white/60 flex items-center">{label}{info && <InfoTooltip text={info} />}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-teal-500' : 'bg-white/20'}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}
