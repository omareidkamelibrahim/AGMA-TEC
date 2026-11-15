/** GET /api/admin/products/export — CSV of all products (import-compatible). */
import { db } from "@/lib/db";
import { csvResponse, toCsv } from "@/lib/csv";

export async function GET() {
  const rows = await db.product.findMany({ orderBy: { sortOrder: "asc" } });
  const csv = toCsv(
    ["Name", "Full Name", "Slug", "Scope", "Description", "Icon", "Image", "Sort Order", "Published"],
    rows.map((p) => [
      p.name, p.fullName, p.slug, p.scope, p.description,
      p.icon, p.image, p.sortOrder, p.published ? "yes" : "no",
    ]),
  );
  return csvResponse(`agma-products-${rows.length}rows.csv`, csv);
}
