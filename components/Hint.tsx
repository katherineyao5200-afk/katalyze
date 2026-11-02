/*
 * A quiet line of text saying an element can be used, and how
 * ("Drag to turn", "Tap a star"). Plain words, no badge.
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
      className={`inline-flex w-fit items-center gap-1.5 text-current opacity-60 ${className}`}
      style={{ fontSize: "var(--text-xs)" }}
    >
      <span aria-hidden="true">↳</span>
      {children}
    </span>
  );
}
