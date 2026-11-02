/*
 * Decoration after the orbital-diagram studies: thin orbits around a
 * point, a satellite on each, and mono readouts that carry real values
 * only (passed in). Pure SVG + CSS; still under reduced motion.
 */
export default function Orbit({
  readouts,
  className = "",
}: {
  readouts: string[];
  className?: string;
}) {
  return (
    <svg
      viewBox="-150 -150 300 300"
      aria-hidden="true"
      className={`overflow-visible ${className}`}
      fill="none"
    >
      <g stroke="var(--periwinkle)" strokeOpacity="0.35">
        <circle r="118" strokeDasharray="1 5" />
        <ellipse rx="118" ry="44" transform="rotate(-24)" />
        <ellipse rx="96" ry="30" transform="rotate(38)" strokeOpacity="0.22" />
        <line x1="-140" y1="0" x2="140" y2="0" strokeOpacity="0.15" />
        <line x1="0" y1="-140" x2="0" y2="140" strokeOpacity="0.15" />
      </g>
      <circle r="3" fill="var(--periwinkle)" />
      {/* satellites: each orbit is a circle squashed into its ellipse */}
      <g transform="rotate(-24) scale(1 0.373)">
        <g className="orbit-spin" style={{ animationDuration: "16s" }}>
          <circle cx="118" cy="0" r="9" fill="white" transform="scale(1 2.68)" />
        </g>
      </g>
      <g transform="rotate(38) scale(1 0.3125)">
        <g className="orbit-spin" style={{ animationDuration: "23s", animationDirection: "reverse" }}>
          <circle cx="96" cy="0" r="9" fill="var(--periwinkle)" transform="scale(1 3.2)" />
        </g>
      </g>
      <g
        fill="var(--periwinkle)"
        fontFamily="var(--font-mono, ui-monospace), monospace"
        fontSize="9"
        letterSpacing="1.2"
      >
        {readouts.map((t, i) => (
          <text key={t} x={i % 2 ? -142 : 62} y={i < 2 ? -122 + i * 14 : 128 + (i - 2) * 14}>
            {t}
          </text>
        ))}
      </g>
    </svg>
  );
}
