/**
 * Website content seed — AGMA TEC.
 *
 * Copies the REAL content that currently ships in code
 *   (src/lib/products.ts, src/components/agma/services.tsx,
 *    src/components/agma/testimonials.tsx)
 * into the database so the admin dashboard can manage it.
 *
 * Idempotent: upserts by slug / position. Client & partner logos are
 * intentionally NOT seeded — the site only publishes verified logos,
 * so that list starts empty exactly like the code does today.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const PRODUCTS = [
  {
    slug: "agma-erp",
    name: "AGMA ERP",
    fullName: "Enterprise Resource Planning",
    scope: "Finance · HR · Inventory · Procurement",
    description:
      "An integrated enterprise management solution designed to centralize business operations, streamline workflows, and provide better control over organizational resources.",
    icon: "Boxes",
    accent: "from-brand-600",
    image: "/products/agma-erp.png",
    sortOrder: 1,
    outcomes: [
      "Centralized business operations",
      "Streamlined, automated workflows",
      "Better control over organizational resources",
    ],
    capabilities: [
      { icon: "Calculator", label: "Finance & Accounting", text: "Keep financial data accurate and centralized — from daily transactions to reporting." },
      { icon: "Users", label: "Human Resources & Payroll", text: "Manage employee records, payroll cycles and HR processes in one system." },
      { icon: "Boxes", label: "Inventory Management", text: "Track stock levels, movements and availability across your operations." },
      { icon: "ShoppingCart", label: "Procurement", text: "Structure purchasing from request to order, with clear visibility at every step." },
      { icon: "Cog", label: "Operations Management", text: "Coordinate day-to-day operational activities within a single platform." },
      { icon: "BarChart3", label: "Reporting & Analytics", text: "Turn operational data into clear reports that support better decisions." },
    ],
  },
  {
    slug: "agma-cafm",
    name: "AGMA CAFM",
    fullName: "Computer-Aided Facility Management",
    scope: "Assets · Maintenance · Work Orders",
    description:
      "A comprehensive facility management solution that helps organizations manage buildings, assets, maintenance activities, and facility operations efficiently.",
    icon: "Building2",
    accent: "from-brand-400",
    image: "/products/agma-cafm.png",
    sortOrder: 2,
    outcomes: [
      "Efficient management of buildings and assets",
      "Structured preventive and corrective maintenance",
      "Full visibility of facility operations",
    ],
    capabilities: [
      { icon: "Building2", label: "Asset Management", text: "Maintain a complete, structured record of your buildings and assets." },
      { icon: "Wrench", label: "Preventive & Corrective Maintenance", text: "Plan preventive schedules and resolve corrective issues before they escalate." },
      { icon: "ClipboardList", label: "Work Order Management", text: "Create, assign and follow work orders from request to completion." },
      { icon: "Building", label: "Facility Operations", text: "Organize the day-to-day running of your facilities in one place." },
      { icon: "CalendarCheck", label: "Maintenance Planning", text: "Schedule maintenance activities and keep teams aligned on priorities." },
      { icon: "Gauge", label: "Performance Monitoring", text: "Monitor facility performance with clear operational indicators." },
    ],
  },
  {
    slug: "agma-catering",
    name: "AGMA CATERING",
    fullName: "Catering Management System",
    scope: "Meals · Kitchen · Orders",
    description:
      "An integrated catering management solution that streamlines meal planning, food services, ordering, kitchen operations, and catering workflows.",
    icon: "UtensilsCrossed",
    accent: "from-brand-300",
    image: "/products/agma-catering.png",
    sortOrder: 3,
    outcomes: [
      "Streamlined meal planning and food services",
      "Organized ordering and kitchen operations",
      "Smoother end-to-end catering workflows",
    ],
    capabilities: [
      { icon: "UtensilsCrossed", label: "Meal Management", text: "Plan menus and manage meal service across your operations." },
      { icon: "ChefHat", label: "Catering Operations", text: "Coordinate catering activities from planning to service delivery." },
      { icon: "ShoppingBag", label: "Employee Meal Ordering", text: "Give employees a simple, structured way to order their meals." },
      { icon: "CookingPot", label: "Kitchen Management", text: "Organize kitchen workflows and keep food preparation on schedule." },
      { icon: "ClipboardList", label: "Order Management", text: "Handle incoming orders in one clear, structured pipeline." },
      { icon: "BarChart3", label: "Operational Reporting", text: "Gain clear insight into catering activity and performance." },
    ],
  },
];

const SERVICES = [
  { icon: "Code2", title: "Custom Software Development", text: "Enterprise web platforms, portals and APIs engineered for scale — built on modern stacks, integrated with the systems you already run.", tags: ["Web platforms", "System integration", "APIs"] },
  { icon: "Smartphone", title: "Mobile Applications", text: "Native-quality iOS and Android apps with a single, efficient codebase — from customer-facing products to field-operations tools.", tags: ["iOS & Android", "Flutter", "App-store delivery"] },
  { icon: "CloudLightning", title: "Cloud & DevOps", text: "Migration, infrastructure-as-code and CI/CD pipelines that ship faster with less risk — monitored and optimized around the clock.", tags: ["Azure & AWS", "CI/CD", "Observability"] },
  { icon: "BrainCircuit", title: "Data & AI Solutions", text: "Data pipelines, executive dashboards and applied AI — from predictive models to intelligent agents embedded in your workflows.", tags: ["BI dashboards", "Machine learning", "AI agents"] },
  { icon: "PenTool", title: "UI/UX & Product Design", text: "Research-driven experience design and design systems that make complex enterprise products feel effortless — and unmistakably yours.", tags: ["Research", "Design systems", "Prototyping"] },
  { icon: "Compass", title: "Digital Consulting", text: "Technology roadmaps, ERP advisory and process digitization strategy — a clear, sequenced path from where you are to where you need to be.", tags: ["Roadmapping", "ERP advisory", "Process digitization"] },
];

const TESTIMONIALS = [
  {
    quote: "AGMA TEC didn't just deliver a platform — they restructured how our teams work. The roadmap was honest, the demos were on time, and the results showed up in our P&L within two quarters.",
    name: "Managing Director",
    org: "Regional retail group",
    initials: "MD",
  },
  {
    quote: "We had five disconnected systems and zero visibility. Six months later we run our entire operation from one dashboard. Their engineers felt like part of our own team.",
    name: "Chief Operating Officer",
    org: "Logistics provider",
    initials: "CO",
  },
  {
    quote: "The migration was flawless — zero unplanned downtime across all facilities. What impressed us most was the knowledge transfer; our staff now own the system completely.",
    name: "Head of IT",
    org: "Manufacturing group",
    initials: "HI",
  },
];

async function main() {
  for (const p of PRODUCTS) {
    const data = {
      name: p.name,
      fullName: p.fullName,
      scope: p.scope,
      description: p.description,
      icon: p.icon,
      accent: p.accent,
      image: p.image,
      sortOrder: p.sortOrder,
      capabilitiesJson: JSON.stringify(p.capabilities),
      outcomesJson: JSON.stringify(p.outcomes),
    };
    await db.product.upsert({ where: { slug: p.slug }, update: data, create: { slug: p.slug, ...data } });
  }

  const serviceCount = await db.service.count();
  if (serviceCount === 0) {
    for (let i = 0; i < SERVICES.length; i++) {
      const s = SERVICES[i];
      await db.service.create({
        data: { title: s.title, text: s.text, icon: s.icon, tagsJson: JSON.stringify(s.tags), sortOrder: i + 1 },
      });
    }
  }

  const quoteCount = await db.testimonial.count();
  if (quoteCount === 0) {
    for (let i = 0; i < TESTIMONIALS.length; i++) {
      const t = TESTIMONIALS[i];
      await db.testimonial.create({ data: { ...t, sortOrder: i + 1 } });
    }
  }

  const [p, s, t, l] = await Promise.all([
    db.product.count(),
    db.service.count(),
    db.testimonial.count(),
    db.clientLogo.count(),
  ]);
  console.log(`Seeded website content — products: ${p}, services: ${s}, testimonials: ${t}, client logos: ${l}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
