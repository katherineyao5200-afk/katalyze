import Business from "@/components/home/Business";
import Chapter from "@/components/home/Chapter";
import Mission from "@/components/home/Mission";
import Model from "@/components/home/Model";
import FAQ from "@/components/home/FAQ";
import Pricing from "@/components/home/Pricing";
import Counter from "@/components/home/Counter";
import Close from "@/components/home/Close";
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
import XRayStory from "@/components/home/XRayStory";

// Section map and the reference behind each one: docs/REFERENCES.md.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col bg-midnight">
      <HomeHero />
      <Chapter n="I" name="The problem" line="Your skin changes every day. Your skincare doesn't." />
      <SkinRitual />
      <Mission />
      <Chapter n="II" name="How it works" line="One touch, about a minute, one fresh dose." />
      <Journey />
      <XRayStory />
      <Counter />
      <Anatomy />
      <Chapter n="III" name="What's inside" line="Six cartridges, mixed fresh every morning." tone="light" />
      <Inside />
      <FormulaLab />
      <SkinChart />
      <Chapter n="IV" name="Where it stands" line="A working prototype. Not in public markets yet." />
      <Progress />
      <Research />
      <Model />
      <Business />
      <Pricing />
      <Chapter n="V" name="Who's behind it" line="One student founder, outside partners, and a waitlist." />
      <Voices />
      <Founder />
      <FAQ />
      <Close />
    </main>
  );
}
