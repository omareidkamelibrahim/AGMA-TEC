import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { employeeWhere, parseEmployeeQuery } from "@/lib/admin/query";

/** GET /api/admin/employees/export — CSV of the current filtered view. */
export async function GET(req: NextRequest) {
  const query = parseEmployeeQuery(req.nextUrl.searchParams);
  const rows = await db.employee.findMany({
    where: employeeWhere(query),
    orderBy: { [query.sort]: query.dir },
    take: 5000,
  });

  const headers = [
    "Employee Code",
    "Name",
    "Department",
    "Position",
    "Status",
    "Hire Date",
    "Manager",
    "ID/Iqama",
    "ID Expiry",
    "Email",
    "Phone",
  ];
  const escape = (v: unknown) => {
    const s = v instanceof Date ? v.toISOString().slice(0, 10) : String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(","),
    ...rows.map((e) =>
      [
        e.empCode, e.name, e.department, e.position, e.status,
        e.hireDate, e.manager, e.idNumber, e.idExpiry, e.email, e.phone,
      ].map(escape).join(","),
    ),
  ].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="agma-employees-page${query.page}-${rows.length}rows.csv"`,
    },
  });
}
