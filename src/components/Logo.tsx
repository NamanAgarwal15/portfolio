export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      stroke="currentColor"
      fill="none"
      strokeWidth="1.4"
      aria-label="Naman Agarwal logo"
      className="shrink-0"
    >
      <rect x="1" y="1" width="38" height="38" />
      <line x1="11" y1="9" x2="11" y2="31" />
      <line x1="29" y1="9" x2="29" y2="31" />
      <line x1="11" y1="9" x2="29" y2="31" />
      <circle cx="11" cy="9" r="1.4" fill="currentColor" />
      <circle cx="29" cy="31" r="1.4" fill="currentColor" />
    </svg>
  );
}
