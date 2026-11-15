import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  DEFAULT_SITE_CONFIG,
  PILLAR_ICONS,
  SECTION_KEYS,
  SOCIAL_ICONS,
  getSiteConfig,
  type NavLink,
} from "@/lib/site-config";

type Area = "header" | "hero" | "about" | "cta" | "footer" | "sections";

const AREA_FIELD: Record<Area, string> = {
  header: "headerJson",
  hero: "heroJson",
  about: "aboutJson",
  cta: "ctaJson",
  footer: "footerJson",
  sections: "sectionsJson",
};

const bad = (error: string) => NextResponse.json({ error }, { status: 400 });

const isNavLink = (v: unknown): v is NavLink =>
  !!v && typeof v === "object" &&
  typeof (v as NavLink).label === "string" && (v as NavLink).label.trim().length > 0 &&
  typeof (v as NavLink).href === "string" && (v as NavLink).href.trim().length > 0;

const isLinkArray = (v: unknown, max = 12): v is NavLink[] =>
  Array.isArray(v) && v.length > 0 && v.length <= max && v.every(isNavLink);

const str = (v: unknown, min = 1, max = 2000): v is string =>
  typeof v === "string" && v.trim().length >= min && v.length <= max;

/** GET /api/admin/site-config — merged config (defaults for unsaved areas). */
export async function GET() {
  return NextResponse.json(await getSiteConfig());
}

/**
 * PUT /api/admin/site-config — save one area.
 * Body: { area: "header"|"hero"|"about"|"cta"|"footer"|"sections", data: ... }
 */
export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const area = body?.area as Area;
  const data = body?.data;

  if (!(area in AREA_FIELD)) return bad("Unknown area");
  if (!data || typeof data !== "object") return bad("Missing data");

  switch (area) {
    case "header":
      if (!isLinkArray(data.links, 10)) return bad("Nav links must be 1–10 label + href items");
      if (!isNavLink(data.cta)) return bad("CTA needs a label and href");
      break;

    case "hero":
      if (!str(data.badge, 2, 80)) return bad("Invalid badge");
      if (!str(data.title, 2, 120)) return bad("Invalid title");
      if (!str(data.titleAccent, 1, 120)) return bad("Invalid title accent");
      if (!str(data.subtitle, 10, 500)) return bad("Invalid subtitle");
      if (!isNavLink(data.primary) || !isNavLink(data.secondary)) return bad("Both hero buttons need a label and href");
      break;

    case "about":
      if (!str(data.eyebrow, 2, 60)) return bad("Invalid eyebrow");
      if (!str(data.title, 2, 120) || !str(data.titleAccent, 1, 120)) return bad("Invalid title");
      if (!str(data.intro, 20, 1200)) return bad("Invalid intro paragraph");
      if (!Array.isArray(data.pillars) || data.pillars.length !== 4) return bad("Exactly 4 pillar cards required");
      for (const p of data.pillars) {
        if (!str(p.title, 2, 60) || !str(p.text, 10, 600)) return bad("Invalid pillar card");
        if (!PILLAR_ICONS.includes(p.icon)) return bad(`Unknown pillar icon: ${p.icon}`);
      }
      break;

    case "cta":
      if (!str(data.eyebrow, 2, 60)) return bad("Invalid eyebrow");
      if (!str(data.title, 2, 120) || !str(data.titleAccent, 1, 120)) return bad("Invalid title");
      if (!str(data.description, 10, 400)) return bad("Invalid description");
      if (!isNavLink(data.primary) || !isNavLink(data.secondary)) return bad("Both CTA buttons need a label and href");
      break;

    case "footer":
      if (!str(data.about, 20, 800)) return bad("Invalid footer about text");
      if (!Array.isArray(data.columns) || data.columns.length === 0 || data.columns.length > 3)
        return bad("1–3 footer link columns required");
      for (const col of data.columns) {
        if (!str(col.title, 1, 40)) return bad("Invalid column title");
        if (!isLinkArray(col.links, 10)) return bad(`Column "${col.title}" needs 1–10 links`);
      }
      if (!Array.isArray(data.socials) || data.socials.length > 6) return bad("Up to 6 socials allowed");
      for (const s of data.socials) {
        if (!str(s.label, 1, 40) || !str(s.href, 4, 300)) return bad("Invalid social link");
        if (!SOCIAL_ICONS.includes(s.icon)) return bad(`Unknown social icon: ${s.icon}`);
      }
      if (!str(data.newsletterBlurb, 5, 300)) return bad("Invalid newsletter blurb");
      if (!str(data.copyright, 5, 200)) return bad("Invalid copyright line");
      if (!Array.isArray(data.legalLinks) || data.legalLinks.length > 4) return bad("Up to 4 legal links allowed");
      for (const l of data.legalLinks) if (!isNavLink(l)) return bad("Invalid legal link");
      break;

    case "sections": {
      const order = data.order;
      if (!Array.isArray(order) || order.length !== SECTION_KEYS.length ||
        !order.every((k: unknown) => SECTION_KEYS.includes(k as (typeof SECTION_KEYS)[number])) ||
        new Set(order).size !== SECTION_KEYS.length)
        return bad(`order must be a permutation of: ${SECTION_KEYS.join(", ")}`);
      for (const v of Object.values(data.visible ?? {})) if (typeof v !== "boolean") return bad("visible values must be booleans");
      for (const [key, h] of Object.entries(data.headings ?? {})) {
        if (!SECTION_KEYS.includes(key as (typeof SECTION_KEYS)[number])) return bad(`Unknown section: ${key}`);
        const hh = h as Record<string, unknown>;
        if (!str(hh.eyebrow, 1, 60) || !str(hh.title, 1, 120) || !str(hh.titleAccent, 0, 120) || !str(hh.description, 5, 300))
          return bad(`Invalid heading for section "${key}"`);
      }
      break;
    }
  }

  const field = AREA_FIELD[area];
  const json = JSON.stringify(data);
  await db.siteConfig.upsert({
    where: { id: 1 },
    update: { [field]: json },
    create: {
      id: 1,
      headerJson: JSON.stringify(DEFAULT_SITE_CONFIG.header),
      heroJson: JSON.stringify(DEFAULT_SITE_CONFIG.hero),
      aboutJson: JSON.stringify(DEFAULT_SITE_CONFIG.about),
      ctaJson: JSON.stringify(DEFAULT_SITE_CONFIG.cta),
      footerJson: JSON.stringify(DEFAULT_SITE_CONFIG.footer),
      sectionsJson: JSON.stringify(DEFAULT_SITE_CONFIG.sections),
      [field]: json,
    },
  });

  return NextResponse.json({ ok: true });
}
