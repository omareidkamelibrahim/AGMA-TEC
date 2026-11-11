import { db } from "@/lib/db";
import { iconFromName } from "@/lib/icon-map";
import { PRODUCTS, type Capability, type Product } from "@/lib/products";
import { SERVICES } from "@/components/agma/services-data";
import { QUOTES, type Quote } from "@/components/agma/testimonials-data";

/**
 * Server-side loaders for website content.
 *
 * The admin dashboard manages these rows; the public site renders them.
 * Safety contract:
 *   - DB error            -> fall back to the content shipped in code
 *   - DB empty (no rows)  -> same fallback, so a fresh database still
 *                            renders a complete marketing site
 *   - rows exist          -> published rows win, even if the admin
 *                            un-publishes or deletes everything
 */

export type ServiceCard = {
  icon: ReturnType<typeof iconFromName>;
  title: string;
  text: string;
  tags: string[];
};

function safeJson<T>(raw: string, fallback: T): T {
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function rowToProduct(row: {
  slug: string;
  name: string;
  fullName: string;
  scope: string;
  description: string;
  icon: string;
  accent: string;
  image: string;
  capabilitiesJson: string;
  outcomesJson: string;
}): Product {
  const capabilities = safeJson<{ icon: string; label: string; text: string }[]>(
    row.capabilitiesJson,
    [],
  ).map((c) => ({
    icon: iconFromName(c.icon),
    label: c.label,
    text: c.text,
  }));
  return {
    slug: row.slug,
    index: "",
    name: row.name,
    full: row.fullName,
    icon: iconFromName(row.icon),
    scope: row.scope,
    description: row.description,
    capabilities: capabilities as Capability[],
    outcomes: safeJson<string[]>(row.outcomesJson, []),
    accent: row.accent,
    image: row.image,
  };
}

/** Product index numbers (01, 02 …) are positional — computed after fetch. */
function withIndexes(products: Product[]): Product[] {
  return products.map((p, i) => ({ ...p, index: String(i + 1).padStart(2, "0") }));
}

export async function getProducts(): Promise<Product[]> {
  try {
    const rows = await db.product.findMany({ orderBy: { sortOrder: "asc" } });
    if (rows.length === 0) return PRODUCTS;
    return withIndexes(rows.filter((r) => r.published).map(rowToProduct));
  } catch (err) {
    console.error("getProducts fell back to static content", err);
    return PRODUCTS;
  }
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const products = await getProducts();
  const product = products.find((p) => p.slug === slug);
  if (!product) throw new Error(`Unknown product: ${slug}`);
  return product;
}

export async function getServices(): Promise<ServiceCard[]> {
  try {
    const rows = await db.service.findMany({ orderBy: { sortOrder: "asc" } });
    if (rows.length === 0) return SERVICES;
    return rows
      .filter((r) => r.published)
      .map((r) => ({
        icon: iconFromName(r.icon),
        title: r.title,
        text: r.text,
        tags: safeJson<string[]>(r.tagsJson, []),
      }));
  } catch (err) {
    console.error("getServices fell back to static content", err);
    return SERVICES;
  }
}

export async function getTestimonials(): Promise<Quote[]> {
  try {
    const rows = await db.testimonial.findMany({ orderBy: { sortOrder: "asc" } });
    if (rows.length === 0) return QUOTES;
    return rows
      .filter((r) => r.published)
      .map((r) => ({ quote: r.quote, name: r.name, org: r.org, initials: r.initials }));
  } catch (err) {
    console.error("getTestimonials fell back to static content", err);
    return QUOTES;
  }
}

export async function getClientLogos(): Promise<{
  clients: { src: string; alt: string }[];
  partners: { src: string; alt: string }[];
}> {
  try {
    const rows = await db.clientLogo.findMany({ orderBy: { sortOrder: "asc" } });
    const published = rows.filter((r) => r.published);
    return {
      clients: published
        .filter((r) => r.kind === "client")
        .map((r) => ({ src: r.imageUrl, alt: r.name })),
      partners: published
        .filter((r) => r.kind === "partner")
        .map((r) => ({ src: r.imageUrl, alt: r.name })),
    };
  } catch (err) {
    console.error("getClientLogos fell back to empty lists", err);
    return { clients: [], partners: [] };
  }
}
