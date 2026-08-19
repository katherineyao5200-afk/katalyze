export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-near-black px-8 py-24 text-center text-cream">
      {/* Temporary font sample block — step 3 verification only, remove before homepage build */}
      <p className="font-sans text-eyebrow uppercase tracking-[0.2em] text-periwinkle">
        Now developing
      </p>

      <h1 className="font-display font-extralight italic text-h1">
        Your catalyst to better skin.
      </h1>

      <p className="font-display font-extrabold text-h2 text-periwinkle">
        71%
      </p>

      <p className="font-sans text-body max-w-xl text-cream">
        Katalyze reads your skin and blends a single dose on demand — no
        half-used bottles, no guessing what today calls for.
      </p>
    </main>
  );
}
