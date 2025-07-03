'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, MessageCircle, Reply, Heart } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { z } from 'zod'

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment must be less than 1000 characters')
})

interface Author {
  id: string
  name: string
  email: string
  image?: string
}

interface Comment {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  author: Author
  parentId?: string
  replies?: Comment[]
  _count: {
    likes: number
    replies: number
  }
}

interface CommentSectionProps {
  postId: string
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const validateComment = (content: string) => {
    try {
      commentSchema.parse({ content })
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.user?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment.",
        variant: "destructive"
      })
      return
    }

    if (!validateComment(newComment)) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments(prev => [data.comment, ...prev])
        setNewComment('')
        toast({
          title: "Comment posted",
          description: "Your comment has been posted successfully.",
        })
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || 'Failed to post comment',
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
      setIsSubmitting(false)
    }
  }

  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault()
    if (!session?.user?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to reply.",
        variant: "destructive"
      })
      return
    }

    if (!validateComment(replyContent)) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyContent,
          parentId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Update the comments to include the new reply
        setComments(prev => 
          prev.map(comment => 
            comment.id === parentId
              ? {
                  ...comment,
                  replies: [...(comment.replies || []), data.comment],
                  _count: {
                    ...comment._count,
                    replies: comment._count.replies + 1
                  }
                }
              : comment
          )
        )
        setReplyContent('')
        setReplyingTo(null)
        toast({
          title: "Reply posted",
          description: "Your reply has been posted successfully.",
        })
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || 'Failed to post reply',
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
      setIsSubmitting(false)
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!validateComment(editContent)) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Update the comment in the state
        setComments(prev => 
          prev.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, content: data.comment.content, updatedAt: data.comment.updatedAt }
            }
            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.map(reply => 
                  reply.id === commentId 
                    ? { ...reply, content: data.comment.content, updatedAt: data.comment.updatedAt }
                    : reply
                )
              }
            }
            return comment
          })
        )
        setEditingId(null)
        setEditContent('')
        toast({
          title: "Comment updated",
          description: "Your comment has been updated successfully.",
        })
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || 'Failed to update comment',
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
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }

    setDeletingId(commentId)

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove the comment from the state
        setComments(prev => 
          prev.filter(comment => {
            if (comment.id === commentId) {
              return false
            }
            if (comment.replies) {
              comment.replies = comment.replies.filter(reply => reply.id !== commentId)
            }
            return true
          })
        )
        toast({
          title: "Comment deleted",
          description: "Your comment has been deleted successfully.",
        })
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || 'Failed to delete comment',
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
      setDeletingId(null)
    }
  }

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditContent('')
    setErrors({})
  }

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-8 border-l-2 border-muted pl-4' : ''}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.image || ''} alt={comment.author.name} />
          <AvatarFallback>
            {comment.author.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{comment.author.name}</span>
            <span className="text-muted-foreground">
              {formatRelativeTime(comment.createdAt)}
              {comment.updatedAt !== comment.createdAt && ' (edited)'}
            </span>
          </div>
          
          {editingId === comment.id ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => {
                  setEditContent(e.target.value)
                  if (errors.content) {
                    setErrors(prev => ({ ...prev, content: '' }))
                  }
                }}
                className="min-h-[80px]"
              />
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content}</p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleEditComment(comment.id)}
                  disabled={isSubmitting || !editContent.trim()}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={cancelEdit}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed">{comment.content}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <button className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Heart className="h-3 w-3" />
              <span>{comment._count.likes}</span>
            </button>
            
            {!isReply && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Reply className="h-3 w-3" />
                <span>Reply</span>
              </button>
            )}
            
            {/* Edit and Delete buttons for comment author or admin */}
            {session?.user && (session.user.id === comment.author.id || session.user.role === 'ADMIN') && editingId !== comment.id && (
              <>
                <button
                  onClick={() => startEdit(comment)}
                  className="hover:text-foreground transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  disabled={deletingId === comment.id}
                  className="hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  {deletingId === comment.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    'Delete'
                  )}
                </button>
              </>
            )}
          </div>
          
          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px]"
              />
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content}</p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={(e) => handleSubmitReply(e, comment.id)}
                  disabled={isSubmitting || !replyContent.trim()}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                  Reply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setReplyingTo(null)
                    setReplyContent('')
                    setErrors({})
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <section className="mt-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Comment Form */}
          {session?.user ? (
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                  <AvatarFallback>
                    {session.user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => {
                      setNewComment(e.target.value)
                      if (errors.content) {
                        setErrors(prev => ({ ...prev, content: '' }))
                      }
                    }}
                    className="min-h-[100px]"
                  />
                  {errors.content && (
                    <p className="text-sm text-red-500">{errors.content}</p>
                  )}
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting || !newComment.trim()}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Post Comment
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>Please sign in to leave a comment.</p>
            </div>
          )}
          
          {/* Comments List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}