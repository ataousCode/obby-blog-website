import { PostListSkeleton } from '@/components/loading'

export default function MyPostsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4 animate-pulse" />
        <div className="flex gap-4 mb-6">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
        </div>
      </div>
      
      {/* Posts skeleton */}
      <PostListSkeleton />
    </div>
  )
}