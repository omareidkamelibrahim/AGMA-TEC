import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  await db.payrollRun.deleteMany({ where: { period: "2025-12" } });
  await db.leaveRequest.updateMany({
    where: { employeeName: "Maryam Al-Shammari" },
    data: { status: "Pending" },
  });
  console.log(
    "cleanup ok — payroll runs:",
    await db.payrollRun.count(),
    "| series:",
    await db.numberingSeries.count(),
    "| pending leaves:",
    await db.leaveRequest.count({ where: { status: "Pending" } }),
  );
  await db.$disconnect();
}

main();
