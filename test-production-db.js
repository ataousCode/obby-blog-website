// Test production database connection
const { PrismaClient } = require('@prisma/client')

// Set production environment variables manually
process.env.DATABASE_URL = "mongodb+srv://almousleckdeveloper:MUESI2Ee90d9kYMt@obby-blog.d4gutm5.mongodb.net/obby_web?retryWrites=true&w=majority&appName=obby-blog"

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function testProductionDatabase() {
  try {
    console.log('🔍 Testing production database connection...')
    console.log('Database URL:', process.env.DATABASE_URL?.substring(0, 50) + '...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Test posts query (same as homepage)
    console.log('\n📝 Testing posts query...')
    const posts = await prisma.post.findMany({
      where: {
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
            name: true
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
    
    console.log(`Found ${posts.length} published posts`)
    posts.forEach((post, index) => {
      console.log(`${index + 1}. "${post.title}" - Published: ${post.publishedAt}`);
    })
    
    // Test categories query (same as homepage)
    console.log('\n📂 Testing categories query...')
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
    
    console.log(`Found ${categories.length} categories`)
    categories.forEach((category, index) => {
      console.log(`${index + 1}. "${category.name}" - ${category._count.posts} published posts`);
    })
    
    console.log('\n✅ All queries successful! Data should appear on the website.')
    
  } catch (error) {
    console.error('❌ Error testing production database:', error)
    console.error('Stack trace:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testProductionDatabase()