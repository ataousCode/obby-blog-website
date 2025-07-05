'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Loader2, MessageCircle, Reply, Heart, Trash2 } from 'lucide-react'
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

// Move CommentItem outside to prevent re-creation
const CommentItem = React.memo(({ 
  comment, 
  isReply = false, 
  session, 
  replyingTo, 
  setReplyingTo, 
  replyContents, 
  setReplyContents, 
  errors, 
  setErrors, 
  editingId, 
  setEditingId, 
  editContent, 
  setEditContent, 
  deletingId, 
  isSubmitting, 
  handleSubmitReply, 
  handleDeleteComment, 
  handleEditComment,
  startEdit, 
  cancelEdit 
}: { 
  comment: Comment; 
  isReply?: boolean;
  session: any;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyContents: Record<string, string>;
  setReplyContents: (fn: (prev: Record<string, string>) => Record<string, string>) => void;
  errors: Record<string, string>;
  setErrors: (fn: (prev: Record<string, string>) => Record<string, string>) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editContent: string;
  setEditContent: (content: string) => void;
  deletingId: string | null;
  isSubmitting: boolean;
  handleSubmitReply: (e: React.FormEvent, parentId: string) => void;
  handleDeleteComment: (commentId: string) => void;
  handleEditComment: (commentId: string) => void;
  startEdit: (comment: Comment) => void;
  cancelEdit: () => void;
}) => (
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
          
          {session?.user && (session.user.id === comment.author.id || session.user.role === 'ADMIN') && editingId !== comment.id && (
            <>
              <button
                onClick={() => startEdit(comment)}
                className="hover:text-foreground transition-colors"
              >
                Edit
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    disabled={deletingId === comment.id}
                    className="hover:text-red-500 transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {deletingId === comment.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </>
                    )}
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this comment? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteComment(comment.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>
              </>
            )}
        </div>
        
        {replyingTo === comment.id && (
          <div className="mt-3 space-y-2">
            <Textarea
              placeholder="Write a reply..."
              value={replyContents[comment.id] || ''}
              onChange={(e) => setReplyContents(prev => ({ ...prev, [comment.id]: e.target.value }))}
              className="min-h-[80px]"
              autoFocus
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content}</p>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={(e) => handleSubmitReply(e, comment.id)}
                disabled={isSubmitting || !(replyContents[comment.id] || '').trim()}
              >
                {isSubmitting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Reply
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setReplyingTo(null)
                  setReplyContents(prev => ({ ...prev, [comment.id]: '' }))
                  setErrors(() => ({}))
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply) => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                isReply 
                session={session}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyContents={replyContents}
                setReplyContents={setReplyContents}
                errors={errors}
                setErrors={setErrors}
                editingId={editingId}
                setEditingId={setEditingId}
                editContent={editContent}
                setEditContent={setEditContent}
                deletingId={deletingId}
                isSubmitting={isSubmitting}
                handleSubmitReply={handleSubmitReply}
                handleDeleteComment={handleDeleteComment}
                handleEditComment={handleEditComment}
                startEdit={startEdit}
                cancelEdit={cancelEdit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
))

export function CommentSection({ postId }: CommentSectionProps) {
  console.log('CommentSection rendered with postId:', postId)
  const { data: session } = useSession()
  console.log('Session data:', session)
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContents, setReplyContents] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    console.log('=== FETCHING COMMENTS ===')
    console.log('Fetching comments for postId:', postId)
    try {
      const response = await fetch(`/api/posts/${postId}/comments`)
      console.log('Fetch comments response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched comments data:', data)
        console.log('Number of comments received:', data.comments?.length || 0)
        setComments(data.comments || [])
      } else {
        console.error('Failed to fetch comments:', response.status, response.statusText)
        toast({
          title: "Error",
          description: "Failed to load comments. Please refresh the page.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast({
        title: "Error",
        description: "Network error while loading comments.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [postId, toast])

  useEffect(() => {
    console.log('useEffect triggered for fetchComments, postId:', postId)
    if (postId) {
      console.log('About to call fetchComments...')
      setIsLoading(true)
      fetchComments()
    } else {
      console.log('No postId provided, skipping fetchComments')
    }
  }, [postId, fetchComments])



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
    
    console.log('=== COMMENT SUBMISSION STARTED ===')
    console.log('Submitting comment for postId:', postId)
    console.log('Comment content:', newComment)
    console.log('User session:', session?.user)
    console.log('Session user ID:', session?.user?.id)
    
    if (!session?.user?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment.",
        variant: "destructive"
      })
      return
    }

    if (!validateComment(newComment)) {
      console.log('Comment validation failed')
      return
    }

    setIsSubmitting(true)
    setErrors(() => ({}))

    try {
      console.log('Making API request to:', `/api/posts/${postId}/comments`)
      console.log('Request body:', JSON.stringify({ content: newComment }))
      
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
        }),
      })

      console.log('API response status:', response.status)
      console.log('API response headers:', response.headers)
      console.log('API response ok:', response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('New comment posted successfully:', data.comment)
        console.log('Current comments before update:', comments.length)
        setComments(prev => {
          const updated = [data.comment, ...prev]
          console.log('Updated comments array:', updated.length)
          return updated
        })
        setNewComment('')
        toast({
          title: "Comment posted",
          description: "Your comment has been posted successfully.",
          variant: "success"
        })
      } else {
        const data = await response.json()
        console.error('API error response:', data)
        toast({
          title: "Error",
          description: data.error || 'Failed to post comment',
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Network error posting comment:', error)
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
    const currentReplyContent = replyContents[parentId] || ''
    console.log('=== REPLY SUBMISSION STARTED ===')
    console.log('Reply content:', currentReplyContent)
    console.log('Parent ID:', parentId)
    console.log('Post ID:', postId)
    console.log('User session:', session?.user)
    
    if (!session?.user?.id) {
      console.log('No user session, showing auth error')
      toast({
        title: "Authentication required",
        description: "Please sign in to reply.",
        variant: "destructive"
      })
      return
    }

    if (!validateComment(currentReplyContent)) {
      console.log('Reply content validation failed')
      return
    }

    setIsSubmitting(true)
    setErrors(() => ({}))

    try {
      console.log('Making API request for reply...')
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: currentReplyContent,
          parentId,
        }),
      })
      
      console.log('Reply API response status:', response.status)
      console.log('Reply API response ok:', response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log('Reply posted successfully:', data.comment)
        console.log('Updating comments state with new reply...')
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
        setReplyContents(prev => ({ ...prev, [parentId]: '' }))
        setReplyingTo(null)
        console.log('Reply form reset and state updated')
        toast({
          title: "Reply posted",
          description: "Your reply has been posted successfully.",
          variant: "success"
        })
      } else {
        const data = await response.json()
        console.error('Reply API error:', data)
        toast({
          title: "Error",
          description: data.error || 'Failed to post reply',
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Network error during reply submission:', error)
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive"
      })
    } finally {
      console.log('Reply submission finished, resetting isSubmitting')
      setIsSubmitting(false)
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!validateComment(editContent)) {
      return
    }

    setIsSubmitting(true)
    setErrors(() => ({}))

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
          variant: "success"
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
          variant: "success"
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
    setErrors(() => ({}))
  }



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
                    onClick={() => console.log('Button clicked! Form should submit.')}
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
                <CommentItem 
                  key={comment.id} 
                  comment={comment}
                  session={session}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyContents={replyContents}
                  setReplyContents={setReplyContents}
                  errors={errors}
                  setErrors={setErrors}
                  editingId={editingId}
                  setEditingId={setEditingId}
                  editContent={editContent}
                  setEditContent={setEditContent}
                  deletingId={deletingId}
                  isSubmitting={isSubmitting}
                  handleSubmitReply={handleSubmitReply}
                  handleDeleteComment={handleDeleteComment}
                  handleEditComment={handleEditComment}
                  startEdit={startEdit}
                  cancelEdit={cancelEdit}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}