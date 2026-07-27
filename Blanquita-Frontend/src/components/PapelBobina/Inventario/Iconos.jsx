export function RolloIcono({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none">
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="16" cy="16" r="6.5" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M16 2.5C16 2.5 26 6 26 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

export function FueraIcono({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none">
      <rect x="5" y="9" width="22" height="16" rx="2.5" stroke="currentColor" strokeWidth="2.5" />
      <path d="M5 13h22" stroke="currentColor" strokeWidth="2.5" />
      <path d="M12 5.5h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}