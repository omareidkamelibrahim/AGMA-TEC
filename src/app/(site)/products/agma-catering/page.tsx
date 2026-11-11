import type { Metadata } from "next";
import { PageHero } from "@/components/agma/page-hero";
import { ProductDetail } from "@/components/agma/product-detail";
import { CtaBand } from "@/components/agma/cta-band";
import { getProduct } from "@/lib/products";

const product = getProduct("agma-catering");

export const metadata: Metadata = {
  title: "AGMA CATERING — Catering Management System",
  description: product.description,
};

export default function AgmaCateringPage() {
  return (
    <>
      <PageHero
        eyebrow="AGMA Product Suite"
        title={
          <>
            AGMA <span className="text-gradient">CATERING</span>
          </>
        }
        description={`${product.full} — ${product.description.charAt(0).toLowerCase()}${product.description.slice(1)}`}
      />
      <ProductDetail product={product} />
      <CtaBand
        eyebrow="Request a Demo"
        title={
          <>
            See <span className="text-gradient">AGMA CATERING</span> in action.
          </>
        }
        description="Tell us about your catering operations and we'll show you how AGMA CATERING can streamline meal planning, ordering and kitchen workflows — no obligation."
        primaryLabel="Contact Our Team"
        primaryHref="/contact"
        secondaryLabel="View All Products"
        secondaryHref="/products"
      />
    </>
  );
}
