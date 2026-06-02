const prisma = require('./prisma');
const bcrypt = require('bcryptjs');

async function main() {
  const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@mascolandia.com' } });
  
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: 'admin@mascolandia.com',
        password: hashedPassword,
        name: 'Admin Mascolandia',
        role: 'ADMIN',
      },
    });
    console.log('Admin user created: admin@mascolandia.com / admin123');
  } else {
    console.log('Admin user already exists.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
