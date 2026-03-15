import { Skeleton } from "@/components/ui/skeleton";

export function RepoCardSkeleton() {
  return (
    <div
      className="flex w-full flex-col items-center justify-center snap-start snap-always snap-stop-always px-4 sm:px-0"
      style={{ height: "calc((100vh - var(--header-height)) * 0.88)" }}
    >
      <div className="w-full max-w-md lg:max-w-xl rounded-2xl border border-border bg-card px-6 py-6 shadow-lg space-y-4">
        {/* Owner + name */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-7 w-52" />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-4/5" />
          <Skeleton className="h-3.5 w-3/5" />
        </div>

        {/* Tech + badges */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-36" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </div>

        {/* Stars */}
        <Skeleton className="h-4 w-24" />

        {/* Idea box */}
        <Skeleton className="h-14 w-full rounded-xl" />

        {/* 3 action buttons */}
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-8 flex-1 rounded-md" />
          <Skeleton className="h-8 flex-1 rounded-md" />
          <Skeleton className="h-8 flex-1 rounded-md" />
        </div>
      </div>
    </div>
  );
}
