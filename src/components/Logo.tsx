export default function Logo({ className = "h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Geometric building / blueprint icon */}
      <rect x="2" y="8" width="12" height="24" rx="1" fill="#1E3A5F" />
      <rect x="16" y="14" width="12" height="18" rx="1" fill="#0D9488" />
      <rect x="30" y="4" width="12" height="28" rx="1" fill="#1E3A5F" opacity="0.7" />
      {/* Grid lines */}
      <line x1="2" y1="20" x2="42" y2="20" stroke="#0D9488" strokeWidth="0.5" opacity="0.5" />
      <line x1="2" y1="26" x2="42" y2="26" stroke="#0D9488" strokeWidth="0.5" opacity="0.5" />
      {/* Text */}
      <text x="50" y="24" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="18" fill="#1E3A5F">
        U-Plan
      </text>
      <text x="118" y="24" fontFamily="Inter, sans-serif" fontWeight="400" fontSize="18" fill="#0D9488">
        Engine
      </text>
    </svg>
  );
}
