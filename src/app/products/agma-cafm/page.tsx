import type { Metadata } from "next";
import { PageHero } from "@/components/agma/page-hero";
import { ProductDetail } from "@/components/agma/product-detail";
import { CtaBand } from "@/components/agma/cta-band";
import { getProduct } from "@/lib/products";

const product = getProduct("agma-cafm");

export const metadata: Metadata = {
  title: "AGMA CAFM — Computer-Aided Facility Management",
  description: product.description,
};

export default function AgmaCafmPage() {
  return (
    <>
      <PageHero
        eyebrow="AGMA Product Suite"
        title={
          <>
            AGMA <span className="text-gradient">CAFM</span>
          </>
        }
        description={`${product.full} — ${product.description.charAt(0).toLowerCase()}${product.description.slice(1)}`}
      />
      <ProductDetail product={product} />
      <CtaBand
        eyebrow="Request a Demo"
        title={
          <>
            See <span className="text-gradient">AGMA CAFM</span> in action.
          </>
        }
        description="Tell us about your facilities and we'll show you how AGMA CAFM can help you manage buildings, assets and maintenance — no obligation."
        primaryLabel="Contact Our Team"
        primaryHref="/contact"
        secondaryLabel="View All Products"
        secondaryHref="/products"
      />
    </>
  );
}
