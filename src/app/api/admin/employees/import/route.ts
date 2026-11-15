/**
 * POST /api/admin/employees/import — bulk-create employees from CSV.
 * Headers (match the Export file): Employee Code, Name, Department, Position,
 * Status, Hire Date, Manager, ID/Iqama, ID Expiry, Email, Phone.
 * Code is generated automatically; rows with a known ID/Iqama are skipped.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { csvToObjects } from "@/lib/csv";

const STATUSES = new Set(["Active", "Probation", "Suspended", "Terminated"]);
const MAX_ROWS = 500;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const csv = typeof body?.csv === "string" ? body.csv : null;
  if (!csv) {
    return NextResponse.json({ error: "Missing CSV payload." }, { status: 400 });
  }

  const objects = csvToObjects(csv);
  if (objects.length === 0) {
    return NextResponse.json({ error: "No data rows found under the header row." }, { status: 400 });
  }
  if (objects.length > MAX_ROWS) {
    return NextResponse.json({ error: `Too many rows — limit is ${MAX_ROWS} per import.` }, { status: 400 });
  }

  const errors: string[] = [];
  let created = 0;
  let skipped = 0;

  for (const [i, o] of objects.entries()) {
    const label = `Row ${i + 2}`;
    const name = o["Name"];
    const position = o["Position"];
    const hireDate = o["Hire Date"];
    if (!name || !position || !hireDate) {
      errors.push(`${label}: Name, Position and Hire Date are required.`);
      continue;
    }
    const hire = new Date(hireDate);
    if (Number.isNaN(hire.getTime())) {
      errors.push(`${label}: "${hireDate}" is not a valid date.`);
      continue;
    }
    const status = o["Status"] && STATUSES.has(o["Status"]) ? o["Status"] : "Active";
    const idNumber = o["ID/Iqama"] || null;
    if (idNumber) {
      const dupe = await db.employee.findFirst({ where: { idNumber } });
      if (dupe) {
        skipped++;
        continue;
      }
    }
    const idExpiry = o["ID Expiry"] ? new Date(o["ID Expiry"]) : null;
    // sequential code — same derivation as the single-create endpoint
    const last = await db.employee.findFirst({
      orderBy: { empCode: "desc" },
      select: { empCode: true },
    });
    const lastNum = last ? parseInt(last.empCode.replace(/\D/g, ""), 10) || 0 : 0;
    let empCode = `EMP-${String(lastNum + 1).padStart(5, "0")}`;
    for (let n = 2; (await db.employee.findUnique({ where: { empCode } })) !== null; n++) {
      empCode = `EMP-${String(lastNum + n).padStart(5, "0")}`;
    }
    await db.employee.create({
      data: {
        empCode,
        name,
        department: o["Department"] || "Administration",
        position,
        status,
        hireDate: hire,
        manager: o["Manager"] || null,
        idNumber,
        idExpiry: idExpiry && !Number.isNaN(idExpiry.getTime()) ? idExpiry : null,
        email: o["Email"] || null,
        phone: o["Phone"] || null,
      },
    });
    created++;
  }

  return NextResponse.json({ created, skipped, errors });
}
