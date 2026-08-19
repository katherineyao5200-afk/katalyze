import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story | Katalyze",
  description:
    "Why Katherine Yao built Katalyze: an overflowing cabinet, irritated skin, and one question about why skincare doesn't work the way cooking does.",
};

export default function StoryPage() {
  return (
    <main className="flex flex-1 flex-col bg-near-black">
      <section className="px-6 py-24">
        <div className="mx-auto flex max-w-2xl flex-col gap-8">
          <h1 className="font-display font-extralight text-h1 text-cream">
            Our story.
          </h1>

          <p className="font-sans text-body-lg text-cream">
            Katalyze started with an overflowing bathroom cabinet. Serums,
            creams, half-used bottles bought for a skin type that had
            already changed by the time they arrived — and skin that stayed
            irritated no matter which combination I tried next.
          </p>

          <p className="font-sans text-body-lg text-cream">
            Eventually the problem became obvious: it was never the
            products. It was that every formula on that shelf was static,
            and skin isn&apos;t. It reacts to weather, stress, sleep, the
            season — day to day, sometimes hour to hour — while the bottle
            sitting in the cabinet stays exactly the same until it runs out.
          </p>

          <p className="font-display font-extralight italic text-h3 text-periwinkle">
            &ldquo;Why can&apos;t skincare be as dynamic and fresh as the
            food we cook in our kitchens?&rdquo;
          </p>

          <p className="font-sans text-body-lg text-cream">
            That question became Katalyze: a device that reads your skin
            and mixes a single fresh dose, instead of asking you to guess
            which pre-made formula might fit today.
          </p>

          <p className="font-sans text-body text-periwinkle">
            Katalyze is built by Katherine Yao, working with external
            manufacturing, formulation, and development partners — not an
            in-house team.
          </p>
        </div>
      </section>
    </main>
  );
}
