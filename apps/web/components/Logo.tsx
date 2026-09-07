export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <mask id="planetai-crescent">
          <rect width="100" height="100" fill="#000" />
          <g transform="rotate(-18 50 50)">
            <circle cx="43" cy="53" r="33" fill="#fff" />
            <circle cx="61" cy="41" r="29" fill="#000" />
          </g>
        </mask>
      </defs>
      <circle cx="50" cy="50" r="50" fill="#0B0B0C" />
      <rect width="100" height="100" fill="#fff" mask="url(#planetai-crescent)" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-8 w-8" />
      <span className="leading-none">
        <span className="block text-[19px] font-black tracking-tightest text-ink">PlanetAI</span>
        <span className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-muted sm:block">
          Yapay Zekâ Haberleri
        </span>
      </span>
    </span>
  );
}
