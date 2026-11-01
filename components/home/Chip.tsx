// Section label: a short rule and a mono caption, no pill. Read by
// the eye as an index entry, the way the reference sites mark sections.
export default function Chip({
  children,
  tone = "dark",
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-3 font-mono uppercase ${
        tone === "light" ? "text-indigo" : "text-periwinkle"
      }`}
      style={{
        fontSize: "var(--text-2xs)",
        letterSpacing: "var(--track-label)",
      }}
    >
      <span
        aria-hidden="true"
        className={`h-px w-6 ${tone === "light" ? "bg-indigo" : "bg-blush"}`}
      />
      {children}
    </span>
  );
}
