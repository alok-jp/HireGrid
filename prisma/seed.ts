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

  let existingJobs = await prisma.jobOpening.findMany();
  if (existingJobs.length === 0) {
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
    existingJobs = await prisma.jobOpening.findMany();
  }

  const existingAppsCount = await prisma.application.count();
  if (existingAppsCount === 0 && existingJobs.length > 0) {
    const fullstackJob = existingJobs.find(j => j.title.includes("Fullstack")) ?? existingJobs[0];
    const pmJob = existingJobs.find(j => j.title.includes("Product")) ?? existingJobs[0];

    console.log("Seeding demo candidate applications...");

    await prisma.application.createMany({
      data: [
        {
          candidateName: "Alice Smith",
          email: "alice.smith@example.com",
          source: "LinkedIn",
          notes: "Strong background in React 19, Next.js App Router, and Node.js backend architecture.",
          stage: "APPLIED",
          jobOpeningId: fullstackJob.id,
        },
        {
          candidateName: "Bob Johnson",
          email: "bob.johnson@example.com",
          source: "Referral",
          notes: "Referred by senior staff engineer. Great system design experience.",
          stage: "APPLIED",
          jobOpeningId: fullstackJob.id,
        },
        {
          candidateName: "Carol Williams",
          email: "carol.williams@example.com",
          source: "Direct / Career Site",
          notes: "5 years product management experience leading SaaS pipelines.",
          stage: "APPLIED",
          jobOpeningId: pmJob.id,
        },
      ],
    });

    console.log("Seeded 3 candidate applications.");
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