import "dotenv/config";

import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME ?? "Master Admin";

async function main() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in your .env file",
    );
  }

  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: ADMIN_EMAIL,
    },
  });

  if (existingAdmin) {
    if (existingAdmin.role !== "MASTER_ADMIN") {
      await prisma.user.update({
        where: {
          id: existingAdmin.id,
        },
        data: {
          role: "MASTER_ADMIN",
        },
      });

      console.log(`Updated ${ADMIN_EMAIL} to MASTER_ADMIN`);
    } else {
      console.log(`${ADMIN_EMAIL} is already a MASTER_ADMIN`);
    }

    return;
  }

  const result = await auth.api.signUpEmail({
    body: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    },
  });

  if (!result?.user) {
    throw new Error("Failed to create master admin");
  }

  await prisma.user.update({
    where: {
      id: result.user.id,
    },
    data: {
      role: "MASTER_ADMIN",
    },
  });

  console.log(`Created MASTER_ADMIN: ${ADMIN_EMAIL}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });