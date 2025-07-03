const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function checkAndCreateAdmin() {
  try {
    // Check if there are any admin users
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      }
    })

    console.log(`Found ${adminUsers.length} admin users:`);
    adminUsers.forEach(user => {
      console.log(`- ${user.email} (${user.name || 'No name'})`);
    });

    if (adminUsers.length === 0) {
      console.log('\nNo admin users found. Creating default admin user...');
      
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          name: 'Admin User',
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: new Date()
        }
      });
      
      console.log('Admin user created successfully!');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      console.log('Please change the password after first login.');
    }

    // Check categories
    const categories = await prisma.category.findMany();
    console.log(`\nFound ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.slug})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateAdmin();