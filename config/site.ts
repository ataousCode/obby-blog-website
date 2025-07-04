export const siteConfig = {
  name: "My Blog",
  description: "A modern blog platform built with Next.js, featuring user authentication, content management, and a beautiful responsive design.",
  url: "https://my-blog.vercel.app",
  ogImage: "https://my-blog.vercel.app/og.jpg",
  links: {
    twitter: "https://twitter.com/almousleck",
    github: "https://github.com/ataousCode/obby-blog-website",
    linkedin: "https://linkedin.com/in/almousleck",
    email: "mailto:tadalatestudio@gmail.com"
  },
  author: {
    name: "Almousleck",
    email: "tadalatestudio@gmail.com",
    twitter: "@almousleck"
  },
  keywords: [
    "blog",
    "nextjs",
    "react",
    "typescript",
    "tailwindcss",
    "prisma",
    "postgresql",
    "nextauth",
    "content management",
    "modern web development"
  ],
  mainNav: [
    {
      title: "Articles",
      href: "/articles"
    },
    {
      title: "Categories",
      href: "/categories"
    },
    {
      title: "About",
      href: "/about"
    },
    {
      title: "Contact",
      href: "/contact"
    }
  ],
  footerNav: {
    quickLinks: [
      {
        title: "Articles",
        href: "/articles"
      },
      {
        title: "Categories",
        href: "/categories"
      },
      {
        title: "About",
        href: "/about"
      },
      {
        title: "Contact",
        href: "/contact"
      }
    ],
    resources: [
      {
        title: "Privacy Policy",
        href: "/privacy"
      },
      {
        title: "Terms of Service",
        href: "/terms"
      },
      {
        title: "RSS Feed",
        href: "/feed.xml"
      },
      {
        title: "Sitemap",
        href: "/sitemap.xml"
      }
    ]
  },
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 50
  },
  features: {
    newsletter: true,
    comments: true,
    likes: true,
    tags: true,
    search: true,
    darkMode: true,
    analytics: false,
    imageUpload: true
  }
}

export type SiteConfig = typeof siteConfig