import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const PageLoadingSkeleton = memo(() => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border/50 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Skeleton className="h-10 w-32" />
          <div className="hidden md:flex items-center gap-6">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-6 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
});

PageLoadingSkeleton.displayName = "PageLoadingSkeleton";

export const CardSkeleton = memo(() => (
  <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
  </div>
));

CardSkeleton.displayName = "CardSkeleton";
