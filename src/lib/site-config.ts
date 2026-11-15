import { db } from "@/lib/db";

/**
 * Dashboard-managed website chrome — header nav, hero/about/CTA copy,
 * footer and the home-page section order/visibility.
 *
 * Safety contract (mirrors site-content.ts):
 *   - DB error / missing row / missing area -> defaults shipped in code,
 *     so the public site always renders complete.
 *   - The admin dashboard PUTs one area at a time; saved JSON wins.
 */

export type NavLink = { label: string; href: string };

export type HeaderConfig = {
  links: NavLink[];
  cta: NavLink;
};

export type HeroConfig = {
  badge: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  primary: NavLink;
  secondary: NavLink;
};

export type Pillar = { icon: string; title: string; text: string };

export type AboutConfig = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  intro: string;
  pillars: Pillar[];
};

export type CtaConfig = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  primary: NavLink;
  secondary: NavLink;
};

export type FooterConfig = {
  about: string;
  columns: { title: string; links: NavLink[] }[];
  socials: { icon: string; label: string; href: string }[];
  newsletterBlurb: string;
  copyright: string; // "{year}" token is replaced at render time
  legalLinks: NavLink[];
};

export type SectionHeadingCfg = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
};

export const SECTION_KEYS = [
  "hero",
  "about",
  "products",
  "clients",
  "testimonials",
  "team",
  "cta",
] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export type SectionsConfig = {
  order: SectionKey[];
  visible: Partial<Record<SectionKey, boolean>>;
  headings: Partial<Record<SectionKey, SectionHeadingCfg>>;
};

export type SiteConfigData = {
  header: HeaderConfig;
  hero: HeroConfig;
  about: AboutConfig;
  cta: CtaConfig;
  footer: FooterConfig;
  sections: SectionsConfig;
};

export const PILLAR_ICONS = [
  "users",
  "goal",
  "eye",
  "badge-check",
  "layers",
  "line-chart",
  "shield",
  "rocket",
] as const;

export const SOCIAL_ICONS = [
  "linkedin",
  "twitter",
  "facebook",
  "instagram",
  "youtube",
  "github",
] as const;

/* ---------- Defaults = the copy currently shipped in code ---------- */

