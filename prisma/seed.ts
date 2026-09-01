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

  // 1. Seed Master Admin (case-insensitive lookup)
  const existingAdmin = await prisma.user.findFirst({
    where: {
      email: {
        equals: ADMIN_EMAIL,
        mode: "insensitive",
      },
    },
  });

  if (!existingAdmin) {
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
  } else if (existingAdmin.role !== "MASTER_ADMIN") {
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

  // 2. Seed Demo Job Openings (at least 3 OPEN, at least 1 ARCHIVED)
  const existingJobsCount = await prisma.jobOpening.count();
  if (existingJobsCount === 0) {
    console.log("Seeding demo job openings...");

    await prisma.jobOpening.createMany({
      data: [
        {
          title: "Senior Fullstack Engineer",
          department: "Engineering",
          description:
            "Lead technical design and development of core features using Next.js, TypeScript, and PostgreSQL.",
          status: "OPEN",
        },
        {
          title: "Product Manager - Hiring Funnel",
          department: "Product",
          description:
            "Own the end-to-end recruiter experience, candidate tracking workflow, and operational analytics.",
          status: "OPEN",
        },
        {
          title: "Lead UX/UI Designer",
          department: "Design",
          description:
            "Design intuitive, accessible UI interfaces and modern design systems for web application platforms.",
          status: "OPEN",
        },
        {
          title: "QA Automation Engineer",
          department: "Quality Assurance",
          description:
            "Architect e2e automated testing suites and continuous integration pipelines.",
          status: "ARCHIVED",
        },
      ],
    });

    console.log("Seeded 3 OPEN and 1 ARCHIVED job openings.");
  } else {
    console.log(`Database already has ${existingJobsCount} job openings.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });