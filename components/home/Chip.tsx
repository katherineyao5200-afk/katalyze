import Sparkle from "@/components/Sparkle";

// Section label: the sparkle from the mark and a mono caption, no pill. Read by
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
      <Sparkle
        size={9}
        className={tone === "light" ? "text-indigo" : "text-blush"}
      />
      {children}
    </span>
  );
}
