'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Save, Eye, Upload, X } from 'lucide-react'

interface AboutPageData {
  id?: string
  profileImage?: string
  name?: string
  title?: string
  aboutMe?: string
  education?: string
  experience?: string
  researchInterests?: string
  publications?: string
  contactEmail?: string
  contactPhone?: string
  contactLocation?: string
  blogPurpose?: string
}

export default function AdminAboutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<AboutPageData>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Redirect if not admin
  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user || session.user.role !== 'ADMIN') {
      router.push('/admin')
      return
    }
  }, [session, status, router])

  // Fetch current about page data
  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await fetch('/api/admin/about')
        if (response.ok) {
          const data = await response.json()
          setFormData(data)
        } else {
          toast({
            title: 'Error',
            description: 'Failed to fetch about page data',
            variant: 'destructive'
          })
        }
      } catch (error) {
        console.error('Error fetching about data:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch about page data',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.role === 'ADMIN') {
      fetchAboutData()
    }
  }, [session, toast])

  const handleInputChange = (field: keyof AboutPageData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Error',
        description: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
        variant: 'destructive'
      })
      return
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast({
        title: 'Error',
        description: 'File too large. Maximum size is 5MB.',
        variant: 'destructive'
      })
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        handleInputChange('profileImage', data.url)
        toast({
          title: 'Success',
          description: 'Profile image uploaded successfully',
          variant: 'success'
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/about', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'About page updated successfully',
          variant: 'success'
        })
      } else {
        throw new Error('Failed to update')
      }
    } catch (error) {
      console.error('Error saving about data:', error)
      toast({
        title: 'Error',
        description: 'Failed to update about page',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Manage About Page</h1>
          <p className="text-muted-foreground mt-2">
            Update your professional information and about page content
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open('/about', '_blank')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Your name, title, and profile image
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Profile Image</Label>
                <div className="mt-2 space-y-4">
                  {/* Current Image Preview */}
                  {formData.profileImage && (
                    <div className="relative inline-block">
                      <Image
                        src={formData.profileImage}
                        alt="Profile preview"
                        width={128}
                        height={128}
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => handleInputChange('profileImage', '')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                  {/* File Upload */}
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </Button>
                  </div>
                  
                  {/* Manual URL Input */}
                  <div>
                    <Label htmlFor="profileImageUrl" className="text-sm text-muted-foreground">
                      Or enter image URL manually
                    </Label>
                    <Input
                      id="profileImageUrl"
                      value={formData.profileImage || ''}
                      onChange={(e) => handleInputChange('profileImage', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="mt-1"
                    />
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Supported formats: JPEG, PNG, WebP. Maximum size: 5MB.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Dr. Your Name"
              />
            </div>
            <div>
              <Label htmlFor="title">Professional Title</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Professor of Biology and Science | Post Doc Researcher"
              />
            </div>
          </CardContent>
        </Card>

        {/* About Me */}
        <Card>
          <CardHeader>
            <CardTitle>About Me</CardTitle>
            <CardDescription>
              A brief introduction about yourself
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.aboutMe || ''}
              onChange={(e) => handleInputChange('aboutMe', e.target.value)}
              placeholder="Write a brief introduction about yourself..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
            <CardDescription>
              Your educational background and qualifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.education || ''}
              onChange={(e) => handleInputChange('education', e.target.value)}
              placeholder="PhD in Biology and Science\nPost Doctoral Research at Southwest University..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Experience */}
        <Card>
          <CardHeader>
            <CardTitle>Experience</CardTitle>
            <CardDescription>
              Your professional experience and achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.experience || ''}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              placeholder="8+ years of research experience\nExtensive publication record..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Research Interests */}
        <Card>
          <CardHeader>
            <CardTitle>Research Interests</CardTitle>
            <CardDescription>
              Your areas of research and expertise (comma-separated)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.researchInterests || ''}
              onChange={(e) => handleInputChange('researchInterests', e.target.value)}
              placeholder="Molecular Biology,Cell Biology,Genetics,Biochemistry..."
              rows={2}
            />
          </CardContent>
        </Card>

        {/* Publications & Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Publications & Achievements</CardTitle>
            <CardDescription>
              Your publications and notable achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.publications || ''}
              onChange={(e) => handleInputChange('publications', e.target.value)}
              placeholder="Over 20 peer-reviewed publications\nRegular contributor to leading scientific journals..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              How people can get in touch with you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail || ''}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="your-email@university.edu"
              />
            </div>
            <div>
              <Label htmlFor="contactPhone">Phone</Label>
              <Input
                id="contactPhone"
                value={formData.contactPhone || ''}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="contactLocation">Location/Institution</Label>
              <Input
                id="contactLocation"
                value={formData.contactLocation || ''}
                onChange={(e) => handleInputChange('contactLocation', e.target.value)}
                placeholder="Southwest University of Science and Technology"
              />
            </div>
          </CardContent>
        </Card>

        {/* Blog Purpose */}
        <Card>
          <CardHeader>
            <CardTitle>About This Blog</CardTitle>
            <CardDescription>
              Describe the purpose and focus of your blog
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.blogPurpose || ''}
              onChange={(e) => handleInputChange('blogPurpose', e.target.value)}
              placeholder="This blog serves as a platform to share scientific insights..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save All Changes
          </Button>
        </div>
      </div>
    </div>
  )
}