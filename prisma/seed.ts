import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.users.findFirst({
    where: { email: "lizadjebara2@gmail.com" },
  });

  if (existingAdmin) {
    return;
  }

  const hashedPassword = await bcrypt.hash("strongPass1!", 10);

  await prisma.users.create({
    data: {
      email: "lizadjebara2@gmail.com",
      password: hashedPassword,
      name: "Super Admin",
      role: Role.ADMIN,
      phone: "0102030405",
      emailVerified: true,
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
