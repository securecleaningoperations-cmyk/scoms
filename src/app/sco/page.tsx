import Hero from "@/components/sco/Hero";
import Discovery from "@/components/sco/Discovery";
import IndustryPanels from "@/components/sco/IndustryPanels";
import GlassReveal from "@/components/sco/GlassReveal";
import FloorScene from "@/components/sco/FloorScene";
import PostConstruction from "@/components/sco/PostConstruction";
import Pillars from "@/components/sco/Pillars";
import ProcessLine from "@/components/sco/ProcessLine";
import TechScene from "@/components/sco/TechScene";
import { Services, Accountability, Critical, Locations, Government, CareersBand, FinalCta } from "@/components/sco/Sections";

export default function Home() {
  return (
    <>
      <Hero />
      <Discovery />
      <IndustryPanels />
      <GlassReveal
        eyebrow="Healthcare · Clarity"
        variant="healthcare"
        title={<>Clear the glass. <em>See the standard.</em></>}
        body="Controlled, bright and meticulous. High-touch surfaces and shared spaces are cleaned with care and verified before they are called complete."
        cta={{ href: "/sco/services/healthcare-cleaning", label: "Explore Healthcare Cleaning" }}
      />
      <FloorScene />
      <Services />
      <PostConstruction />
      <Accountability />
      <Pillars />
      <Critical />
      <ProcessLine />
      <TechScene />
      <Locations />
      <Government />
      <CareersBand />
      <FinalCta />
    </>
  );
}
