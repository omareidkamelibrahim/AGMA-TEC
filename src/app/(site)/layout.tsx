import { Navbar } from "@/components/agma/navbar";
import { Footer } from "@/components/agma/footer";

/** Marketing site chrome — Navbar + Footer for all public pages. */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
