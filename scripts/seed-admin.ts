/**
 * Admin dashboard seed — AGMA TEC HR suite.
 *
 * Employees: 158 total to match the reference system
 *   (118 Active, 24 Probation, 1 Suspended, 15 Terminated, 40 docs expiring soon).
 * The four employees visible in the reference screenshots are seeded
 * verbatim (EMP-00080…EMP-00083, incl. manager "Adel Gamal").
 * The remaining rows are clearly-marked demo records to make search,
 * filtering, pagination and exports exercisable end-to-end.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const FIRST = [
  "Mohammed", "Abdullah", "Omar", "Khalid", "Fahad", "Noura", "Ahmed",
  "Rajesh", "Sara", "Ali", "Hassan", "Yousef", "Layla", "Ibrahim",
  "Turki", "Majed", "Huda", "Sameer", "Reem", "Bilal", "Tariq", "Lina",
  "Nasser", "Salman", "Dana", "Waleed", "May", "Faisal", "Hind", "Ziad",
  "Adel", "Gamal", "Priya", "Arun", "Fatimah", "Saleh", "Maha", "Rayan",
  "Joseph", "Maryam", "Nawaf", "Sultan", "Rania", "Karim", "Basel",
  "Aisha", "Hani", "Rakan", "Sawsan", "Imad",
];
const LAST = [
  "Al-Harbi", "Al-Qahtani", "Al-Shehri", "Al-Otaibi", "Al-Ghamdi",
  "Al-Zahrani", "Hassan", "Kumar", "Al-Dosari", "Al-Anazi", "Al-Malki",
  "Al-Juhani", "Al-Atawi", "Sharma", "Al-Amri", "Al-Balawi", "Nair",
  "Al-Qurashi", "Al-Shammari", "Al-Harthi", "Menon", "Al-Subaie",
  "Al-Mutairi", "Ali", "Farouk", "Al-Wadani", "Ibrahim", "Chowdhury",
];

const DEPTS: [string, string[]][] = [
  ["Production", ["Production Manager", "Production Supervisor", "Machine Operator", "Line Technician", "Assembly Worker", "Shift Lead"]],
  ["Quality Control", ["Quality Manager", "QA Inspector", "QC Analyst", "Lab Technician"]],
  ["Human Resources", ["HR Manager", "HR Specialist", "Recruiter", "HR Coordinator"]],
  ["Logistics", ["Logistics Manager", "Warehouse Supervisor", "Driver", "Store Keeper", "Fleet Coordinator"]],
  ["Finance", ["Finance Manager", "Accountant", "Payroll Officer", "AP Clerk"]],
  ["IT", ["IT Manager", "System Administrator", "Support Technician", "Developer"]],
  ["Maintenance", ["Maintenance Manager", "Electrician", "Mechanical Technician", "HVAC Technician"]],
  ["Catering", ["Catering Manager", "Head Chef", "Cook", "Food Service Worker"]],
  ["Administration", ["Office Manager", "Receptionist", "Admin Assistant", "Document Controller"]],
];

const MANAGERS = ["Adel Gamal", "Khalid Al-Harbi", "Noura Al-Shehri", "Fahad Al-Qahtani", "Sameer Al-Malki", "Huda Al-Amri"];

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function main() {
  // wipe admin tables (idempotent seed)
  await db.leaveRequest.deleteMany();
  await db.payrollRun.deleteMany();
  await db.numberingSeries.deleteMany();
  await db.employee.deleteMany();

  const rand = mulberry(42);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

  // status plan: idx 0..117 Active, 118..141 Probation, 142 Suspended, 143..157 Terminated
  const TOTAL = 158;
  const statusOf = (i: number): string =>
    i < 118 ? "Active" : i < 142 ? "Probation" : i === 142 ? "Suspended" : "Terminated";

  const employees: {
    empCode: string; name: string; department: string; position: string;
    status: string; hireDate: Date; manager: string | null;
    idNumber: string; idExpiry: Date | null; email: string; phone: string;
  }[] = [];

  for (let i = 0; i < TOTAL; i++) {
    const code = `EMP-${String(i + 1).padStart(5, "0")}`;
    const [dept, positions] = DEPTS[Math.floor(rand() * DEPTS.length)];
    const position = pick(positions);
    const hire = new Date(2015 + Math.floor(rand() * 11), Math.floor(rand() * 12), 1 + Math.floor(rand() * 28));
    const name = `${pick(FIRST)} ${pick(LAST)}`;
    // Random IDs expire 3–24 months out; the 40 "expiring soon" rows are
    // set precisely below so the dashboard stat matches the reference (40).
    const idExp = new Date(Date.now() + (90 + rand() * 640) * 86400000);
    employees.push({
      empCode: code,
      name,
      department: dept,
      position,
      status: statusOf(i),
      hireDate: hire,
      manager: rand() > 0.25 ? pick(MANAGERS) : null,
      idNumber: `1${rand() > 0.5 ? 1 : 0}99${String(100000 + Math.floor(rand() * 899999))}`,
      idExpiry: statusOf(i) === "Terminated" ? null : idExp,
      email: `${name.toLowerCase().replace(/[^a-z]+/g, ".") || "emp"}@agma.com`,
      phone: `+9665${String(10000000 + Math.floor(rand() * 89999999))}`,
    });
  }

  // Reference employees from the screenshots — verbatim, at their codes
  const set = (code: string, data: Partial<(typeof employees)[number]>) => {
    const idx = employees.findIndex((e) => e.empCode === code);
    if (idx >= 0) employees[idx] = { ...employees[idx], ...data } as (typeof employees)[number];
  };
  set("EMP-00080", { name: "Khalid Al-Harbi", department: "Production", position: "Production Manager", status: "Active", hireDate: new Date(2019, 2, 10), manager: "Adel Gamal", idNumber: "1099000001" });
  set("EMP-00081", { name: "Fahad Al-Qahtani", department: "Quality Control", position: "Quality Manager", status: "Active", hireDate: new Date(2020, 5, 1), manager: null, idNumber: "1099000002" });
  set("EMP-00082", { name: "Noura Al-Shehri", department: "Human Resources", position: "HR Manager", status: "Active", hireDate: new Date(2018, 10, 15), manager: null, idNumber: "1099000003" });
  set("EMP-00083", { name: "Ahmed Hassan", department: "Production", position: "Production Supervisor", status: "Active", hireDate: new Date(2021, 1, 1), manager: "Adel Gamal", idNumber: "2099000004" });

  // 40 documents expiring within 45 days
  const nonTerm = employees.filter((e) => e.status !== "Terminated");
  for (let i = 0; i < 40; i++) {
    nonTerm[i].idExpiry = new Date(Date.now() + (5 + i) * 86400000);
  }

  await db.employee.createMany({ data: employees });

  // Leave requests (mix of Pending / Approved / Rejected)
  const active = employees.filter((e) => e.status === "Active" || e.status === "Probation");
  const types = ["Annual", "Sick", "Unpaid", "Emergency"];
  const reasons = ["Family event", "Medical appointment", "Personal travel", "Emergency travel", "Rest and recuperation", "Relocation"];
  const leaves: {
    employeeName: string; empCode: string; department: string; type: string;
    fromDate: Date; toDate: Date; days: number; status: string; reason: string;
  }[] = [];
  for (let i = 0; i < 28; i++) {
    const e = active[Math.floor(rand() * active.length)];
    const start = new Date(Date.now() + Math.floor(rand() * 60 - 20) * 86400000);
    const days = 1 + Math.floor(rand() * 14);
    leaves.push({
      employeeName: e.name,
      empCode: e.empCode,
      department: e.department,
      type: types[i % types.length],
      fromDate: start,
      toDate: new Date(start.getTime() + days * 86400000),
      days,
      status: i < 12 ? "Pending" : i < 22 ? "Approved" : "Rejected",
      reason: pick(reasons),
    });
  }
  await db.leaveRequest.createMany({ data: leaves });

  // Payroll runs — last 12 months, sequential PR-##### references
  const now = new Date();
  const runs: {
    reference: string; period: string; employees: number; gross: number;
    deductions: number; net: number; status: string;
  }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const headcount = 118 + Math.floor(rand() * 20);
    const gross = headcount * (7800 + Math.floor(rand() * 1500));
    const ded = Math.round(gross * (0.09 + rand() * 0.04));
    runs.push({
      reference: `PR-${String(i + 1).padStart(5, "0")}`,
      period,
      employees: headcount,
      gross,
      deductions: ded,
      net: gross - ded,
      status: i < 9 ? "Paid" : i === 9 ? "Processed" : i === 10 ? "Processed" : "Draft",
    });
  }
  await db.payrollRun.createMany({ data: runs });

  // Numbering series — mirrors the reference settings screen (17 total)
  const docs: [string, string][] = [
    ["HR_PAYROLL_RUN - Payroll run", "PR-"],
    ["HR_EMPLOYEE - Employee file", "EMP-"],
    ["HR_LEAVE_REQ - Leave request", "LV-"],
    ["HR_EOS - End of service", "EOS-"],
    ["ADV - Advance payment", "ADV-"],
    ["ATT_CORR - Attendance correction", "ATC-"],
    ["ATT_MEMO - Attendance memo", "ATM-"],
    ["CUS_ORDER - Customer order", "CUS-"],
    ["CUS_INVOICE - Customer invoice", "INV-"],
    ["CUS_QUOT - Customer quotation", "QUO-"],
    ["PRJ_ORDER - Project order", "PRJ-"],
    ["PRJ_INVOICE - Project invoice", "PINV-"],
    ["PUR_ORDER - Purchase order", "PO-"],
    ["PUR_REQ - Purchase requisition", "PREQ-"],
    ["STK_TRANSFER - Stock transfer", "TRF-"],
    ["STK_ISSUE - Stock issue", "ISS-"],
    ["ATC_PLAN - Attendance plan", "ATP-"],
  ];
  await db.numberingSeries.createMany({
    data: docs.map(([document, prefix]) => ({
      document,
      prefix,
      padding: 5,
      dateToken: rand() > 0.6 ? "{YYYY}" : null,
      scope: null,
    })),
  });

  const counts = await db.employee.groupBy({ by: ["status"], _count: true });
  console.log("Seeded:", {
    employees: await db.employee.count(),
    byStatus: counts.map((c) => `${c.status}:${c._count}`).join(", "),
    expiringSoon: await db.employee.count({
      where: { idExpiry: { lte: new Date(Date.now() + 45 * 86400000) } },
    }),
    leaves: await db.leaveRequest.count(),
    payrollRuns: await db.payrollRun.count(),
    numberingSeries: await db.numberingSeries.count(),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
