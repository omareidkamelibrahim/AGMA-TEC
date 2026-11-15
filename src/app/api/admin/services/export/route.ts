/** GET /api/admin/services/export — CSV of all services (import-compatible). */
import { db } from "@/lib/db";
import { csvResponse, toCsv } from "@/lib/csv";

function tags(raw: string): string {
  try {
    return ((JSON.parse(raw) ?? []) as string[]).join(", ");
  } catch {
    return "";
  }
}

export async function GET() {
  const rows = await db.service.findMany({ orderBy: { sortOrder: "asc" } });
  const csv = toCsv(
    ["Title", "Description", "Icon", "Tags", "Sort Order", "Published"],
    rows.map((s) => [s.title, s.text, s.icon, tags(s.tagsJson), s.sortOrder, s.published ? "yes" : "no"]),
  );
  return csvResponse(`agma-services-${rows.length}rows.csv`, csv);
}
