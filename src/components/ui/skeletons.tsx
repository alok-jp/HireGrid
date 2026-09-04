export function JobOpeningSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="flex items-center justify-between p-4 rounded-md border border-transparent bg-[var(--surface-1)]"
        >
          <div className="space-y-2">
            <div className="skeleton w-48 h-4" />
            <div className="skeleton w-32 h-3" />
          </div>
          <div className="skeleton w-16 h-6" />
        </div>
      ))}
    </div>
  );
}

export function ApplicationSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="p-4 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-1)] space-y-3"
        >
          <div className="skeleton w-40 h-4" />
          <div className="skeleton w-full h-8" />
        </div>
      ))}
    </div>
  );
}
