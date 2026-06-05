const prisma = require('./prisma');
const bcrypt = require('bcryptjs');

async function main() {
  // Admin user
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
    console.log('Admin creado: admin@mascolandia.com / admin123');
  } else {
    console.log('Admin ya existe.');
  }

  // Recepcionista user
  const existingRecep = await prisma.user.findUnique({ where: { email: 'recepcion@mascolandia.com' } });
  if (!existingRecep) {
    const hashedPassword = await bcrypt.hash('recepcion123', 10);
    await prisma.user.create({
      data: {
        email: 'recepcion@mascolandia.com',
        password: hashedPassword,
        name: 'Recepcionista Mascolandia',
        role: 'RECEPCIONISTA',
      },
    });
    console.log('Recepcionista creada: recepcion@mascolandia.com / recepcion123');
  }

  // Cajera user
  const existingCajera = await prisma.user.findUnique({ where: { email: 'cajera@mascolandia.com' } });
  if (!existingCajera) {
    const hashedPassword = await bcrypt.hash('cajera123', 10);
    await prisma.user.create({
      data: {
        email: 'cajera@mascolandia.com',
        password: hashedPassword,
        name: 'Cajera Mascolandia',
        role: 'CAJERA',
      },
    });
    console.log('Cajera creada: cajera@mascolandia.com / cajera123');
  }

  // Migrar usuarios ASISTENTE existentes a RECEPCIONISTA
  const migrated = await prisma.user.updateMany({
    where: { role: 'ASISTENTE' },
    data: { role: 'RECEPCIONISTA' },
  });
  if (migrated.count > 0) {
    console.log(`${migrated.count} usuario(s) ASISTENTE migrado(s) a RECEPCIONISTA`);
  }

  // Inicializar contadores
  const counters = ['patient', 'consultation'];
  for (const name of counters) {
    const existing = await prisma.counter.findUnique({ where: { name } });
    if (!existing) {
      const count = name === 'patient'
        ? await prisma.patient.count()
        : await prisma.consultation.count();
      await prisma.counter.create({ data: { name, value: count } });
      console.log(`Contador "${name}" inicializado en ${count}`);
    }
  }

  // Clinic settings
  const settings = await prisma.clinicSettings.findFirst();
  if (!settings) {
    await prisma.clinicSettings.create({
      data: {
        name: 'Mascolandia — Consultorio Veterinario',
        address: 'Calle Principal 123',
        phone: '555-0123',
      },
    });
    console.log('Configuracion de clinica creada.');
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
