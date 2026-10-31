// Mono pill used as a section opener (alethia) or step number
// (sharplink). Text only; never an icon.
export default function Chip({
  children,
  tone = "light",
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 font-mono uppercase ${
        tone === "light"
          ? "border-[color:var(--rule-on-light)] bg-white/70 text-indigo"
          : "border-[color:var(--rule-on-dark)] bg-[color:var(--panel)] text-periwinkle"
      }`}
      style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--track-label)" }}
    >
      {children}
    </span>
  );
}
