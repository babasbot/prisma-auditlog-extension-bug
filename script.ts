import { Prisma, PrismaClient } from "@prisma/client";

const auditLog = Prisma.defineExtension((prisma) =>
  prisma.$extends({
    name: "auditLog",
    query: {
      $allModels: {
        $allOperations: async ({ model, operation, args, query }) => {
          const result = await query(args);

          await prisma.auditLog.create({
            data: {
              model,
              operation,
              args: JSON.parse(JSON.stringify(args)),
            },
          });

          return result;
        },
      },
    },
  })
);

const prisma = new PrismaClient().$extends(auditLog);

async function main() {
  await prisma.$transaction(async (tx) => {
    const report = await tx.report.findUniqueOrThrow({
      where: {
        id: 1,
      },
    });

    if (report.status === "open") {
      await tx.report.update({
        where: {
          id: 1,
        },
        data: {
          status: "closed",
        },
      });
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
