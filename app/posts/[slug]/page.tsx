import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@radix-ui/react-separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Clock, ArrowLeft, Heart, MessageCircle, Share2, User } from 'lucide-react'
import { formatDate, readingTime } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { PostActions } from '@/components/post-actions'
import { CommentSection } from '@/components/comment-section'

interface PostPageProps {
  params: {
    slug: string
  }
}

async function getPost(slug: string) {
  try {
    const post = await prisma.post.findUnique({
      where: {
        slug,
        publishedAt: { not: null }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        category: true,
        tags: true,
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    })

    return post
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

async function getRelatedPosts(postId: string, categoryId?: string, limit: number = 3) {
  try {
    const relatedPosts = await prisma.post.findMany({
      where: {
        id: { not: postId },
        publishedAt: { not: null },
        ...(categoryId && { categoryId })
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        category: true,
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: limit
    })

    return relatedPosts
  } catch (error) {
    console.error('Error fetching related posts:', error)
    return []
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  // Increment view count
  try {
    await prisma.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } }
    })
  } catch (error) {
    console.error('Error incrementing view count:', error)
  }

  const relatedPosts = await getRelatedPosts(post.id, post.categoryId || undefined)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/posts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Posts
            </Link>
          </Button>
        </div>

        {/* Article Header */}
        <article className="mb-12">
          <header className="mb-8">
            {/* Category */}
            {post.category && (
              <div className="mb-4">
                <Badge variant="secondary" className="text-sm">
                  {post.category?.name}
                </Badge>
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.author?.image || ''} alt={post.author?.name || ''} />
                  <AvatarFallback>
                    {post.author?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{post.author?.name}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{post.publishedAt ? formatDate(post.publishedAt) : 'Not published'}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{readingTime(post.content)} min read</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{post._count?.likes || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post._count?.comments || 0}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag: any) => (
                  <Badge key={tag.id} variant="outline">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <PostActions postId={post.id} />
          </header>

          {/* Featured Image */}
          {post.coverImage && (
            <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <Separator className="mb-8" />

          {/* Content */}
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <div className="whitespace-pre-wrap leading-relaxed">
              {post.content}
            </div>
          </div>
        </article>

        <Separator className="mb-8" />

        {/* Author Bio */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={post.author?.image || ''} alt={post.author?.name || ''} />
                <AvatarFallback className="text-lg">
                  {post.author?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="mb-2">{post.author?.name}</CardTitle>
                <p className="text-muted-foreground">
                  No bio available.
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Comments Section */}
        <CommentSection postId={post.id} />

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((relatedPost: any) => (
                <Card key={relatedPost.id} className="h-full flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader className="flex-1">
                    <CardTitle className="line-clamp-2 hover:text-primary">
                      <Link href={`/posts/${relatedPost.slug}`}>
                        {relatedPost.title}
                      </Link>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {relatedPost.excerpt || relatedPost.content.substring(0, 100) + '...'}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{relatedPost.author?.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          <span>{relatedPost._count?.likes || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{relatedPost._count?.comments || 0}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PostPageProps) {
  const post = await getPost(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found'
    }
  }

  return {
    title: post.title,
    description: post.excerpt || post.content.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
      type: 'article',
      publishedTime: post.publishedAt || undefined,
      authors: [post.author?.name || ''],
    },
  }
}