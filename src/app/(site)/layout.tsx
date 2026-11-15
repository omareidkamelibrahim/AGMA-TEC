import { Navbar } from "@/components/agma/navbar";
import { Footer } from "@/components/agma/footer";
import { getSiteConfig } from "@/lib/site-config";

/** Marketing site chrome — Navbar + Footer for all public pages.
    Both read the dashboard-managed SiteConfig. */
export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const site = await getSiteConfig();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar header={site.header} />
      <main className="flex-1">{children}</main>
      <Footer config={site.footer} />
    </div>
  );
}
