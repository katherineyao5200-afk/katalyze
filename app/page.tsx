import ClosingCTA from "@/components/sections/ClosingCTA";
import DailyRitual from "@/components/sections/DailyRitual";
import DeviceShowcase from "@/components/sections/DeviceShowcase";
import Hero from "@/components/sections/Hero";
import ProblemStats from "@/components/sections/ProblemStats";
import WhatsInside from "@/components/sections/WhatsInside";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <ProblemStats />
      <DeviceShowcase />
      <DailyRitual />
      <WhatsInside />
      <ClosingCTA />
    </main>
  );
}
