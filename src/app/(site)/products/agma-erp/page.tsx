import type { Metadata } from "next";
import { PageHero } from "@/components/agma/page-hero";
import { ProductDetail } from "@/components/agma/product-detail";
import { CtaBand } from "@/components/agma/cta-band";
import { getProductBySlug, getProducts } from "@/lib/site-content";

// Product content is DB-managed from the admin dashboard.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const product = await getProductBySlug("agma-erp");
  return {
    title: `${product.name} — ${product.full}`,
    description: product.description,
  };
}

export default async function AgmaErpPage() {
  const [product, all] = await Promise.all([getProductBySlug("agma-erp"), getProducts()]);
  const siblings = all.filter((p) => p.slug !== "agma-erp");
  return (
    <>
      <PageHero
        eyebrow="AGMA Product Suite"
        title={
          <>
            AGMA <span className="text-gradient">ERP</span>
          </>
        }
        description={`${product.full} — ${product.description.charAt(0).toLowerCase()}${product.description.slice(1)}`}
      />
      <ProductDetail product={product} siblings={siblings} />
      <CtaBand
        eyebrow="Request a Demo"
        title={
          <>
            See <span className="text-gradient">AGMA ERP</span> in action.
          </>
        }
        description="Tell us about your operations and we'll show you how AGMA ERP can centralize your business and strengthen control over your resources — no obligation."
        primaryLabel="Contact Our Team"
        primaryHref="/contact"
        secondaryLabel="View All Products"
        secondaryHref="/products"
      />
    </>
  );
}
