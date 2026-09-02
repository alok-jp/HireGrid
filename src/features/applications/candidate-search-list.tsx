"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApplicationStageTracker } from "@/features/applications/application-stage";
import { ApplicationActions } from "@/features/applications/application-actions";
import { InterviewPanel } from "@/features/applications/interview-panel";
import {
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  UserCheck,
  Building2,
  Calendar,
  Briefcase,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ApplicationStage } from "@/generated/prisma/enums";

const STAGE_LABELS: Record<string, string> = {
  ALL: "All Stages",
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

const SORT_LABELS: Record<string, string> = {
  createdAt: "Applied Date",
  stage: "Stage",
  updatedAt: "Last Updated",
};

export function CandidateSearchList() {
  // Local state for debounced search
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Filter & Sort State
  const [jobOpeningId, setJobOpeningId] = useState<string>("ALL");
  const [stage, setStage] = useState<string>("ALL");
  const [source, setSource] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"createdAt" | "stage" | "updatedAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1); // Reset to page 1 on search change
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset page to 1 whenever any filter or sort option changes
  const handleJobOpeningChange = (val: string | null) => {
    setJobOpeningId(val ?? "ALL");
    setPage(1);
  };

  const handleStageChange = (val: string | null) => {
    setStage(val ?? "ALL");
    setPage(1);
  };

  const handleSourceChange = (val: string | null) => {
    setSource(val ?? "ALL");
    setPage(1);
  };

  const handleSortByChange = (val: string | null) => {
    if (val === "createdAt" || val === "stage" || val === "updatedAt") {
      setSortBy(val);
      setPage(1);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setJobOpeningId("ALL");
    setStage("ALL");
    setSource("ALL");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  // Queries
  const { data: jobOpenings } = trpc.jobOpening.list.useQuery({ status: "ALL" });
  const { data: sources } = trpc.application.getSources.useQuery();

  const selectedJobOpening = jobOpenings?.find((j) => j.id === jobOpeningId);
  const jobOpeningLabel =
    jobOpeningId === "ALL"
      ? "All Positions"
      : selectedJobOpening
        ? selectedJobOpening.title
        : "Select Position";

  const stageLabel = STAGE_LABELS[stage] ?? "All Stages";
  const sourceLabel = source === "ALL" ? "All Sources" : source;
  const sortByLabel = SORT_LABELS[sortBy] ?? "Applied Date";

  const { data, isLoading, isFetching } = trpc.application.list.useQuery({
    search: debouncedSearch || undefined,
    jobOpeningId: jobOpeningId !== "ALL" ? jobOpeningId : undefined,
    stage: stage !== "ALL" ? (stage as ApplicationStage) : undefined,
    source: source !== "ALL" ? source : undefined,
    sortBy,
    sortOrder,
    page,
    pageSize,
  });

  const hasActiveFilters =
    debouncedSearch !== "" ||
    jobOpeningId !== "ALL" ||
    stage !== "ALL" ||
    source !== "ALL" ||
    sortBy !== "createdAt" ||
    sortOrder !== "desc";

  return (
    <div className="space-y-5">
      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-0)] space-y-4 shadow-xs">
        {/* Top Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search candidates by name or email address..."
            className="pl-9 h-10 text-sm bg-[var(--surface-1)] border-[var(--border-subtle)] focus-visible:ring-[var(--accent)]"
          />
          {isFetching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[var(--accent)]" />
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Job Opening Filter */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
              Job Position
            </span>
            <Select value={jobOpeningId} onValueChange={handleJobOpeningChange}>
              <SelectTrigger className="w-full h-8 text-xs bg-[var(--surface-1)] border-[var(--border-subtle)]">
                <SelectValue placeholder="All Positions">
                  {jobOpeningLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" label="All Positions">
                  All Positions
                </SelectItem>
                {jobOpenings?.map((job) => (
                  <SelectItem key={job.id} value={job.id} label={job.title}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stage Filter */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
              Stage
            </span>
            <Select value={stage} onValueChange={handleStageChange}>
              <SelectTrigger className="w-full h-8 text-xs bg-[var(--surface-1)] border-[var(--border-subtle)]">
                <SelectValue placeholder="All Stages">
                  {stageLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" label="All Stages">All Stages</SelectItem>
                <SelectItem value="APPLIED" label="Applied">Applied</SelectItem>
                <SelectItem value="SCREENING" label="Screening">Screening</SelectItem>
                <SelectItem value="INTERVIEW" label="Interview">Interview</SelectItem>
                <SelectItem value="OFFER" label="Offer">Offer</SelectItem>
                <SelectItem value="HIRED" label="Hired">Hired</SelectItem>
                <SelectItem value="REJECTED" label="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Source Filter */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
              Source
            </span>
            <Select value={source} onValueChange={handleSourceChange}>
              <SelectTrigger className="w-full h-8 text-xs bg-[var(--surface-1)] border-[var(--border-subtle)]">
                <SelectValue placeholder="All Sources">
                  {sourceLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" label="All Sources">All Sources</SelectItem>
                {sources?.map((s) => (
                  <SelectItem key={s} value={s} label={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By Field */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
              Sort By
            </span>
            <Select value={sortBy} onValueChange={handleSortByChange}>
              <SelectTrigger className="w-full h-8 text-xs bg-[var(--surface-1)] border-[var(--border-subtle)]">
                <SelectValue placeholder="Sort By">
                  {sortByLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt" label="Applied Date">Applied Date</SelectItem>
                <SelectItem value="stage" label="Stage">Stage</SelectItem>
                <SelectItem value="updatedAt" label="Last Updated">Last Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Direction & Reset */}
          <div className="flex items-end gap-1.5 pt-1 sm:pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSortOrder}
              className="h-8 flex-1 text-xs border-[var(--border-subtle)] gap-1 px-2"
              title={`Sorting ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder === "asc" ? "Asc" : "Desc"}</span>
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-8 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] px-2"
                title="Reset all search & filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Candidate Application Results List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="p-5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-1)] space-y-3"
            >
              <div className="skeleton w-48 h-4" />
              <div className="skeleton w-full h-8" />
            </div>
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-[var(--border-subtle)] rounded-md">
          <UserCheck className="h-10 w-10 text-[var(--text-tertiary)] mx-auto mb-3" />
          <p className="text-body font-semibold text-[var(--text-primary)]">
            No candidates match your current search and filters
          </p>
          <p className="text-meta mt-1 mb-4">
            Try adjusting your search criteria or clear filters to view candidates.
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs font-semibold gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] px-1 font-semibold">
            <span>
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, data.pagination.total)} of{" "}
              {data.pagination.total} candidates
            </span>
            <span>Page {data.pagination.page} of {data.pagination.totalPages}</span>
          </div>

          <div className="space-y-4">
            {data.items.map((app) => {
              const timeAgo = formatDistanceToNow(new Date(app.createdAt), {
                addSuffix: true,
              });
              const lastUpdatedAgo = formatDistanceToNow(new Date(app.updatedAt), {
                addSuffix: true,
              });

              return (
                <div
                  key={app.id}
                  className="p-5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-0)] hover:border-[var(--border-default)] transition-colors space-y-4 shadow-xs"
                >
                  {/* Candidate Row Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-title text-[var(--text-primary)]">
                          {app.candidateName}
                        </span>
                        <span className="text-meta">· {app.email}</span>
                      </div>

                      <div className="flex items-center gap-3 text-meta text-xs">
                        <div className="flex items-center gap-1 text-[var(--accent)] font-semibold">
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>{app.jobOpening.title}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{app.jobOpening.department}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1 text-[var(--text-tertiary)]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Applied {timeAgo}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className="px-2 py-1 rounded-sm bg-[var(--surface-2)] font-semibold text-[11px] text-[var(--text-secondary)]">
                        Source: {app.source}
                      </span>
                      <ApplicationActions
                        application={{
                          id: app.id,
                          stage: app.stage as ApplicationStage,
                          stageBeforeRejection: app.stageBeforeRejection as ApplicationStage | null,
                        }}
                      />
                    </div>
                  </div>

                  {/* Candidate Notes if available */}
                  {app.notes ? (
                    <div className="text-xs text-[var(--text-secondary)] bg-[var(--surface-1)] p-3 rounded-sm border border-[var(--border-subtle)]">
                      <span className="font-bold text-[var(--text-tertiary)] uppercase tracking-wider block mb-1 text-[10px]">
                        Notes (Updated {lastUpdatedAgo})
                      </span>
                      <p className="whitespace-pre-line leading-relaxed">{app.notes}</p>
                    </div>
                  ) : null}

                  {/* Stage Progress Tracker */}
                  <ApplicationStageTracker
                    stage={app.stage as ApplicationStage}
                    stageBeforeRejection={app.stageBeforeRejection as ApplicationStage | null}
                  />

                  {/* Interview Panel Section */}
                  <InterviewPanel applicationId={app.id} />
                </div>
              );
            })}
          </div>

          {/* Server-Side Pagination Bar */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="text-xs font-semibold gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)] font-medium">
                <span>Page</span>
                <span className="font-bold text-[var(--text-primary)]">{page}</span>
                <span>of</span>
                <span className="font-bold text-[var(--text-primary)]">
                  {data.pagination.totalPages}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.pagination.totalPages || isFetching}
                onClick={() =>
                  setPage((p) => Math.min(data.pagination.totalPages, p + 1))
                }
                className="text-xs font-semibold gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
