/** GET /api/admin/clients/export — CSV of all logos (import-compatible). */
import { db } from "@/lib/db";
import { csvResponse, toCsv } from "@/lib/csv";

export async function GET() {
  const rows = await db.clientLogo.findMany({ orderBy: { sortOrder: "asc" } });
  const csv = toCsv(
    ["Name", "Group", "Image URL", "Sort Order", "Published"],
    rows.map((l) => [l.name, l.kind, l.imageUrl, l.sortOrder, l.published ? "yes" : "no"]),
  );
  return csvResponse(`agma-clients-${rows.length}rows.csv`, csv);
}
