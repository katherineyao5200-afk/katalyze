import WaitlistForm from "@/components/WaitlistForm";

export default function Hero() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center gap-6 bg-near-black px-6 py-24 text-center">
      <p className="font-sans text-eyebrow uppercase tracking-[0.2em] text-periwinkle">
        Now developing
      </p>

      <h1 className="max-w-3xl font-display font-extralight text-h1 text-cream">
        Skincare, mixed <em className="font-display italic">fresh</em>, every
        morning.
      </h1>

      <p className="font-display font-extralight italic text-body-lg text-periwinkle">
        Your catalyst to better skin.
      </p>

      <p className="max-w-xl font-sans text-body text-cream">
        Katalyze reads your skin and blends a single dose on demand — no
        half-used bottles, no guessing what today calls for.
      </p>

      <WaitlistForm source="hero" trackVisibility className="mt-4 w-full max-w-md" />

      <span
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-periwinkle"
      >
        ↓
      </span>
    </section>
  );
}
