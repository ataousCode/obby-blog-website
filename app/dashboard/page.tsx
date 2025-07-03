'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Loader2, User, Mail, Calendar, Shield, PenTool, BookOpen, Heart, Users, FileText, MessageSquare, Eye, ThumbsUp, Settings, Edit } from 'lucide-react'
import Link from 'next/link'

interface AdminStats {
  totalUsers: number
  totalPosts: number
  totalComments: number
  totalViews: number
  totalLikes: number
}

interface UserStats {
  myPosts: number
  myDrafts: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    const fetchStats = async () => {
      if (session && (session.user as any)?.role === 'ADMIN') {
        try {
          const response = await fetch('/api/admin/stats')
          if (response.ok) {
            const data = await response.json()
            setStats(data.stats)
          }
        } catch (error) {
          console.error('Failed to fetch admin stats:', error)
        }
      }
      
      // Fetch user's own post stats
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/posts?author=${session.user.id}&published=all&limit=1000`)
          if (response.ok) {
            const data = await response.json()
            const posts = data.posts || []
            const publishedPosts = posts.filter((post: any) => post.publishedAt)
            const draftPosts = posts.filter((post: any) => !post.publishedAt)
            setUserStats({
              myPosts: publishedPosts.length,
              myDrafts: draftPosts.length
            })
          }
        } catch (error) {
          console.error('Failed to fetch user stats:', error)
        }
      }
      
      setLoading(false)
    }

    if (session) {
      fetchStats()
    }
  }, [session])

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const user = session.user
  const isAdmin = (user as any)?.role === 'ADMIN'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Admin Dashboard' : 'User Dashboard'}
          </p>
        </div>

        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
                <AvatarFallback className="text-lg">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{user?.name}</h3>
                  <Badge variant={isAdmin ? 'default' : 'secondary'}>
                    {isAdmin ? (
                      <><Shield className="h-3 w-3 mr-1" /> Admin</>
                    ) : (
                      <><User className="h-3 w-3 mr-1" /> User</>
                    )}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {new Date().getFullYear()}</span>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link href="/profile">
                  Edit Profile
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Admin Stats Overview */}
        {isAdmin && stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPosts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalComments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalViews}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                <ThumbsUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLikes}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Write Post */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5" />
                Write Post
              </CardTitle>
              <CardDescription>
                Share your thoughts with the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link href="/write">
                  Create New Post
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* My Posts */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                My Posts
              </CardTitle>
              <CardDescription>
                Manage your published articles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{userStats?.myPosts || 0}</div>
                <p className="text-sm text-muted-foreground">Published posts</p>
                {userStats?.myDrafts && userStats.myDrafts > 0 && (
                  <p className="text-sm text-muted-foreground">{userStats.myDrafts} drafts</p>
                )}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/my-posts">
                    View All Posts
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          {isAdmin && (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Categories
                </CardTitle>
                <CardDescription>
                  Manage blog categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <Link href="/categories">
                    Manage Categories
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Admin Management Section */}
        {isAdmin && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Admin Management
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* Content Management */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Content Management
                  </CardTitle>
                  <CardDescription>
                    Manage posts and comments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/admin/posts">
                        Manage Posts
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/admin/comments">
                        Manage Comments
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Site Settings */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Site Settings
                  </CardTitle>
                  <CardDescription>
                    Configure site settings and about page
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" asChild>
                    <Link href="/admin/about">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit About Page
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}



        {/* Regular User Activity */}
        {!isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest actions on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">Start by creating your first post!</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}