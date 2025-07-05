const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('🔍 Checking database contents...')
    
    // Check posts
    const allPosts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
        authorId: true,
        categoryId: true
      }
    })
    
    console.log(`\n📝 Total posts in database: ${allPosts.length}`)
    
    if (allPosts.length > 0) {
      console.log('\nPosts details:')
      allPosts.forEach((post, index) => {
        console.log(`${index + 1}. "${post.title}"`);
        console.log(`   - Slug: ${post.slug}`);
        console.log(`   - Published: ${post.publishedAt ? 'Yes ✅' : 'No ❌ (Draft)'}`);
        console.log(`   - Author ID: ${post.authorId}`);
        console.log(`   - Category ID: ${post.categoryId || 'None'}`);
        console.log('');
      })
    }
    
    // Check published posts specifically
    const publishedPosts = await prisma.post.findMany({
      where: {
        publishedAt: { not: null }
      },
      select: {
        id: true,
        title: true,
        publishedAt: true
      }
    })
    
    console.log(`\n✅ Published posts: ${publishedPosts.length}`)
    
    // Check categories
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            posts: true
          }
        }
      }
    })
    
    console.log(`\n📂 Total categories: ${categories.length}`)
    
    if (categories.length > 0) {
      console.log('\nCategories details:')
      categories.forEach((category, index) => {
        console.log(`${index + 1}. "${category.name}" (${category._count.posts} posts)`);
      })
    }
    
    // Check users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })
    
    console.log(`\n👥 Total users: ${users.length}`)
    
    if (users.length > 0) {
      console.log('\nUsers details:')
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
      })
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()