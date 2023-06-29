import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  await prisma.$transaction([
    prisma.$executeRaw`TRUNCATE TABLE "AuditLog" RESTART IDENTITY`,
    prisma.$executeRaw`TRUNCATE TABLE "Report" RESTART IDENTITY`,
    prisma.report.createMany({
      data: Array.from<Prisma.ReportCreateManyInput>({ length: 100 }).map(
        () => ({ status: "open" })
      ),
    }),
  ]);
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
