/**
 * Demo activity seed — ContactMessage inquiries + NewsletterSubscriber rows.
 *
 * The HR side of the dashboard ships with seeded demo data (158 employees,
 * payroll runs, leave requests). The website funnel had no rows at all,
 * which made the dashboard charts read as empty. This script adds clearly
 * synthetic demo inquiries/subscribers spread over the last ~75 days so the
 * funnel charts, service breakdown and activity feed have something honest
 * to display. Every row uses the @demo.agma.tech domain — filter on that
 * (or run scripts/cleanup-demo-activity.ts) to remove them.
 *
 * Idempotent: skips when demo rows already exist.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const SERVICES = [
  "Custom Software Development",
  "Mobile Applications",
  "Cloud & DevOps",
  "Data & AI Solutions",
  "UI/UX & Product Design",
  "Digital Consulting",
];

const PRODUCTS = ["AGMA ERP", "AGMA CAFM", "AGMA CATERING"];

const PEOPLE = [
  ["Khalid Al-Otaibi", "Al-Otaibi Trading Group"],
  ["Sara Mansour", "Najd Retail Co."],
  ["Omar Haddad", "Riyadh Logistics"],
  ["Layla Nasser", "Coastal Hospitality"],
  ["Yousef Karim", "MedCare Clinics"],
  ["Noura Al-Sudairi", "Falcon Contracting"],
  ["Tariq Ammar", "BlueWave Marine"],
  ["Hind Abdullah", "Aurora Education"],
  ["FaisalDouhan", "Mais Oil & Gas"],
  ["Reem Al-Qahtani", "Terra Agriculture"],
  ["Bilal Sheikh", "MetroFit Gyms"],
  ["Dana Khoury", "Sakan Real Estate"],
];

const MESSAGES = [
  "We are evaluating an integrated ERP for our distribution business and would like a demo with pricing.",
  "Our legacy inventory system is failing us. Can you scope a modernization project?",
  "Looking for a partner to build a customer-facing mobile app on iOS and Android.",
  "We need help migrating our on-prem workloads to the cloud with a proper CI/CD pipeline.",
  "Interested in a dashboard and analytics layer on top of our existing operations data.",
  "Please share a proposal for redesigning our corporate website and product portal.",
  "We would like to automate our procurement and approval workflows end to end.",
  "Can AGMA CAFM handle multi-site maintenance scheduling for facility teams?",
  "Requesting a consultation about digital transformation for a mid-size contracting firm.",
  "Our catering operation needs production planning and order tracking. Is AGMA CATERING a fit?",
  "We need a long-term development partner for ongoing feature work on our platform.",
  "Interested in BI reporting for finance and HR with role-based access.",
];

const rand = (n: number) => Math.floor(Math.random() * n);
const pick = <T,>(arr: T[]): T => arr[rand(arr.length)];

async function main() {
  const existing = await db.contactMessage.count({
    where: { email: { contains: "@demo.agma.tech" } },
  });
  if (existing > 0) {
    console.log(`Demo rows already present (inquiries: ${existing}) — skipping.`);
    return;
  }

  const DAY = 86_400_000;
  const now = Date.now();

  // 26 inquiries over the last 75 days, weighted toward recent weeks.
  const inquiries: {
    name: string;
    email: string;
    company: string;
    service: string | null;
    message: string;
    status: string;
    createdAt: Date;
  }[] = [];

  for (let i = 0; i < 26; i++) {
    const [name, company] = pick(PEOPLE);
    // product-focused inquiries keep the service field null, like the real form
    const aboutProduct = rand(4) === 0;
    const service = aboutProduct ? pick(PRODUCTS) : pick(SERVICES);
    const ageDays = Math.floor(Math.pow(rand(75), 1.25)) % 75; // skew recent
    // ~70% of older ones are handled; recent ones mostly still New
    const status = ageDays > 10 ? (rand(10) < 7 ? "Handled" : "New") : rand(10) < 3 ? "Handled" : "New";
    inquiries.push({
      name,
      email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@demo.agma.tech`,
      company,
      service: aboutProduct ? null : service,
      message: aboutProduct
        ? `${pick(MESSAGES.slice(7, 10))}`
        : pick(MESSAGES.filter((_, idx) => idx < 7)),
      status,
      createdAt: new Date(now - ageDays * DAY - rand(12) * 3_600_000),
    });
  }
  await db.contactMessage.createMany({ data: inquiries });

  // 22 newsletter subscribers over the last 60 days.
  const domains = ["gmail.com", "outlook.com", "company.sa", "corp-me.com", "arrow.dev"];
  const subs: { email: string; createdAt: Date }[] = [];
  for (let i = 0; i < 22; i++) {
    const [name] = pick(PEOPLE);
    const tag = `${name.toLowerCase().replace(/[^a-z]+/g, "")}${i}`;
    const ageDays = Math.floor(Math.pow(rand(60), 1.2)) % 60;
    subs.push({
      email: `${tag}@demo.${pick(domains)}`.replace("demo.demo.", "demo."),
      createdAt: new Date(now - ageDays * DAY - rand(20) * 3_600_000),
    });
  }
  await db.newsletterSubscriber.createMany({ data: subs });

  console.log(
    `Seeded demo activity — inquiries: ${inquiries.length}, subscribers: ${subs.length}. Remove with scripts/cleanup-demo-activity.ts.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
