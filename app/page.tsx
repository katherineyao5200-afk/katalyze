import Analysis from "@/components/sections/Analysis";
import ClosingCTA from "@/components/sections/ClosingCTA";
import DeviceShowcase from "@/components/sections/DeviceShowcase";
import Formulation from "@/components/sections/Formulation";
import Freshness from "@/components/sections/Freshness";
import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import NotAQuiz from "@/components/sections/NotAQuiz";
import Proof from "@/components/sections/Proof";
import Thesis from "@/components/sections/Thesis";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <Thesis />
      <Analysis />
      <DeviceShowcase />
      <HowItWorks />
      <Formulation />
      <Freshness />
      <NotAQuiz />
      <Proof />
      <ClosingCTA />
    </main>
  );
}
