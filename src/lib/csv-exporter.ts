import { format } from "date-fns";

export function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

interface ExportableApplication {
  id: string;
  candidateName: string;
  email: string;
  source: string;
  stage: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  jobOpening: {
    title: string;
    department: string;
  };
}

export function generateApplicationsCsv(applications: ExportableApplication[]): string {
  const headers = [
    "Candidate Name",
    "Email",
    "Job Opening",
    "Department",
    "Stage",
    "Source",
    "Applied Date",
    "Last Updated",
  ];

  const rows = applications.map((app) => {
    const appliedDate = app.createdAt
      ? format(new Date(app.createdAt), "yyyy-MM-dd HH:mm:ss")
      : "";
    const lastUpdated = app.updatedAt
      ? format(new Date(app.updatedAt), "yyyy-MM-dd HH:mm:ss")
      : "";

    return [
      escapeCsvCell(app.candidateName),
      escapeCsvCell(app.email),
      escapeCsvCell(app.jobOpening.title),
      escapeCsvCell(app.jobOpening.department),
      escapeCsvCell(app.stage),
      escapeCsvCell(app.source),
      escapeCsvCell(appliedDate),
      escapeCsvCell(lastUpdated),
    ].join(",");
  });

  return [headers.map((h) => escapeCsvCell(h)).join(","), ...rows].join("\n");
}
