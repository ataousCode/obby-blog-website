'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Save, Eye, X, Plus, Image as ImageIcon, Upload, Trash2 } from 'lucide-react'
import { z } from 'zod'
import Image from 'next/image'

const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500, 'Excerpt must be less than 500 characters').optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featuredImage: z.string().optional(),
  published: z.boolean().default(false)
})

type PostFormData = z.infer<typeof postSchema>

interface Category {
  id: string
  name: string
  slug: string
}

export default function WritePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    excerpt: '',
    categoryId: '',
    tags: [],
    featuredImage: '',
    published: false
  })
  
  const [newTag, setNewTag] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPreview, setIsPreview] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        if (response.ok) {
          setCategories(data.categories)
        } else {
          toast({
            title: "Error",
            description: "Failed to load categories",
            variant: "destructive"
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive"
        })
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [toast])

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, categoryId: value }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }))
  }

  const handleFileUpload = async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or WebP image.",
        variant: "destructive"
      })
      return
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive"
      })
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setFormData(prev => ({ ...prev, featuredImage: data.url }))
        toast({
          title: "Image uploaded",
          description: "Featured image has been uploaded successfully.",
        })
      } else {
        toast({
          title: "Upload failed",
          description: data.error || 'Failed to upload image',
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Network error. Please try again.",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const removeFeaturedImage = () => {
    setFormData(prev => ({ ...prev, featuredImage: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const validateForm = () => {
    try {
      postSchema.parse(formData)
      setErrors({})
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

  const handleSubmit = async (published: boolean) => {
    const submitData = { ...formData, published }
    
    try {
      postSchema.parse(submitData)
      setErrors({})
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
        return
      }
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: published ? "Post published!" : "Draft saved!",
          description: published 
            ? "Your post has been published successfully." 
            : "Your draft has been saved successfully.",
          variant: "success",
        })
        router.push(published ? `/posts/${data.post.slug}` : '/dashboard')
      } else {
        toast({
          title: "Error",
          description: data.error || 'Failed to save post',
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
      setIsLoading(false)
    }
  }

  if (isPreview) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Preview</h1>
            <Button variant="outline" onClick={() => setIsPreview(false)}>
              <X className="mr-2 h-4 w-4" />
              Close Preview
            </Button>
          </div>
          
          <article className="prose prose-lg max-w-none">
            <header className="mb-8">
              <h1 className="text-4xl font-bold mb-4">{formData.title || 'Untitled Post'}</h1>
              {formData.excerpt && (
                <p className="text-xl text-muted-foreground mb-4">{formData.excerpt}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>By {session?.user?.name}</span>
                <span>•</span>
                <span>{new Date().toLocaleDateString()}</span>
                {formData.categoryId && (
                  <>
                    <span>•</span>
                    <Badge variant="secondary">
                      {categories.find(c => c.id === formData.categoryId)?.name}
                    </Badge>
                  </>
                )}
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
              )}
            </header>
            
            {formData.featuredImage && (
              <div className="mb-8">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                  <Image
                    src={formData.featuredImage}
                    alt="Featured image"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
            
            <div className="whitespace-pre-wrap">
              {formData.content || 'Start writing your content...'}
            </div>
          </article>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Write New Post</h1>
          <Button variant="outline" onClick={() => setIsPreview(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter your post title..."
                value={formData.title}
                onChange={handleChange}
                className={`text-lg ${errors.title ? 'border-red-500' : ''}`}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                name="excerpt"
                placeholder="Brief description of your post (optional)..."
                value={formData.excerpt}
                onChange={handleChange}
                className={errors.excerpt ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.excerpt && (
                <p className="text-sm text-red-500">{errors.excerpt}</p>
              )}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Write your post content here..."
                value={formData.content}
                onChange={handleChange}
                className={`min-h-[400px] ${errors.content ? 'border-red-500' : ''}`}
              />
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content}</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Publish</CardTitle>
                <CardDescription>
                  Save as draft or publish your post
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleSubmit(false)}
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>
                <Button 
                  className="w-full"
                  onClick={() => handleSubmit(true)}
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Publish Post
                </Button>
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>Category</CardTitle>
                <CardDescription>
                  Choose a category for your post
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={formData.categoryId} onValueChange={handleCategoryChange} disabled={loadingCategories}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categories.length === 0 && !loadingCategories && (
                  <p className="text-sm text-muted-foreground mt-2">
                    No categories available. Please create categories in the admin panel first.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>
                  Add tags to help readers find your post
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                  />
                  <Button size="sm" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer">
                        {tag}
                        <X 
                          className="ml-1 h-3 w-3" 
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
                <CardDescription>
                  Upload a featured image for your post
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.featuredImage ? (
                  <div className="space-y-3">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                      <Image
                        src={formData.featuredImage}
                        alt="Featured image preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex-1"
                      >
                        {uploading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="mr-2 h-4 w-4" />
                        )}
                        Replace
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={removeFeaturedImage}
                        disabled={uploading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full h-24 border-dashed"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <div className="flex flex-col items-center gap-2">
                        {uploading ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <ImageIcon className="h-6 w-6" />
                        )}
                        <span className="text-sm">
                          {uploading ? 'Uploading...' : 'Click to upload image'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          JPEG, PNG, WebP (max 5MB)
                        </span>
                      </div>
                    </Button>
                    
                    <div className="text-center text-sm text-muted-foreground">
                      or
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="featuredImageUrl">Image URL</Label>
                      <Input
                        id="featuredImageUrl"
                        placeholder="https://example.com/image.jpg"
                        value={formData.featuredImage}
                        onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}