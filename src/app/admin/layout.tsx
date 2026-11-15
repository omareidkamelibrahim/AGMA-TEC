import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminProviders } from "@/components/admin/admin-providers";
import { AdminShell } from "@/components/admin/admin-shell";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Admin",
  description: "AGMA TEC internal administration — website content and workforce.",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // The login page renders without the dashboard shell (pathname is stamped
  // by src/middleware.ts, which also guards everything else under /admin).
  const pathname = (await headers()).get("x-pathname") ?? "";
  if (pathname === "/admin/login") {
    return <AdminProviders>{children}</AdminProviders>;
  }

  // Belt-and-braces: middleware already redirects, but never render the
  // shell without a verified session.
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) redirect("/admin/login");

  return (
    <AdminProviders>
      <AdminShell
        user={{ name: session.name, email: session.sub, role: session.role }}
      >
        {children}
      </AdminShell>
    </AdminProviders>
  );
}
