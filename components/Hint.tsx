/*
 * A small glass tag that says an element can be used, and how
 * ("Drag to turn", "Tap a star"). The blush dot pulses so the eye finds
 * it; the words stay plain.
 */
export default function Hint({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`glass inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 font-mono uppercase text-white/85 ${className}`}
      style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
    >
      <span aria-hidden="true" className="hint-dot relative size-1.5 rounded-full bg-blush" />
      {children}
    </span>
  );
}
