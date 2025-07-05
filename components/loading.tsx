'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
  variant?: 'default' | 'card' | 'page'
}

export function Loading({ 
  size = 'md', 
  text = 'Loading...', 
  className,
  variant = 'default'
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  if (variant === 'page') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 animate-pulse" />
          <Loader2 className={cn('animate-spin text-primary', sizeClasses.lg)} />
        </div>
        <p className="text-muted-foreground font-medium">{text}</p>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-3">
        <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      <span className="text-muted-foreground">{text}</span>
    </div>
  )
}

export function PostCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="h-48 bg-muted animate-pulse" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded animate-pulse" />
          <div className="h-3 bg-muted rounded w-5/6 animate-pulse" />
        </div>
        <div className="flex items-center space-x-4 pt-2">
          <div className="h-3 bg-muted rounded w-16 animate-pulse" />
          <div className="h-3 bg-muted rounded w-12 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export function PostListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 rounded-lg border bg-card">
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
              <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-muted rounded w-1/3 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}