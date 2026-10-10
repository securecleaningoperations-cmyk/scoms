"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, Menu, X, ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import Logo from "./Logo";
import Environment from "./Environment";
import { nav } from "./nav-data";
import { searchIndex, services, industries, regions } from "@/lib/sco/content";

function Header({ onSearch, lang, setLang }: { onSearch: () => void; lang: "EN" | "ES"; setLang: (l: "EN" | "ES") => void }) {
  const [solid, setSolid] = useState(false);
  const [hide, setHide] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const last = useRef(0);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      setHide(y > last.current && y > 500 && !open && !mobile);
      last.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open, mobile]);

  useEffect(() => { setOpen(null); setMobile(false); }, [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(null); setMobile(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => { document.documentElement.style.overflow = mobile ? "hidden" : ""; }, [mobile]);

  const active = nav.find((n) => n.key === open);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hold = () => { if (closeTimer.current) clearTimeout(closeTimer.current); };
  const leave = () => { hold(); closeTimer.current = setTimeout(() => setOpen(null), 160); };

  return (
    <>
      <header className={`hdr ${solid || open || mobile ? "solid" : ""} ${open || mobile ? "open" : ""} ${hide ? "hide" : ""}`} onMouseLeave={leave} onMouseEnter={hold}>
        <div className="wrap hdr-in">
          <Link href="/sco" className="logo" aria-label="Secure Cleaning Operations home"><Logo /></Link>
          <nav aria-label="Primary" className="nav-wrap" style={{ marginLeft: "auto" }}>
            <ul className="nav" style={{ padding: 0, margin: 0 }}>
              {nav.map((n) => (
                <li key={n.key}>
                  <button className="nav-btn" aria-expanded={open === n.key} aria-haspopup="true" onMouseEnter={() => { hold(); setOpen(n.key); }} onFocus={() => setOpen(n.key)} onClick={() => setOpen(open === n.key ? null : n.key)}>
                    {n.label === "Government & Procurement" ? "Gov & Procurement" : n.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="hdr-actions" style={{ marginLeft: 0 }}>
            <button className="lang" aria-label="Switch language" onClick={() => setLang(lang === "EN" ? "ES" : "EN")}>
              <b>{lang === "EN" ? "English" : "Español"}</b> <span>|</span> <span>{lang === "EN" ? "ES" : "EN"}</span>
            </button>
            <button className="icon-btn" aria-label="Search" onClick={onSearch}><Search size={19} /></button>
            <Link href="/login" className="lang" style={{ opacity: .8 }}>Clients</Link>
            <Link href="/login" className="lang" style={{ opacity: .8 }}>Employees</Link>
            <Link href="/sco/request/consultation" className="btn cta-desktop" data-cursor="">Request a Consultation <span className="arr">→</span></Link>
            <button className="icon-btn burger" aria-label={mobile ? "Close menu" : "Open menu"} aria-expanded={mobile} onClick={() => setMobile(!mobile)}>{mobile ? <X size={22} /> : <Menu size={22} />}</button>
          </div>
        </div>
      </header>

      <div className={`mega ${active ? "on" : ""}`} onMouseEnter={hold} onMouseLeave={leave} role="region" aria-label={active?.label ?? "Menu"}>
        {active && (
          <div className="wrap mega-grid">
            <div className="mega-lead">
              <div className="mega-prev"><Environment variant={active.scene} style={{ ["--clean" as string]: 0.85 }} /></div>
              <span className="eyebrow">{active.label}</span>
              <h3>{active.blurb}</h3>
              <Link href={active.href} className="tlink">Explore {active.label} <ArrowUpRight size={16} /></Link>
            </div>
            <div className={`mega-cols ${active.cols === 3 ? "c3" : ""}`}>
              {active.links.map((l, i) => (
                <Link key={l.label} href={l.href} className="mega-link">{l.label}<span>{String(i + 1).padStart(2, "0")}</span></Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className={`scrim ${active ? "on" : ""}`} onClick={() => setOpen(null)} />

      <div className={`mnav ${mobile ? "on" : ""}`} aria-hidden={!mobile}>
        {nav.map((n) => (
          <details key={n.key}>
            <summary>{n.label}</summary>
            {n.links.map((l) => <Link key={l.label} href={l.href} tabIndex={mobile ? 0 : -1}>{l.label}</Link>)}
          </details>
        ))}
        <div className="row">
          <Link href="/sco/request/consultation" className="btn light" tabIndex={mobile ? 0 : -1}>Request a Consultation →</Link>
          <Link href="/login" className="btn ghost" tabIndex={mobile ? 0 : -1}>Clients</Link>
          <Link href="/login" className="btn ghost" tabIndex={mobile ? 0 : -1}>Employees</Link>
          <button className="btn ghost" onClick={() => setLang(lang === "EN" ? "ES" : "EN")}>{lang === "EN" ? "Español" : "English"}</button>
        </div>
      </div>
    </>
  );
}

function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) { setTimeout(() => input.current?.focus(), 80); document.documentElement.style.overflow = "hidden"; }
    else document.documentElement.style.overflow = "";
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);

  const groups = ["All", "Services", "Industries", "Locations", "Careers", "Resources", "FAQs"];
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    const list = searchIndex.filter((r) => (filter === "All" || r.group === filter) && (!t || `${r.title} ${r.text}`.toLowerCase().includes(t)));
    const by: Record<string, typeof list> = {};
    list.forEach((r) => (by[r.group] ||= []).push(r));
    return by;
  }, [q, filter]);
  const empty = Object.keys(results).length === 0;

  return (
    <div className={`search ${open ? "on" : ""}`} role="dialog" aria-modal="true" aria-label="Search" aria-hidden={!open}>
      <div className="search-in">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28 }}>
          <span className="eyebrow">Search SCO</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close search"><X size={22} /></button>
        </div>
        <div className="search-box">
          <Search size={26} />
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Services, industries, locations…" aria-label="Search the site" />
        </div>
        <div className="chips" role="group" aria-label="Filter results">
          {groups.map((g) => <button key={g} className={`chip ${filter === g ? "on" : ""}`} onClick={() => setFilter(g)}>{g}</button>)}
        </div>
        {!q && <p style={{ opacity: .5, marginTop: 28, fontSize: 14 }}>Popular: Post-Construction Cleaning · Floor Care · Healthcare · Maryland · Careers</p>}
        {Object.entries(results).map(([g, items]) => (
          <div className="s-group" key={g}>
            <h4>{g}</h4>
            {items.slice(0, 8).map((r) => (
              <Link key={r.href + r.title} href={r.href} className="s-item" onClick={onClose}><span>{r.title}</span><small>{r.text}</small></Link>
            ))}
          </div>
        ))}
        {empty && (
          <div className="s-group">
            <h4>No results</h4>
            <p style={{ opacity: .8, maxWidth: "52ch" }}>Nothing matched “{q}”. Try a service name, an industry or a state — or ask us directly.</p>
            <div style={{ marginTop: 18 }}><Link href="/sco/contact" className="btn light" onClick={onClose}>Contact Us →</Link></div>
          </div>
        )}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="ftr dark">
      <div className="wrap">
        <h2 className="ftr-big">Let&apos;s build the right <em>solution</em> for your organization.</h2>
        <div style={{ marginTop: 34 }} className="cta-row">
          <Link href="/sco/request/consultation" className="btn light">Request a Consultation <span className="arr">→</span></Link>
          <Link href="/sco/find-services" className="btn ghost">Find Your Service Area</Link>
        </div>
        <div className="ftr-cols">
          <div><h5>Company</h5><ul>{[["About SCO", "/sco/about"], ["Leadership", "/sco/about/leadership"], ["Our Standards", "/sco/about/standards"], ["Safety & Quality", "/sco/about/safety-quality"], ["Technology", "/sco/about/technology"]].map(([l, h]) => <li key={l}><Link href={h}>{l}</Link></li>)}</ul></div>
          <div><h5>Services</h5><ul>{services.slice(0, 7).map((s) => <li key={s.slug}><Link href={`/sco/services/${s.slug}`}>{s.title}</Link></li>)}<li><Link href="/sco/services">All services</Link></li></ul></div>
          <div><h5>Industries</h5><ul>{industries.slice(0, 7).map((s) => <li key={s.slug}><Link href={`/sco/industries/${s.slug}`}>{s.title}</Link></li>)}<li><Link href="/sco/industries">All industries</Link></li></ul></div>
          <div><h5>Locations</h5><ul>{regions.map((r) => <li key={r.slug}><Link href={`/sco/locations/${r.slug}`}>{r.name}</Link></li>)}<li><Link href="/sco/find-services">Find Your Service Area</Link></li></ul></div>
          <div><h5>Government</h5><ul>{[["Government Services", "/sco/government"], ["Procurement", "/sco/government/procurement"], ["Capability Information", "/sco/government/capability"], ["Compliance", "/sco/government/compliance"]].map(([l, h]) => <li key={l}><Link href={h}>{l}</Link></li>)}</ul></div>
          <div><h5>Careers</h5><ul>{[["Careers", "/sco/careers"], ["Open Positions", "/sco/careers/positions"], ["Apply", "/sco/careers/apply"], ["Applicant Login", "/sco/careers/dashboard"]].map(([l, h]) => <li key={l}><Link href={h}>{l}</Link></li>)}</ul></div>
          <div><h5>Resources</h5><ul>{[["Insights", "/sco/resources"], ["FAQs", "/sco/resources#faqs"]].map(([l, h]) => <li key={l}><Link href={h}>{l}</Link></li>)}</ul></div>
          <div><h5>Contact</h5><ul>{[["Request Service", "/sco/request/service"], ["Request Proposal", "/sco/request/proposal"], ["General Contact", "/sco/contact"], ["Client Login", "/login"], ["Employee Access", "/login"], ["Mobile / QR", "/sco/qr"]].map(([l, h]) => <li key={l}><Link href={h}>{l}</Link></li>)}</ul></div>
        </div>
        <div className="ftr-base">
          <span>© {new Date().getFullYear()} Secure Cleaning Operations Inc.</span>
          <nav aria-label="Legal">{["Privacy", "Terms", "Accessibility", "Cookie Policy"].map((l) => <Link key={l} href={`/sco/legal/${l.toLowerCase().replace(" ", "-")}`}>{l}</Link>)}</nav>
        </div>
        <div className="ftr-word" aria-hidden="true">People · Process · Quality</div>
      </div>
    </footer>
  );
}

function Cursor() {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const node = el.current!;
    const xTo = gsap.quickTo(node, "x", { duration: 0.45, ease: "power3" });
    const yTo = gsap.quickTo(node, "y", { duration: 0.45, ease: "power3" });
    const move = (e: MouseEvent) => {
      xTo(e.clientX + 100); yTo(e.clientY + 100); // offset cancels the -100px base transform
      const t = (e.target as HTMLElement | null)?.closest?.("[data-cursor]") as HTMLElement | null;
      const label = t?.dataset.cursor;
      if (label) { node.textContent = label; node.classList.add("show"); gsap.to(node, { scale: 1, duration: 0.35, ease: "power3.out", overwrite: "auto" }); }
      else { gsap.to(node, { scale: 0, duration: 0.25, overwrite: "auto" }); node.classList.remove("show"); }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return <div ref={el} className="cursor" aria-hidden="true" />;
}

function Transitions({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const strips = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    // arrival: strips sweep off
    const s = strips.current?.children;
    if (!s) return;
    const off = (i: number) => -(i * 20 + 40) + "vw";
    const out = (i: number) => 130 - i * 20 + "vw";
    if (reduce() || !busy.current) { gsap.set(s, { x: off }); busy.current = false; return; }
    gsap.fromTo(s, { x: 0 }, { x: out, duration: 0.7, stagger: 0.06, ease: "power3.inOut", onComplete: () => { busy.current = false; gsap.set(s, { x: off }); } });
    window.scrollTo(0, 0);
  }, [pathname]);

  const onClick = useCallback((e: React.MouseEvent) => {
    const a = (e.target as HTMLElement).closest("a") as HTMLAnchorElement | null;
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || reduce()) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !url.pathname.startsWith("/sco") || url.pathname === location.pathname) return;
    e.preventDefault();
    if (busy.current) return;
    busy.current = true;
    const s = strips.current!.children;
    gsap.to(s, { x: 0, duration: 0.5, stagger: 0.05, ease: "power3.inOut", onComplete: () => router.push(url.pathname + url.search + url.hash) });
  }, [router]);

  return (
    <div onClickCapture={onClick}>
      <div className="ptrans" ref={strips} aria-hidden="true"><i /><i /><i /><i /><i /></div>
      {children}
    </div>
  );
}

export default function Chrome({ children }: { children: React.ReactNode }) {
  const [searching, setSearching] = useState(false);
  const [lang, setLang] = useState<"EN" | "ES">("EN");
  useEffect(() => { document.documentElement.lang = lang === "EN" ? "en" : "es"; }, [lang]);
  const close = useCallback(() => setSearching(false), []);
  return (
    <Transitions>
      <a href="#main" className="skip">Skip to content</a>
      <Header onSearch={() => setSearching(true)} lang={lang} setLang={setLang} />
      <SearchOverlay open={searching} onClose={close} />
      <main id="main">{children}</main>
      <Footer />
      <Cursor />
    </Transitions>
  );
}
