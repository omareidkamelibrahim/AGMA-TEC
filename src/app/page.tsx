import { Navbar } from "@/components/agma/navbar";
import { Hero } from "@/components/agma/hero";
import { About } from "@/components/agma/about";
import { Products } from "@/components/agma/products";
import { Clients } from "@/components/agma/clients";
import { Testimonials } from "@/components/agma/testimonials";
import { CtaBand } from "@/components/agma/cta-band";
import { Contact } from "@/components/agma/contact";
import { Footer } from "@/components/agma/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-ink-950">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <About />
        <Products />
        <Clients />
        <Testimonials />
        <CtaBand />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
