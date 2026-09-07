export function Radar({ centerValue, centerLabel }: { centerValue: string; centerLabel: string }) {
  const dots = [
    [78, 40],
    [40, 96],
    [150, 120],
    [96, 150],
    [128, 58],
  ];
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label={centerLabel}>
      <defs>
        <linearGradient id="sweep" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5B8CFF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#5B8CFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[92, 66, 40, 16].map((r) => (
        <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="#212C42" strokeWidth="1" />
      ))}
      <line x1="8" y1="100" x2="192" y2="100" stroke="#212C42" strokeWidth="1" />
      <line x1="100" y1="8" x2="100" y2="192" stroke="#212C42" strokeWidth="1" />
      <g className="radar-sweep">
        <path d="M100 100 L100 8 A92 92 0 0 1 178 54 Z" fill="url(#sweep)" />
      </g>
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="#5B8CFF" />
      ))}
      <text
        x="100"
        y="98"
        textAnchor="middle"
        fill="#EAEEF7"
        style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.04em" }}
      >
        {centerValue}
      </text>
      <text
        x="100"
        y="114"
        textAnchor="middle"
        fill="#7A87A0"
        style={{ fontSize: 7, letterSpacing: "0.18em" }}
      >
        {centerLabel.toUpperCase()}
      </text>
    </svg>
  );
}
