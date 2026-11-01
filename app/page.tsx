import AtAGlance from "@/components/home/AtAGlance";
import Business from "@/components/home/Business";
import FAQ from "@/components/home/FAQ";
import Pricing from "@/components/home/Pricing";
import Close from "@/components/home/Close";
import Founder from "@/components/home/Founder";
import HomeHero from "@/components/home/HomeHero";
import Anatomy from "@/components/home/Anatomy";
import FormulaLab from "@/components/home/FormulaLab";
import Inside from "@/components/home/Inside";
import Process from "@/components/home/Process";
import Progress from "@/components/home/Progress";
import Research from "@/components/home/Research";
import Voices from "@/components/home/Voices";

// Section map and the reference behind each one: docs/REFERENCES.md.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col bg-midnight">
      <HomeHero />
      <AtAGlance />
      <Research />
      <Process />
      <Anatomy />
      <Inside />
      <FormulaLab />
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
