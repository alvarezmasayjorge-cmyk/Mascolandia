const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../prisma');
const { NotFoundError, BusinessError } = require('../utils/errors');

async function list() {
  return prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function create({ email, name, role }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new BusinessError('Ya existe un usuario con ese email');

  const tempPassword = crypto.randomBytes(4).toString('hex');
  const hashed = await bcrypt.hash(tempPassword, 10);

  const user = await prisma.user.create({
    data: { email, name, role: role || 'ASISTENTE', password: hashed },
    select: { id: true, email: true, name: true, role: true },
  });

  return { ...user, tempPassword };
}

async function toggleActive(id) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError('Usuario');

  return prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });
}

async function updateRole(id, role) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError('Usuario');

  return prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });
}

module.exports = { list, create, toggleActive, updateRole };
