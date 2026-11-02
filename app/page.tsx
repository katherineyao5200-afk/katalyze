import AtAGlance from "@/components/home/AtAGlance";
import Business from "@/components/home/Business";
import FAQ from "@/components/home/FAQ";
import Pricing from "@/components/home/Pricing";
import Close from "@/components/home/Close";
import Counter from "@/components/home/Counter";
import Founder from "@/components/home/Founder";
import SkinRitual from "@/components/home/SkinRitual";
import HomeHero from "@/components/home/HomeHero";
import Anatomy from "@/components/home/Anatomy";
import FormulaLab from "@/components/home/FormulaLab";
import SkinChart from "@/components/home/SkinChart";
import Inside from "@/components/home/Inside";
import Journey from "@/components/home/Journey";
import Progress from "@/components/home/Progress";
import Research from "@/components/home/Research";
import Voices from "@/components/home/Voices";

// Section map and the reference behind each one: docs/REFERENCES.md.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col bg-midnight">
      <HomeHero />
      <SkinRitual />
      <AtAGlance />
      <Research />
      <Journey />
      <Counter />
      <Anatomy />
      <Inside />
      <FormulaLab />
      <SkinChart />
      <Progress />
      <Business />
      <Pricing />
      <Voices />
      <Founder />
      <FAQ />
      <Close />
    </main>
  );
}
