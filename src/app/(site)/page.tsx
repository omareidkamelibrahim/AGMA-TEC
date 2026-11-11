import { Hero } from "@/components/agma/hero";
import { About } from "@/components/agma/about";
import { Products } from "@/components/agma/products";
import { Clients } from "@/components/agma/clients";
import { Testimonials } from "@/components/agma/testimonials";
import { Team } from "@/components/agma/team";
import { CtaBand } from "@/components/agma/cta-band";
import { getProducts } from "@/lib/site-content";

// Sections read DB-managed content (products, services, testimonials,
// logos) — render on demand so dashboard edits appear immediately.
export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getProducts();
  return (
    <>
      <Hero products={products.map((p) => ({ slug: p.slug, name: p.name }))} />
      <About />
      <Products />
      <Clients />
      <Testimonials />
      <Team />
      <CtaBand />
    </>
  );
}
