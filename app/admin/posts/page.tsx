'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, FileText, Edit, Trash2, Eye, Search, Plus } from 'lucide-react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  publishedAt: string | null
  createdAt: string
  author: {
    id: string
    name: string
    email: string
  }
  category: {
    id: string
    name: string
  } | null
  _count: {
    likes: number
    comments: number
  }
}

export default function AdminPostsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch('/api/posts?published=all&limit=100')
      const data = await response.json()
      
      if (response.ok) {
        setPosts(data.posts || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch posts",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error while fetching posts",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    fetchPosts()
  }, [status, session, router, fetchPosts])

  const handleDeletePost = async (postId: string) => {
    setDeletingId(postId)
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId))
        toast({
          title: "Success",
          description: "Post deleted successfully"
        })
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to delete post",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error while deleting post",
        variant: "destructive"
      })
    } finally {
      setDeletingId(null)
    }
  }

  const togglePublishStatus = async (id: string, currentlyPublished: boolean) => {
    setUpdatingId(id)
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          published: !currentlyPublished
        }),
      })
      
      if (response.ok) {
        const updatedPost = await response.json()
        setPosts(posts.map(post => 
          post.id === id 
            ? { ...post, publishedAt: updatedPost.publishedAt }
            : post
        ))
        toast({
          title: "Success",
          description: `Post ${!currentlyPublished ? 'published' : 'unpublished'} successfully`
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update post status",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating post status:', error)
      toast({
        title: "Error",
        description: "Failed to update post status",
        variant: "destructive"
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Manage Posts
            </h1>
            <p className="text-muted-foreground mt-2">
              View, edit, and delete blog posts
            </p>
          </div>
          <Button asChild>
            <Link href="/write">
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Posts Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Posts ({filteredPosts.length})</CardTitle>
            <CardDescription>
              Manage all blog posts in your system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{post.title}</div>
                        {post.excerpt && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {post.excerpt}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{post.author.name}</TableCell>
                    <TableCell>
                      {post.category ? (
                        <Badge variant="secondary">{post.category.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">No category</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {post.publishedAt ? (
                        <Badge variant="default">Published</Badge>
                      ) : (
                        <Badge variant="outline">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{post._count.likes} likes</div>
                        <div>{post._count.comments} comments</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/posts/${post.slug}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/write?edit=${post.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant={post.publishedAt ? "secondary" : "default"}
                          size="sm"
                          onClick={() => togglePublishStatus(post.id, !!post.publishedAt)}
                          disabled={updatingId === post.id}
                        >
                          {updatingId === post.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : post.publishedAt ? (
                            "Unpublish"
                          ) : (
                            "Publish"
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Post</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this post?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeletePost(post.id)}
                                disabled={deletingId === post.id}
                              >
                                {deletingId === post.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="mr-2 h-4 w-4" />
                                )}
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredPosts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No posts found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}