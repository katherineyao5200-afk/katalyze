import AtAGlance from "@/components/home/AtAGlance";
import Close from "@/components/home/Close";
import Founder from "@/components/home/Founder";
import HomeHero from "@/components/home/HomeHero";
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
      <Inside />
      <Progress />
      <Voices />
      <Founder />
      <Close />
    </main>
  );
}
