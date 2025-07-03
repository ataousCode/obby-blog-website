# My Professional Blog Platform

A modern, full-stack blog platform built with Next.js 14, featuring user authentication, admin controls, and premium content access restrictions.

## ✨ Features

### 👨‍💻 Admin Features
- CRUD operations for articles/posts
- CRUD operations for categories
- Delete user comments
- View all registered users
- View article statistics (views, likes, comments)
- Toggle article visibility (public, draft, archived)
- Admin dashboard with analytics

### 🙋‍♂️ User Features
- Sign Up / Login with email verification
- Forgot password flow via email
- Read articles with rich content
- Comment system (logged-in users only)
- Content access control (unsubscribed users see only first paragraph)
- Full article access for subscribed users
- User profile with comment history and liked articles
- Dark/light mode toggle
- Responsive design

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 with App Router |
| **Styling** | Tailwind CSS + ShadCN UI |
| **Database** | PostgreSQL + Prisma ORM |
| **Authentication** | NextAuth.js |
| **Email** | Nodemailer |
| **Image Upload** | Cloudinary (optional) |
| **Deployment** | Vercel |
| **Language** | TypeScript |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Email service (Gmail, SendGrid, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd my-blog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/myblog?schema=public"
   
   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # Email Configuration
   EMAIL_SERVER_HOST="smtp.gmail.com"
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER="your-email@gmail.com"
   EMAIL_SERVER_PASSWORD="your-app-password"
   EMAIL_FROM="your-email@gmail.com"
   ```

4. **Set up the database**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
my-blog/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin dashboard
│   ├── articles/          # Article pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   ├── ui/               # ShadCN UI components
│   ├── navbar.tsx        # Navigation bar
│   ├── footer.tsx        # Footer
│   └── theme-provider.tsx # Theme provider
├── lib/                   # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Database connection
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema
│   └── schema.prisma     # Prisma schema
└── public/               # Static assets
```

## 🗄️ Database Schema

The application uses the following main models:

- **User**: User accounts with roles (USER, ADMIN)
- **Post**: Blog articles with categories and status
- **Category**: Article categories
- **Comment**: User comments on articles
- **Like**: User likes on articles
- **Tag**: Article tags

## 🔐 Authentication

The app supports multiple authentication methods:

- **Email Magic Links**: Passwordless authentication
- **Credentials**: Email and password
- **Email Verification**: Account verification via email

## 🎨 Styling

The application uses:

- **Tailwind CSS**: Utility-first CSS framework
- **ShadCN UI**: High-quality, accessible components
- **Dark/Light Mode**: System preference with manual toggle
- **Responsive Design**: Mobile-first approach

## 📧 Email Configuration

For email functionality, you can use:

1. **Gmail**: Use App Passwords for authentication
2. **SendGrid**: Professional email service
3. **Resend**: Modern email API (recommended)

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-production-secret"
# ... other variables
```

## 🛡️ Security Features

- Password hashing with bcryptjs
- CSRF protection via NextAuth.js
- Input validation with Zod
- SQL injection prevention with Prisma
- XSS protection with proper sanitization

## 📝 Content Management

- Rich text editor for articles
- Image upload and optimization
- SEO-friendly URLs with slugs
- Article scheduling and drafts
- Category and tag management

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push database schema
npm run db:studio    # Open Prisma Studio
npm run db:generate  # Generate Prisma client
```

### Adding New Features

1. Create database migrations with Prisma
2. Add API routes in `app/api/`
3. Create UI components in `components/`
4. Add pages in `app/`
5. Update types and utilities as needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [documentation](https://nextjs.org/docs)
2. Search existing [issues](https://github.com/your-repo/issues)
3. Create a new issue with detailed information

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [ShadCN UI](https://ui.shadcn.com/) - Beautiful components
- [Prisma](https://prisma.io/) - Next-generation ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication library