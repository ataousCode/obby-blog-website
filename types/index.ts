// Base types that match Prisma schema
export interface User {
  id: string
  name: string | null
  email: string
  emailVerified: Date | null
  image: string | null
  role: 'USER' | 'ADMIN'
  bio: string | null
  website: string | null
  location: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Post {
  id: string
  title: string
  content: string
  excerpt: string | null
  slug: string
  featuredImage: string | null
  status: 'DRAFT' | 'PUBLISHED'
  authorId: string
  categoryId: string
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  id: string
  content: string
  authorId: string
  postId: string
  createdAt: Date
  updatedAt: Date
}

export interface Like {
  id: string
  userId: string
  postId: string
  createdAt: Date
}

export interface Tag {
  id: string
  name: string
  slug: string
  createdAt: Date
  updatedAt: Date
}

// Extended types with relations
export type PostWithDetails = Post & {
  author: User
  category: Category
  comments: Comment[]
  likes: Like[]
  tags: Tag[]
  _count: {
    comments: number
    likes: number
  }
}

export type CommentWithAuthor = Comment & {
  author: User
}

export type UserWithCounts = User & {
  _count: {
    posts: number
    comments: number
    likes: number
  }
}

// Form types
export interface SignInFormData {
  email: string
  password: string
}

export interface SignUpFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface PostFormData {
  title: string
  content: string
  excerpt?: string
  categoryId: string
  tags: string[]
  featuredImage?: string
  status: 'DRAFT' | 'PUBLISHED'
}

export interface CommentFormData {
  content: string
  postId: string
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Search and filter types
export interface PostFilters {
  category?: string
  tag?: string
  author?: string
  status?: 'DRAFT' | 'PUBLISHED'
  search?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'title'
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationParams {
  page?: number
  limit?: number
}

// Theme types
export type Theme = 'light' | 'dark' | 'system'

// Navigation types
export interface NavItem {
  title: string
  href: string
  disabled?: boolean
  external?: boolean
}

export interface SiteConfig {
  name: string
  description: string
  url: string
  ogImage: string
  links: {
    twitter: string
    github: string
    linkedin: string
  }
}

// Email types
export interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

export interface NewsletterSubscription {
  email: string
  subscribed: boolean
  subscribedAt: Date
}

// Error types
export interface FormError {
  field: string
  message: string
}

export interface ValidationError {
  errors: FormError[]
}

// Upload types
export interface UploadResult {
  url: string
  publicId: string
  width?: number
  height?: number
}

// Analytics types
export interface PostAnalytics {
  views: number
  likes: number
  comments: number
  shares: number
}

export interface UserAnalytics {
  totalPosts: number
  totalViews: number
  totalLikes: number
  totalComments: number
  followers: number
  following: number
}