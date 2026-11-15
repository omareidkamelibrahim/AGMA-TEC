/** GET /api/admin/testimonials/export — CSV of all quotes (import-compatible). */
import { db } from "@/lib/db";
import { csvResponse, toCsv } from "@/lib/csv";

export async function GET() {
  const rows = await db.testimonial.findMany({ orderBy: { sortOrder: "asc" } });
  const csv = toCsv(
    ["Quote", "Attribution", "Sector", "Initials", "Sort Order", "Published"],
    rows.map((t) => [t.quote, t.name, t.org, t.initials, t.sortOrder, t.published ? "yes" : "no"]),
  );
  return csvResponse(`agma-testimonials-${rows.length}rows.csv`, csv);
}
