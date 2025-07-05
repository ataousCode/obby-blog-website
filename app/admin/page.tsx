'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Users, FileText, MessageSquare, TrendingUp, Settings, Shield, Eye, UserPlus, Edit, User } from 'lucide-react'
import Link from 'next/link'

interface AdminStats {
  totalUsers: number
  totalPosts: number
  totalComments: number
  totalViews: number
  totalLikes: number
  recentUsers: number
  recentPosts: number
  recentComments: number
  recentActivity: {
    users: Array<{
      id: string
      name: string
      email: string
      image?: string
      createdAt: string
      role: string
    }>
    posts: Array<{
      id: string
      title: string
      slug: string
      publishedAt: string
      author: { name: string }
      _count: {
        likes: number
        comments: number
      }
    }>
  }
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    // Fetch admin stats
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        const data = await response.json()
        
        if (response.ok) {
          setStats(data.stats)
        }
      } catch (error) {
        // Error handled silently
      } finally {
        setIsLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchStats()
    }
  }, [status, session, router])

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
              <Shield className="h-8 w-8" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your blog platform and monitor site activity
            </p>
          </div>
          <Badge variant="default" className="px-3 py-1">
            <Shield className="h-3 w-3 mr-1" />
            Administrator
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{stats?.recentUsers || 0} from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPosts || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{stats?.recentPosts || 0} from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalComments || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{stats?.recentComments || 0} from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalViews || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total post views
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalLikes || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total post likes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* User Management */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <Link href="/admin/users">
                  <Users className="mr-2 h-4 w-4" />
                  View All Users
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/users/create">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add New User
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Content Management */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content Management
              </CardTitle>
              <CardDescription>
                Manage posts, comments, and content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <Link href="/admin/posts">
                  <FileText className="mr-2 h-4 w-4" />
                  Manage Posts
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/comments">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Manage Comments
                </Link>
              </Button>
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
                Configure site settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <Link href="/admin/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  General Settings
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/categories">
                  <Edit className="mr-2 h-4 w-4" />
                  Manage Categories
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* About Page Management */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                About Page
              </CardTitle>
              <CardDescription>
                Manage your professional profile and about page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <Link href="/admin/about">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit About Page
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/about">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview Page
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Analytics */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Site Analytics
            </CardTitle>
            <CardDescription>
              Monitor site performance and user engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-primary" />
                <p className="text-lg font-medium">Advanced Analytics Available</p>
                <p className="text-sm text-muted-foreground">Track user engagement, popular posts, and site metrics</p>
              </div>
              <Button className="w-full" asChild>
                <Link href="/admin/analytics">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Analytics Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.recentActivity?.users && stats.recentActivity.users.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentActivity.users.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className="text-xs">
                          {user.role}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent users</p>
                  <p className="text-sm">New user registrations will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.recentActivity?.posts && stats.recentActivity.posts.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentActivity.posts.map((post) => (
                    <div key={post.id} className="p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <Link href={`/posts/${post.slug}`} className="text-sm font-medium hover:text-primary line-clamp-2">
                            {post.title}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-1">
                            By {post.author.name} • {new Date(post.publishedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {post._count.likes}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {post._count.comments}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent posts</p>
                  <p className="text-sm">New posts will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>
              Frequently used admin functions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" asChild>
                <Link href="/">
                  <Eye className="mr-2 h-4 w-4" />
                  View Site
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/write">
                  <Edit className="mr-2 h-4 w-4" />
                  Write Post
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">
                  <Users className="mr-2 h-4 w-4" />
                  User Dashboard
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/backup">
                  <Settings className="mr-2 h-4 w-4" />
                  Backup & Export
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}