import { PageHero, Reveal } from "@/components/sco/templates";
import FindServices from "@/components/sco/FindServices";

export const metadata = { title: "Find Services Near You" };

export default function Page() {
  return (
    <>
      <PageHero crumbs={[{ label: "Home", href: "/sco" }, { label: "Find Your Service Area" }]} eyebrow="Service area" title={<>Find services <em>near you.</em></>} lead="Search by ZIP, city, county, state or market to see where and how we can help." scene="government" clean={0.8} />
      <Reveal className="section" as="section"><div className="wrap" data-in><FindServices /></div></Reveal>
    </>
  );
}
