/**
 * Seed the dashboard admin user (idempotent — upserts credentials).
 * Credentials: admin@agma.tech / Agma@2026
 */
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const db = new PrismaClient();

const EMAIL = "admin@agma.tech";
const PASSWORD = "Agma@2026";

async function main() {
  const passwordHash = hashPassword(PASSWORD);
  await db.adminUser.upsert({
    where: { email: EMAIL },
    update: { passwordHash, name: "Omar Kamel", role: "Super Admin" },
    create: { email: EMAIL, name: "Omar Kamel", role: "Super Admin", passwordHash },
  });
  console.log(`Admin user ready: ${EMAIL}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
