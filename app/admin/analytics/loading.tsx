import { DashboardSkeleton } from '@/components/loading'

export default function AnalyticsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2 animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse" />
      </div>
      
      <DashboardSkeleton />
    </div>
  )
}