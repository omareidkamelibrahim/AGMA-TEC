/**
 * Removes the demo inquiries/subscribers created by seed-demo-activity.ts.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const inq = await db.contactMessage.deleteMany({
    where: { email: { contains: "@demo.agma.tech" } },
  });
  const subs = await db.newsletterSubscriber.deleteMany({
    where: { email: { contains: "@demo." } },
  });
  console.log(`Removed demo rows — inquiries: ${inq.count}, subscribers: ${subs.count}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
