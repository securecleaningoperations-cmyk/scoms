"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="section dark" style={{ minHeight: "80svh", display: "grid", alignItems: "center" }}>
      <div className="wrap" role="alert">
        <p className="eyebrow">500</p>
        <h1 className="h-xl" style={{ margin: "20px 0" }}>Something went <em>wrong.</em></h1>
        <p className="lead">We hit an unexpected problem. Try again, or head back to a stable page.</p>
        <div className="cta-row" style={{ marginTop: 32 }}><button className="btn light" onClick={reset}>Try again</button><Link href="/sco" className="btn ghost">Back to Home</Link></div>
      </div>
    </section>
  );
}
