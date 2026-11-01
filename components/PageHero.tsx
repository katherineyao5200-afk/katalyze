import DitherField from "@/components/DitherField";
import Sparkle from "@/components/Sparkle";

/*
 * The opening band for the inner pages: the same living aura and
 * dithered field as the homepage hero, one large headline, one short
 * lede. Keeps every page feeling like the same product.
 */
export default function PageHero({
  label,
  title,
  lede,
  children,
}: {
  label: string;
  title: React.ReactNode;
  lede: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-[color:var(--canvas-deep)]">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <DitherField
          variant="aura"
          center={[0.78, 0.62]}
          density={0.85}
          className="absolute inset-x-0 top-0 !h-[48%] md:!h-full"
        />
        <div className="grain absolute inset-0" />
      </div>
      <div
        className="mx-auto flex min-h-[72svh] flex-col justify-end gap-8"
        style={{
          maxWidth: "var(--max-w)",
          paddingInline: "var(--margin)",
          paddingTop: "var(--s-32)",
          paddingBottom: "var(--s-16)",
        }}
      >
        <p
          className="flex items-center gap-2 font-mono uppercase text-periwinkle"
          style={{
            fontSize: "var(--text-2xs)",
            letterSpacing: "var(--track-label)",
          }}
        >
          <Sparkle size={9} className="text-blush" />
          {label}
        </p>
        <h1
          className="max-w-5xl font-display font-extralight text-white"
          style={{
            fontSize: "var(--text-display)",
            lineHeight: "var(--leading-display)",
          }}
        >
          {title}
        </h1>
        <div
          className="max-w-xl text-[color:var(--muted-on-dark)]"
          style={{
            fontSize: "var(--text-lg)",
            lineHeight: "var(--leading-body)",
          }}
        >
          {lede}
        </div>
        {children}
      </div>
    </section>
  );
}
