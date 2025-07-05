import { Loading } from '@/components/loading'

export default function WriteLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse" />
      </div>
      
      {/* Form skeleton */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Title input */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        
        {/* Category and tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
        
        {/* Cover image */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        
        {/* Content editor */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-4 justify-end">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
        </div>
      </div>
    </div>
  )
}