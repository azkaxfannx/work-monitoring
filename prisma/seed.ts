import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.appSetting.upsert({
    where: { key: "admin_password" },
    update: { value: hashedPassword },
    create: {
      key: "admin_password",
      value: hashedPassword,
    },
  });

  console.log("✓ Seeded: admin password (default: admin123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
