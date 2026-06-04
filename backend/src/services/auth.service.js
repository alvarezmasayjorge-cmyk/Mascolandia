const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../prisma');
const env = require('../config/env');
const { BusinessError, NotFoundError } = require('../utils/errors');

async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    throw new BusinessError('Credenciales inválidas o usuario inactivo', 401);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new BusinessError('Credenciales inválidas', 401);
  }

  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
}

async function refresh(token) {
  const stored = await prisma.refreshToken.findUnique({ where: { token } });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new BusinessError('Refresh token inválido o expirado', 401);
  }

  const user = await prisma.user.findUnique({ where: { id: stored.userId } });
  if (!user || !user.isActive) {
    throw new BusinessError('Usuario inactivo', 401);
  }

  // Revocar viejo y crear nuevo (rotación)
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const newRefreshToken = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: newRefreshToken,
      expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('Usuario');

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw new BusinessError('Contraseña actual incorrecta', 401);

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });
}

module.exports = { login, refresh, changePassword };
