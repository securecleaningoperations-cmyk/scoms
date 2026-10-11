import { notFound } from "next/navigation";
import { PageHero, Reveal } from "@/components/sco/templates";

const docs: Record<string, string> = { privacy: "Privacy", terms: "Terms", accessibility: "Accessibility", "cookie-policy": "Cookie Policy" };
export function generateStaticParams() { return Object.keys(docs).map((slug) => ({ slug })); }

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = docs[slug]; if (!t) notFound();
  return (
    <>
      <PageHero crumbs={[{ label: "Home", href: "/" }, { label: t }]} eyebrow="Legal" title={t} lead="Final legal copy is supplied by Secure Cleaning Operations Inc. before launch." scene="office" clean={0.7} />
      <Reveal className="section" as="section"><div className="wrap"><p className="lead" data-in>{slug === "accessibility" ? "We aim for keyboard, screen-reader and reduced-motion support throughout the site. To report a barrier, use the Contact page." : "Placeholder — replace with approved policy text."}</p></div></Reveal>
    </>
  );
}
