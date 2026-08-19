import Reveal from "@/components/Reveal";

const STATS = [
  {
    value: "71%",
    description:
      "say their skin changes with the weather, but their products stay the same",
  },
  {
    value: "78%",
    description: "have bought a product that ended up not working for their skin",
  },
  {
    value: "86%",
    description:
      "say proven results, not features, are what would earn their trust",
  },
];

export default function ProblemStats() {
  return (
    <section className="bg-near-black px-6 py-24">
      <Reveal className="mx-auto flex max-w-4xl flex-col items-center gap-16 text-center">
        <h2 className="max-w-2xl font-display font-extralight text-h2 text-cream">
          Your skin changes by the day. Your routine hasn&apos;t.
        </h2>

        <div className="grid w-full grid-cols-1 gap-10 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.value} className="flex flex-col items-center gap-3">
              <p className="font-display font-extrabold text-h2 text-periwinkle">
                {stat.value}
              </p>
              <p className="max-w-xs font-sans text-body text-cream">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
