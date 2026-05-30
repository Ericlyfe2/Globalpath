import { ListRowSkeleton, Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-64 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => <ListRowSkeleton key={i} />)}
      </div>
    </div>
  );
}
