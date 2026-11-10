import { Hero } from "@/components/agma/hero";
import { About } from "@/components/agma/about";
import { Products } from "@/components/agma/products";
import { Clients } from "@/components/agma/clients";
import { Testimonials } from "@/components/agma/testimonials";
import { Team } from "@/components/agma/team";
import { CtaBand } from "@/components/agma/cta-band";
import { Contact } from "@/components/agma/contact";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Products />
      <Clients />
      <Testimonials />
      <Team />
      <CtaBand />
      <Contact />
    </>
  );
}
