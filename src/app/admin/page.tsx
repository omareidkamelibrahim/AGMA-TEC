import { cookies } from "next/headers";
import { OverviewClient } from "@/components/admin/overview-client";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export default async function AdminHomePage() {
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  return <OverviewClient userName={session?.name} />;
}
