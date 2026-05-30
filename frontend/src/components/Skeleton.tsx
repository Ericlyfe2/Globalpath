export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded bg-cream-200 ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="card space-y-3">
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex justify-between pt-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

export function ListRowSkeleton() {
  return (
    <div className="card flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-md" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-7 w-20 rounded-md" />
    </div>
  );
}
