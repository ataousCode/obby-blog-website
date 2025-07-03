'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Heart, Share2, Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PostActionsProps {
  postId: string
  className?: string
}

export function PostActions({ postId, className }: PostActionsProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (session?.user && 'id' in session.user) {
      checkLikeStatus()
      checkBookmarkStatus()
    }
    fetchLikeCount()
  }, [session?.user && 'id' in session.user ? session.user.id : null, postId])

  const checkLikeStatus = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/like/status`)
      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.isLiked)
      }
    } catch (error) {
      console.error('Error checking like status:', error)
    }
  }

  const checkBookmarkStatus = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/bookmark/status`)
      if (response.ok) {
        const data = await response.json()
        setIsBookmarked(data.isBookmarked)
      }
    } catch (error) {
      console.error('Error checking bookmark status:', error)
    }
  }

  const fetchLikeCount = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/like/count`)
      if (response.ok) {
        const data = await response.json()
        setLikeCount(data.count)
      }
    } catch (error) {
      console.error('Error fetching like count:', error)
    }
  }

  const handleLike = async () => {
    if (!session?.user || !('id' in session.user)) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like posts.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setIsLiked(!isLiked)
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
        toast({
          title: isLiked ? "Post unliked" : "Post liked",
          description: isLiked ? "Removed from your liked posts." : "Added to your liked posts.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update like status.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookmark = async () => {
    if (!session?.user || !('id' in session.user)) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark posts.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/posts/${postId}/bookmark`, {
        method: isBookmarked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setIsBookmarked(!isBookmarked)
        toast({
          title: isBookmarked ? "Bookmark removed" : "Post bookmarked",
          description: isBookmarked ? "Removed from your bookmarks." : "Added to your bookmarks.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update bookmark status.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/posts/${postId}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: url,
        })
      } catch (error) {
        // User cancelled sharing or error occurred
        copyToClipboard(url)
      }
    } else {
      copyToClipboard(url)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Link copied",
        description: "Post link copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant={isLiked ? "default" : "outline"}
        size="sm"
        onClick={handleLike}
        disabled={isLoading}
        className={cn(
          "gap-2",
          isLiked && "bg-red-500 hover:bg-red-600 text-white"
        )}
      >
        <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
        <span>{likeCount}</span>
      </Button>

      <Button
        variant={isBookmarked ? "default" : "outline"}
        size="sm"
        onClick={handleBookmark}
        disabled={isLoading}
        className={cn(
          "gap-2",
          isBookmarked && "bg-blue-500 hover:bg-blue-600 text-white"
        )}
      >
        <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
        {isBookmarked ? "Bookmarked" : "Bookmark"}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="gap-2"
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>
    </div>
  )
}