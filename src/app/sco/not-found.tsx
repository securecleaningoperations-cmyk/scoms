import Link from "next/link";
import { PageHero } from "@/components/sco/templates";

export default function NotFound() {
  return (
    <PageHero crumbs={[{ label: "Home", href: "/sco" }, { label: "404" }]} eyebrow="404" title={<>This surface is <em>not here.</em></>} lead="The page you were looking for has moved or doesn't exist. Let's get you somewhere useful."
      scene="construction" clean={0.3} cta={{ href: "/sco", label: "Back to Home" }} cta2={{ href: "/sco/services", label: "Explore Services" }} />
  );
}
