import CineHero from "@/components/sco/CineHero";
import { Statement, Reel, Detail, Standards, Closing } from "@/components/sco/CineScenes";
import IndustryPanels from "@/components/sco/IndustryPanels";
import Discovery from "@/components/sco/Discovery";
import ProcessLine from "@/components/sco/ProcessLine";
import QuickEnquiry from "@/components/sco/QuickEnquiry";
import { Services, Locations, Government, CareersBand } from "@/components/sco/Sections";

/**
 * Public home — narrative order:
 * open (hero) → who we are → how we work (pinned reel) → detail → what we do (services) →
 * where (industries) → how it runs (process) → the standard → match your need → regions →
 * government → careers → enquiry → close.
 */
export default function Home() {
  return (
    <>
      <CineHero />
      <Statement />
      <Reel />
      <Detail />
      <div id="services"><Services /></div>
      <IndustryPanels />
      <ProcessLine />
      <Standards />
      <Discovery />
      <Locations />
      <Government />
      <CareersBand />
      <QuickEnquiry />
      <Closing />
    </>
  );
}
