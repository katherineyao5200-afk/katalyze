import Facts from "@/components/home/Facts";
import Model from "@/components/home/Model";
import FAQ from "@/components/home/FAQ";
import Close from "@/components/home/Close";
import Founder from "@/components/home/Founder";
import SkinRitual from "@/components/home/SkinRitual";
import HomeHero from "@/components/home/HomeHero";
import Anatomy from "@/components/home/Anatomy";
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
      <Facts />
      <SkinRitual />
      <Journey />
      <Research />
      <Progress />
      <Founder />
      <Voices />
      <Inside />
      <Anatomy />
      <SkinChart />
      <Model />
      <FAQ />
      <Close />
    </main>
  );
}
