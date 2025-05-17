import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.admin.findFirst({
    where: { email: "lizadjebara2@gmail.com" },
  });

  if (existingAdmin) {
    return;
  }

  const hashedPassword = await bcrypt.hash("strongPass1!", 10);

  await prisma.admin.create({
    data: {
      email: "lizadjebara2@gmail.com",
      password: hashedPassword,
      name: "Super Admin",
    },
  });

  console.log("Admin user seeded successfully.");
}

main()
  .catch((e) => {
    console.error(" Error while seeding admin:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
