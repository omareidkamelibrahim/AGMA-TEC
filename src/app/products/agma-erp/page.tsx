import type { Metadata } from "next";
import { PageHero } from "@/components/agma/page-hero";
import { ProductDetail } from "@/components/agma/product-detail";
import { CtaBand } from "@/components/agma/cta-band";
import { getProduct } from "@/lib/products";

const product = getProduct("agma-erp");

export const metadata: Metadata = {
  title: "AGMA ERP — Enterprise Resource Planning",
  description: product.description,
};

export default function AgmaErpPage() {
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
      <ProductDetail product={product} />
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
