import { Hero } from "@/components/agma/hero";
import { About } from "@/components/agma/about";
import { Products } from "@/components/agma/products";
import { Clients } from "@/components/agma/clients";
import { Testimonials } from "@/components/agma/testimonials";
import { Team } from "@/components/agma/team";
import { CtaBand } from "@/components/agma/cta-band";
import { Fragment } from "react";
import { getProducts } from "@/lib/site-content";
import { getSiteConfig, type SectionKey } from "@/lib/site-config";

// Sections read DB-managed content (products, services, testimonials,
// logos, site chrome) — render on demand so dashboard edits appear
// immediately.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, site] = await Promise.all([getProducts(), getSiteConfig()]);

  const sections: Record<SectionKey, React.ReactNode> = {
    hero: (
      <Hero
        products={products.map((p) => ({ slug: p.slug, name: p.name }))}
        config={site.hero}
      />
    ),
    about: <About config={site.about} />,
    products: <Products heading={site.sections.headings.products} />,
    clients: <Clients heading={site.sections.headings.clients} />,
    testimonials: <Testimonials heading={site.sections.headings.testimonials} />,
    team: <Team heading={site.sections.headings.team} />,
    cta: (
      <CtaBand
        eyebrow={site.cta.eyebrow}
        title={
          <>
            {site.cta.title}{" "}
            <span className="text-gradient">{site.cta.titleAccent}</span>
          </>
        }
        description={site.cta.description}
        primaryLabel={site.cta.primary.label}
        primaryHref={site.cta.primary.href}
        secondaryLabel={site.cta.secondary.label}
        secondaryHref={site.cta.secondary.href}
      />
    ),
  };

  const shown = site.sections.order.filter(
    (key) => site.sections.visible[key] !== false,
  );

  return (
    <>
      {shown.map((key) => (
        <Fragment key={key}>{sections[key]}</Fragment>
      ))}
    </>
  );
}
