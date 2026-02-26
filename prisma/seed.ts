import { config } from "dotenv";
config();

import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await hash("admin123", 12);

  await prisma.appSetting.upsert({
    where: { key: "admin_password" },
    update: { value: hashedPassword },
    create: {
      key: "admin_password",
      value: hashedPassword,
    },
  });

  console.log("Seeded: admin password (default: admin123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
