'use client';

interface SectionHeaderProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  icon?: string;
}

export default function SectionHeader({ title, isOpen, onToggle, icon }: SectionHeaderProps) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-2.5 px-1 text-left group"
    >
      <span className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors">
        {icon && <span className="mr-1.5">{icon}</span>}
        {title}
      </span>
      <svg
        className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}
