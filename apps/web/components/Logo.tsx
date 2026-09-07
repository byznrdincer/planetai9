export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="50" fill="#0B0B0C" />
      {/* PlanetAI9 mark — stylised swoosh / crescent "S" */}
      <path
        d="M32 34
           C 30 20 50 14 66 22
           C 55 20 44 24 43 34
           C 42 45 55 49 62 55
           C 74 64 72 82 50 87
           C 33 91 20 78 22 63
           C 26 75 40 80 47 73
           C 53 67 47 60 39 55
           C 26 47 22 40 32 34 Z"
        fill="#fff"
      />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-8 w-8" />
      <span className="leading-none">
        <span className="block text-[19px] font-black tracking-tightest text-ink">PlanetAI9</span>
        <span className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-muted sm:block">
          Yapay Zekâ Haberleri
        </span>
      </span>
    </span>
  );
}
