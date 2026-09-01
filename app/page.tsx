import Analysis from "@/components/sections/Analysis";
import ClosingCTA from "@/components/sections/ClosingCTA";
import DeviceShowcase from "@/components/sections/DeviceShowcase";
import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import Thesis from "@/components/sections/Thesis";
import WhatsInside from "@/components/sections/WhatsInside";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <Thesis />
      <Analysis />
      <DeviceShowcase />
      <HowItWorks />
      <WhatsInside />
      <ClosingCTA />
    </main>
  );
}
