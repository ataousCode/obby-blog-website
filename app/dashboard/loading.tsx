import { DashboardSkeleton } from '@/components/loading'

export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-muted rounded w-1/3 mb-2 animate-pulse" />
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
        </div>

        {/* Profile Card Skeleton */}
        <div className="mb-8 p-6 rounded-lg border bg-card">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-muted rounded-full animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
              <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Dashboard Content Skeleton */}
        <DashboardSkeleton />
        
        {/* Quick Actions Skeleton */}
        <div className="mt-8">
          <div className="h-6 bg-muted rounded w-1/4 mb-4 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 rounded-lg border bg-card">
                <div className="space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-10 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}