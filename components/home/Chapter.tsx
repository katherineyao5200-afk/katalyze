/*
 * A chapter mark (rule 3): the homepage reads as five chapters, and these
 * marks are its only section labels. A large italic numeral, the
 * chapter's name, and one line that says what the chapter proves. The
 * hairline draws itself across as the mark scrolls through (CSS
 * scroll-driven, so it costs nothing on the main thread; browsers without
 * it just show the line).
 */
export default function Chapter({
  n,
  name,
  line,
  tone = "dark",
}: {
  n: string;
  name: string;
  line: string;
  tone?: "dark" | "light";
}) {
  const light = tone === "light";
  return (
    <div
      className={`chapter relative ${light ? "chapter-light bg-white text-midnight" : "text-white"}`}
      data-nav={light ? "light" : undefined}
    >
      <div
        className="mx-auto grid items-end gap-x-10 gap-y-3 md:grid-cols-[auto_1fr_auto]"
        style={{
          maxWidth: "var(--max-w)",
          paddingInline: "var(--margin)",
          paddingBlock: "clamp(56px, 9vw, 120px) clamp(28px, 4vw, 48px)",
        }}
      >
        <span
          aria-hidden="true"
          className="chapter-numeral font-display font-extralight italic leading-none"
          style={{ fontSize: "clamp(64px, 9vw, 136px)" }}
        >
          {n}
        </span>
        <p className="flex flex-col gap-1 pb-2">
          <span className={`text-[length:var(--text-sm)] ${light ? "text-indigo" : "text-periwinkle"}`}>
            <span className="sr-only">Chapter {n}: </span>
            {name}
          </span>
          <span
            className="font-display font-extralight"
            style={{ fontSize: "clamp(22px, 2.4vw, 34px)", lineHeight: 1.15 }}
          >
            {line}
          </span>
        </p>
        <span
          aria-hidden="true"
          className={`hidden pb-3 font-mono tabular-nums md:block ${light ? "text-indigo/60" : "text-white/35"}`}
          style={{ fontSize: "var(--text-xs)" }}
        >
          {n} / V
        </span>
        <span
          aria-hidden="true"
          className={`chapter-rule col-span-full block h-px origin-left ${light ? "bg-midnight/25" : "bg-white/20"}`}
        />
      </div>
    </div>
  );
}
