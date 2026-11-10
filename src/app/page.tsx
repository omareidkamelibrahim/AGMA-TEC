import { Navbar } from "@/components/agma/navbar";
import { Hero } from "@/components/agma/hero";
import { StatsBar } from "@/components/agma/stats-bar";
import { TechMarquee } from "@/components/agma/tech-marquee";
import { About } from "@/components/agma/about";
import { Services } from "@/components/agma/services";
import { Process } from "@/components/agma/process";
import { Work } from "@/components/agma/work";
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
        <StatsBar />
        <TechMarquee />
        <About />
        <Services />
        <Process />
        <Work />
        <Testimonials />
        <CtaBand />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
