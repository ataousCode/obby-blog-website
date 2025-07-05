import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calendar, Eye, Heart, MessageCircle } from 'lucide-react'
import { prisma } from '@/lib/prisma'

interface Post {
  id: string
  title: string
  excerpt: string | null
  coverImage: string | null
  slug: string
  publishedAt: Date | null
  views: number
  author: {
    name: string | null
  }
  category: {
    name: string
  } | null
  _count: {
    likes: number
    comments: number
  }
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  _count: {
    posts: number
  }
}

async function getFeaturedPosts(): Promise<Post[]> {
  try {
    if (!prisma) {
      console.error('Database not available')
      return []
    }

    const posts = await prisma.post.findMany({
      where: {
        publishedAt: { not: null }
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        coverImage: true,
        slug: true,
        publishedAt: true,
        views: true,
        author: {
          select: {
            name: true
          }
        },
        category: {
          select: {
            name: true
          }
        },
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
      take: 6
    })
    return posts;
  } catch (error) {
    console.error('Error fetching featured posts:', error)
    return []
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    if (!prisma) {
      console.error('Database not available')
      return []
    }

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: {
          select: {
            posts: {
              where: {
                publishedAt: {
                  not: null
                }
              }
            }
          }
        }
      },
      orderBy: {
        posts: {
          _count: 'desc'
        }
      },
      take: 5
    })
    return categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

const categoryColors = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-purple-100 text-purple-800',
  'bg-orange-100 text-orange-800',
  'bg-pink-100 text-pink-800'
]

export default async function HomePage() {
  const [featuredPosts, categories] = await Promise.all([
    getFeaturedPosts(),
    getCategories()
  ])
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16 mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Welcome to My Professional Blog
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Discover insights, tutorials, and best practices in web development, 
          programming, and technology. Join our community of developers and learners.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/posts">
              Explore Posts
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/auth/signup">
              Join Community
            </Link>
          </Button>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Featured Articles</h2>
            <p className="text-muted-foreground mt-1">Latest published posts from our community</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/posts">View All</Link>
          </Button>
        </div>
        
        {featuredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={post.coverImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop'}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                  {post.category && (
                    <Badge className="absolute top-4 left-4">
                      {post.category.name}
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                    <Link href={`/posts/${post.slug}`}>
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.excerpt || 'No excerpt available'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>By {post.author.name || 'Unknown Author'}</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Not published'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {post._count.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {post._count.comments}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No articles available at the moment.</p>
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Browse by Category</h2>
        {categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category, index) => (
              <Link key={category.id} href={`/posts?category=${category.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-semibold mb-2">{category.name}</h3>
                    <Badge variant="secondary" className={categoryColors[index % categoryColors.length]}>
                      {category._count.posts} articles
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No categories available yet.</p>
          </div>
        )}
      </section>

      {/* Newsletter Signup */}
      <section className="bg-muted rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Subscribe to our newsletter to get the latest articles and updates delivered to your inbox.
        </p>
        <Button asChild>
          <Link href="/auth/signup">
            Subscribe Now
          </Link>
        </Button>
      </section>
    </div>
  )
}