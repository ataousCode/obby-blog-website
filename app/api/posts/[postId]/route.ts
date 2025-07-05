import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updatePostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  excerpt: z.string().max(500, 'Excerpt must be less than 500 characters').optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional()
})

interface RouteParams {
  params: {
    postId: string
  }
}

// Get a single post
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      )
    }

    const { postId } = params

    const post = await prisma.post.findUnique({
      where: { id: postId },
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

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ post })

  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update a post
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      )
    }

    const { postId } = params
    const body = await req.json()
    
    // Validate request body
    const validationResult = updatePostSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true
          }
        }
      }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if user is admin or post author
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    const isAdmin = user?.role === 'ADMIN'
    const isAuthor = existingPost.author.id === session.user.id

    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { error: 'Forbidden - You can only edit your own posts or be an admin' },
        { status: 403 }
      )
    }

    const { title, content, excerpt, categoryId, tags, published } = validationResult.data

    // Prepare update data
    const updateData: any = {}
    
    if (title !== undefined) {
      updateData.title = title
      // Generate new slug if title is being updated
      const baseSlug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      
      let slug = baseSlug
      let counter = 1
      
      while (await prisma.post.findFirst({ 
        where: { 
          slug,
          id: { not: postId }
        } 
      })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }
      
      updateData.slug = slug
    }

    if (content !== undefined) updateData.content = content
    if (excerpt !== undefined) updateData.excerpt = excerpt
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (published !== undefined) {
      updateData.status = published ? 'PUBLISHED' : 'DRAFT'
      updateData.publishedAt = published ? new Date() : null
    }

    // Handle tags
    if (tags !== undefined) {
      // Disconnect all existing tags first
      await prisma.post.update({
        where: { id: postId },
        data: {
          tags: {
            set: []
          }
        }
      })

      // Connect new tags
      updateData.tags = {
        connectOrCreate: tags.map(tagName => ({
          where: { name: tagName },
          create: {
            name: tagName,
            slug: tagName.toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '')
          }
        }))
      }
    }

    // Update post
    const post = await prisma.post.update({
      where: { id: postId },
      data: updateData,
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

    return NextResponse.json(
      { 
        message: 'Post updated successfully',
        post 
      }
    )

  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete a post
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      )
    }

    const { postId } = params

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true
          }
        }
      }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if user is admin or post author
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    const isAdmin = user?.role === 'ADMIN'
    const isAuthor = existingPost.author.id === session.user.id

    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { error: 'Forbidden - You can only delete your own posts or be an admin' },
        { status: 403 }
      )
    }

    // Delete all related data first
    await prisma.$transaction([
      // Delete comments
      prisma.comment.deleteMany({
        where: { postId }
      }),
      // Delete likes
      prisma.like.deleteMany({
        where: { postId }
      }),
      // Delete bookmarks
      prisma.bookmark.deleteMany({
        where: { postId }
      }),
      // Disconnect tags
      prisma.post.update({
        where: { id: postId },
        data: {
          tags: {
            set: []
          }
        }
      }),
      // Finally delete the post
      prisma.post.delete({
        where: { id: postId }
      })
    ])

    return NextResponse.json(
      { message: 'Post deleted successfully' }
    )

  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}