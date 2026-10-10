"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import MultiStepForm, { type StepDef } from "./MultiStepForm";
import { services } from "@/lib/sco/content";

function Inner(props: { id: string; title: string; steps: StepDef[]; submitLabel: string; successTitle: string; successBody: string; next: { href: string; label: string } }) {
  const sp = useSearchParams();
  const initial: Record<string, string> = {};
  const svc = sp.get("service"); const loc = sp.get("location"); const ind = sp.get("industry");
  if (svc) { const s = services.find((x) => x.slug === svc); if (s) initial.service = s.title; }
  if (loc) { initial.location = loc; initial.address = loc; }
  if (ind) initial.industry = ind;
  return <MultiStepForm id={props.id} title={props.title} steps={props.steps} submitLabel={props.submitLabel} successTitle={props.successTitle} successBody={props.successBody} successNext={props.next} initial={initial} />;
}

export default function RequestPage(props: { id: string; title: string; steps: StepDef[]; submitLabel: string; successTitle: string; successBody: string; next: { href: string; label: string } }) {
  return <Suspense fallback={<div className="loading-bar" />}><Inner {...props} /></Suspense>;
}
