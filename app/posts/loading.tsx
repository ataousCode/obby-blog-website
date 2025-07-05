import { PostListSkeleton } from '@/components/loading'

export default function PostsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <div className="h-10 bg-muted rounded w-1/3 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-muted rounded w-2/3 mx-auto animate-pulse" />
        </div>

        {/* Filters Skeleton */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-2">
            <div className="h-10 bg-muted rounded flex-1 animate-pulse" />
            <div className="h-10 bg-muted rounded w-20 animate-pulse" />
          </div>
          <div className="flex gap-4">
            <div className="h-10 bg-muted rounded w-40 animate-pulse" />
            <div className="h-10 bg-muted rounded w-32 animate-pulse" />
            <div className="h-10 bg-muted rounded w-24 animate-pulse" />
          </div>
        </div>

        {/* Posts Grid Skeleton */}
        <PostListSkeleton count={9} />
        
        {/* Pagination Skeleton */}
        <div className="flex justify-center mt-12">
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 w-10 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}