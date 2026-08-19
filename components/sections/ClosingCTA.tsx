import WaitlistForm from "@/components/WaitlistForm";

export default function ClosingCTA() {
  return (
    <section className="bg-near-black px-6 py-32">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
        <h2 className="font-display font-extralight text-h2 text-cream">
          Be the first to try it.
        </h2>
        <p className="font-sans text-body-lg text-cream">
          We&apos;ll tell our waitlist before anyone else.
        </p>
        <WaitlistForm source="closing" trackVisibility className="w-full max-w-md" />
      </div>
    </section>
  );
}
