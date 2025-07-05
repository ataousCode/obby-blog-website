import { Metadata } from 'next'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { GraduationCap, BookOpen, Award, MapPin, Mail, Globe } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'About - My Blog',
  description: 'Learn more about Dr. [Your Name], Professor of Biology and Science with over 8 years of research experience.',
}

async function getAboutPageData() {
  try {
    // Check if prisma client is available
    if (!prisma) {
      console.warn('Prisma client not available, using fallback data')
      return { aboutPage: null, adminUser: null }
    }
    
    const aboutPage = await prisma.aboutPage.findFirst()
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    return { aboutPage, adminUser }
  } catch (error) {
    console.error('Error fetching about page data:', error)
    return { aboutPage: null, adminUser: null }
  }
}

export default async function AboutPage() {
  const { aboutPage, adminUser } = await getAboutPageData()
    const data = aboutPage || {
    profileImage: '/images/profile.svg',
    name: 'Dr. [Your Name]',
    title: 'Professor of Biology and Science',
    aboutMe: 'Welcome to my academic blog! I am a dedicated professor and researcher with a passion for advancing our understanding of biological sciences. With over 8 years of experience in research and academia, I have had the privilege of contributing to the scientific community through numerous publications and collaborative research projects.',
    education: 'Ph.D. in Biology and Science\nSouthwest University of Science and Technology\n\nPost-Doctoral Research\nSouthwest University of Science and Technology',
    experience: 'Professor\nSouthwest University of Science and Technology\nCurrent Position\n\nResearch Experience\n8+ Years in Academic Research\nMultiple Publications & Papers',
    researchInterests: 'Molecular Biology,Cell Biology,Genetics,Biochemistry,Biotechnology,Environmental Science,Research Methodology,Scientific Publishing',
    publications: 'My research contributions span various domains of biological sciences, with publications in peer-reviewed journals and active participation in scientific conferences and symposiums.',
    contactEmail: '[your-email]@university.edu',
    contactPhone: '+1 (555) 123-4567',
    contactLocation: 'Southwest University of Science and Technology',
    blogPurpose: 'This blog serves as a platform to share scientific insights, research findings, and thoughts on the latest developments in biological sciences. Whether you\'re a fellow researcher, student, or science enthusiast, I hope you find the content both informative and inspiring.'
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-primary/20">
          <Image
            src={adminUser?.image || data.profileImage || '/images/profile.svg'}
            alt="Professor Profile"
            fill
            className="object-cover"
            priority
          />
        </div>
        <h1 className="text-4xl font-bold mb-4">{adminUser?.name || data.name}</h1>
        {!aboutPage && (
          <div className="bg-muted/50 rounded-lg p-4 mb-4 text-sm text-muted-foreground">
            💡 <strong>Admin:</strong> Go to <a href="/admin/about" className="underline">Admin → About</a> to customize this page
          </div>
        )}
        <p className="text-xl text-muted-foreground mb-4">
          {data.title}
        </p>
        <p className="text-lg text-muted-foreground">
          {data.contactLocation}
        </p>
      </div>

      {/* Introduction */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            About Me
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {((adminUser?.bio || data.aboutMe) || '').split('\n').map((paragraph, index) => (
             <p key={index} className={index === 0 ? "text-lg leading-relaxed" : "leading-relaxed"}>
               {paragraph}
             </p>
           ))}
        </CardContent>
      </Card>

      {/* Education & Experience */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(data.education || '').split('\n\n').map((section, index) => (
              <div key={index}>
                {index > 0 && <Separator />}
                {section.split('\n').map((line, lineIndex) => (
                  lineIndex === 0 ? (
                    <h3 key={lineIndex} className="font-semibold">{line}</h3>
                  ) : (
                    <p key={lineIndex} className="text-muted-foreground">{line}</p>
                  )
                ))}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(data.experience || '').split('\n\n').map((section, index) => (
              <div key={index}>
                {index > 0 && <Separator />}
                {section.split('\n').map((line, lineIndex) => (
                  lineIndex === 0 ? (
                    <h3 key={lineIndex} className="font-semibold">{line}</h3>
                  ) : lineIndex === section.split('\n').length - 1 ? (
                    <p key={lineIndex} className="text-sm text-muted-foreground">{line}</p>
                  ) : (
                    <p key={lineIndex} className="text-muted-foreground">{line}</p>
                  )
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Research Interests */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Research Interests</CardTitle>
          <CardDescription>
            My research focuses on various aspects of biological sciences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(data.researchInterests || '').split(',').map((interest, index) => (
              <Badge key={index} variant="secondary">{interest.trim()}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Publications & Achievements */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Publications & Achievements</CardTitle>
          <CardDescription>
            Contributing to the advancement of biological sciences through research and publication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">8+</div>
              <div className="text-sm text-muted-foreground">Years of Research</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">Multiple</div>
              <div className="text-sm text-muted-foreground">Published Papers</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">Active</div>
              <div className="text-sm text-muted-foreground">Research Projects</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            {data.publications}
          </p>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Get in Touch</CardTitle>
          <CardDescription>
            Feel free to reach out for academic collaboration or scientific discussions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{data.contactLocation}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{data.contactEmail}</span>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span>Research Profile & Publications</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blog Purpose */}
      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-4">About This Blog</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {data.blogPurpose}
        </p>
      </div>


    </div>
  )
}