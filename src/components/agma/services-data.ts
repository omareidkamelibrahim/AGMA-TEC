import {
  BrainCircuit,
  CloudLightning,
  Code2,
  Compass,
  PenTool,
  Smartphone,
} from "lucide-react";

/**
 * Static fallback service list — the content that ships with the site.
 * The live list is DB-managed (see src/lib/site-content.ts) and edited
 * from the admin dashboard; this constant is only used when the database
 * is unavailable or was never seeded.
 */
export const SERVICES = [
  {
    icon: Code2,
    title: "Custom Software Development",
    text: "Enterprise web platforms, portals and APIs engineered for scale — built on modern stacks, integrated with the systems you already run.",
    tags: ["Web platforms", "System integration", "APIs"],
  },
  {
    icon: Smartphone,
    title: "Mobile Applications",
    text: "Native-quality iOS and Android apps with a single, efficient codebase — from customer-facing products to field-operations tools.",
    tags: ["iOS & Android", "Flutter", "App-store delivery"],
  },
  {
    icon: CloudLightning,
    title: "Cloud & DevOps",
    text: "Migration, infrastructure-as-code and CI/CD pipelines that ship faster with less risk — monitored and optimized around the clock.",
    tags: ["Azure & AWS", "CI/CD", "Observability"],
  },
  {
    icon: BrainCircuit,
    title: "Data & AI Solutions",
    text: "Data pipelines, executive dashboards and applied AI — from predictive models to intelligent agents embedded in your workflows.",
    tags: ["BI dashboards", "Machine learning", "AI agents"],
  },
  {
    icon: PenTool,
    title: "UI/UX & Product Design",
    text: "Research-driven experience design and design systems that make complex enterprise products feel effortless — and unmistakably yours.",
    tags: ["Research", "Design systems", "Prototyping"],
  },
  {
    icon: Compass,
    title: "Digital Consulting",
    text: "Technology roadmaps, ERP advisory and process digitization strategy — a clear, sequenced path from where you are to where you need to be.",
    tags: ["Roadmapping", "ERP advisory", "Process digitization"],
  },
];

export type ServiceStatic = (typeof SERVICES)[number];