export const DEFAULT_SITE_CONFIG: SiteConfigData = {
  header: {
    links: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Our Products", href: "/products" },
      { label: "Services", href: "/services" },
      { label: "Contact Us", href: "/contact" },
    ],
    cta: { label: "Start Your Project", href: "/contact" },
  },

  hero: {
    badge: "Enterprise Technology Solutions",
    title: "Connecting Businesses Through",
    titleAccent: "Intelligent Technology.",
    subtitle:
      "AGMA TEC delivers integrated enterprise technology solutions that empower organizations to streamline operations, improve efficiency, and accelerate digital transformation.",
    primary: { label: "Explore Our Solutions", href: "/products" },
    secondary: { label: "Contact Us", href: "/contact" },
  },

  about: {
    eyebrow: "About AGMA TEC",
    title: "Technology That",
    titleAccent: "Moves Businesses Forward.",
    intro:
      "Like the six beads of our logo — separate nodes fused into one stronger shape — AGMA TEC connects the disconnected parts of an organization: people, processes, data and technology. Our integrated solutions support the full operational core of a business, from finance and HR to facilities and food services.",
    pillars: [
      {
        icon: "users",
        title: "Who We Are",
        text: "AGMA TEC is an enterprise technology company specializing in integrated business management solutions. We develop our own line of software products and combine them with hands-on implementation expertise.",
      },
      {
        icon: "goal",
        title: "Our Mission",
        text: "To simplify how organizations operate. We turn fragmented, manual processes into streamlined digital workflows that save time, reduce cost and give leadership full visibility over the business.",
      },
      {
        icon: "eye",
        title: "Our Vision",
        text: "To be the long-term technology partner organizations rely on — where every business runs on intelligent, connected systems and technology becomes a driver of continuous growth.",
      },
      {
        icon: "badge-check",
        title: "Why AGMA TEC",
        text: "Because we own what we build. Proven products, expert implementation and continuous support come from one accountable team — not a chain of vendors.",
      },
    ],
  },

  cta: {
    eyebrow: "Ready When You Are",
    title: "Let's Build Something",
    titleAccent: "Intelligent Together.",
    description:
      "Discover how AGMA TEC can help your organization improve operations and achieve its digital transformation goals.",
    primary: { label: "Contact Our Team", href: "/contact" },
    secondary: { label: "Explore Our Solutions", href: "/products" },
  },

  footer: {
    about:
      "AGMA TEC is an enterprise technology solutions provider. We develop our own integrated software products — AGMA ERP, AGMA CAFM and AGMA CATERING — that help organizations streamline operations and accelerate digital transformation.",
    columns: [
      {
        title: "Company",
        links: [
          { label: "About us", href: "/about" },
          { label: "Services", href: "/services" },
          { label: "Our Products", href: "/products" },
          { label: "Clients & Partners", href: "/clients" },
          { label: "Contact", href: "/contact" },
        ],
      },
      {
        title: "Products",
        links: [
          { label: "AGMA ERP", href: "/products/agma-erp" },
          { label: "AGMA CAFM", href: "/products/agma-cafm" },
          { label: "AGMA CATERING", href: "/products/agma-catering" },
          { label: "Request a Demo", href: "/contact" },
        ],
      },
    ],
    socials: [
      { icon: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com" },
      { icon: "twitter", label: "X (Twitter)", href: "https://x.com" },
      { icon: "facebook", label: "Facebook", href: "https://www.facebook.com" },
      { icon: "instagram", label: "Instagram", href: "https://www.instagram.com" },
    ],
    newsletterBlurb:
      "Practical insights on software, cloud and AI — one short letter, once a month.",
    copyright:
      "© {year} AGMA TEC — Enterprise Technology Solutions. All rights reserved.",
    legalLinks: [
      { label: "Privacy Policy", href: "/" },
      { label: "Terms of Service", href: "/" },
    ],
  },

  sections: {
    order: [...SECTION_KEYS],
    visible: {
      hero: true,
      about: true,
      products: true,
      clients: true,
      testimonials: true,
      team: true,
      cta: true,
    },
    headings: {
      products: {
        eyebrow: "Product Suite",
        title: "Our Products",
        titleAccent: "& Solutions",
        description:
          "Powerful, integrated solutions designed to simplify business operations, optimize resources, and support organizational growth.",
      },
      clients: {
        eyebrow: "Clients & Partners",
        title: "Trusted by Our",
        titleAccent: "Clients & Partners",
        description:
          "Building successful relationships through technology, collaboration, and shared growth.",
      },
      testimonials: {
        eyebrow: "Client Testimonials",
        title: "What Our Clients Say",
        titleAccent: "About Us",
        description:
          "Real experiences. Meaningful partnerships. Measurable business value.",
      },
      team: {
        eyebrow: "Our Team",
        title: "The People Behind",
        titleAccent: "the Technology.",
        description:
          "Engineers, consultants and support specialists working side by side — so every AGMA solution is delivered and cared for by the same team that built it.",
      },
    },
  },
};

/* ---------- Loader ---------- */

function safeJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

/** Public-site loader — merged config, never throws. */
export async function getSiteConfig(): Promise<SiteConfigData> {
  try {
    const row = await db.siteConfig.findUnique({ where: { id: 1 } });
    if (!row) return DEFAULT_SITE_CONFIG;
    return {
      header: safeJson(row.headerJson, DEFAULT_SITE_CONFIG.header),
      hero: safeJson(row.heroJson, DEFAULT_SITE_CONFIG.hero),
      about: safeJson(row.aboutJson, DEFAULT_SITE_CONFIG.about),
      cta: safeJson(row.ctaJson, DEFAULT_SITE_CONFIG.cta),
      footer: safeJson(row.footerJson, DEFAULT_SITE_CONFIG.footer),
      sections: safeJson(row.sectionsJson, DEFAULT_SITE_CONFIG.sections),
    };
  } catch (err) {
    console.error("getSiteConfig fell back to defaults", err);
    return DEFAULT_SITE_CONFIG;
  }
}
