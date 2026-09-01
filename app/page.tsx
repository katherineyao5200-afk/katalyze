import Analysis from "@/components/sections/Analysis";
import ClosingCTA from "@/components/sections/ClosingCTA";
import DailyRitual from "@/components/sections/DailyRitual";
import DeviceShowcase from "@/components/sections/DeviceShowcase";
import Hero from "@/components/sections/Hero";
import Thesis from "@/components/sections/Thesis";
import WhatsInside from "@/components/sections/WhatsInside";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <Thesis />
      <Analysis />
      <DeviceShowcase />
      <DailyRitual />
      <WhatsInside />
      <ClosingCTA />
    </main>
  );
}
