const prisma = require('../prisma');

async function getDashboard(user) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const appointmentsToday = await prisma.appointment.findMany({
    where: { date: { gte: today, lte: endOfDay } },
    include: { patient: true },
    orderBy: { date: 'asc' },
  });

  const recentConsultations = await prisma.consultation.findMany({
    take: 5,
    orderBy: { date: 'desc' },
    include: { patient: true, vet: { select: { name: true } } },
  });

  let cashFlow = null;
  if (user.role === 'ADMIN') {
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const txs = await prisma.cashTransaction.findMany({
      where: { date: { gte: firstDayOfMonth } },
    });
    cashFlow = {
      income: txs.filter(t => t.type === 'INGRESO').reduce((acc, t) => acc + t.amount, 0),
      expense: txs.filter(t => t.type === 'EGRESO').reduce((acc, t) => acc + t.amount, 0),
    };
  }

  return { appointmentsToday, recentConsultations, cashFlow };
}

async function getAlerts() {
  const now = new Date();
  const in30Days = new Date();
  in30Days.setDate(in30Days.getDate() + 30);

  const lowStock = await prisma.inventoryItem.findMany({
    where: { stock: { lte: 5, gt: 0 } },
    orderBy: { stock: 'asc' },
  });

  const outOfStock = await prisma.inventoryItem.findMany({
    where: { stock: { lte: 0 } },
    orderBy: { name: 'asc' },
  });

  const expiring = await prisma.inventoryItem.findMany({
    where: { expiryDate: { gte: now, lte: in30Days }, stock: { gt: 0 } },
    orderBy: { expiryDate: 'asc' },
  });

  const expired = await prisma.inventoryItem.findMany({
    where: { expiryDate: { lt: now }, stock: { gt: 0 } },
    orderBy: { expiryDate: 'asc' },
  });

  return { lowStock, outOfStock, expiring, expired };
}

module.exports = { getDashboard, getAlerts };
