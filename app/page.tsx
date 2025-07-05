import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { PostCoverImage } from '@/components/optimized-image'
import { ArrowRight, Calendar, Eye, Heart, MessageCircle, Microscope, Dna, Atom, FlaskConical } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const revalidate = 300

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
    image: string | null
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
      return []
    }

    const posts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
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
            name: true,
            image: true
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
      return []
    }
}

async function getCategories(): Promise<Category[]> {
  try {
    if (!prisma) {
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
      <section className="relative text-center py-20 mb-16 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 animate-pulse">
            <Dna className="h-16 w-16 text-primary" />
          </div>
          <div className="absolute top-20 right-20 animate-pulse delay-1000">
            <Microscope className="h-12 w-12 text-green-600" />
          </div>
          <div className="absolute bottom-20 left-20 animate-pulse delay-500">
            <Atom className="h-14 w-14 text-blue-600" />
          </div>
          <div className="absolute bottom-10 right-10 animate-pulse delay-700">
            <FlaskConical className="h-10 w-10 text-purple-600" />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-full border border-green-200">
              <Microscope className="h-8 w-8 text-green-600" />
              <Dna className="h-8 w-8 text-blue-600" />
              <FlaskConical className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Exploring the Wonders of Science
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Dive into the fascinating world of biology, molecular science, and cutting-edge research. 
            Discover breakthrough discoveries, scientific insights, and the latest developments 
            that are shaping our understanding of life and nature.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <Microscope className="h-4 w-4" />
              Molecular Biology
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              <Dna className="h-4 w-4" />
              Genetics Research
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              <FlaskConical className="h-4 w-4" />
              Biochemistry
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              <Atom className="h-4 w-4" />
              Cell Biology
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700" asChild>
              <Link href="/posts">
                Explore Research
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-green-200 hover:bg-green-50" asChild>
              <Link href="/about">
                About the Researcher
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Latest Research & Discoveries</h2>
            <p className="text-muted-foreground mt-1">Recent publications and scientific insights</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/posts">View All</Link>
          </Button>
        </div>
        
        {featuredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <PostCoverImage
                    src={post.coverImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop'}
                    alt={post.title}
                  />
                  {post.category && (
                    <Badge className="absolute top-4 left-4 z-10">
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
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={post.author.image || ''} alt={post.author.name || ''} />
                        <AvatarFallback className="text-xs">
                          {post.author.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span>By {post.author.name || 'Unknown Author'}</span>
                    </div>
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
            <p className="text-muted-foreground">No research articles available at the moment.</p>
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Research Areas</h2>
        {categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category, index) => (
              <Link key={category.id} href={`/posts?category=${category.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-semibold mb-2">{category.name}</h3>
                    <Badge variant="secondary" className={categoryColors[index % categoryColors.length]}>
                      {category._count.posts} publications
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
      <section className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Stay Connected with Science</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Join our scientific community to receive the latest research findings, discoveries, and insights delivered to your inbox.
        </p>
        <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700" asChild>
          <Link href="/auth/signup">
            Join Research Community
          </Link>
        </Button>
      </section>
    </div>
  )
}