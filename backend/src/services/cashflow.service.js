const prisma = require('../prisma');

async function list({ startDate, endDate, type, category }) {
  const where = {};
  if (startDate && endDate) {
    where.date = { gte: new Date(startDate), lte: new Date(endDate) };
  }
  if (type) where.type = type;
  if (category) where.category = category;

  return prisma.cashTransaction.findMany({
    where,
    orderBy: { date: 'desc' },
  });
}

async function create(data) {
  return prisma.cashTransaction.create({ data });
}

async function getSummary({ startDate, endDate }) {
  const where = {};
  if (startDate && endDate) {
    where.date = { gte: new Date(startDate), lte: new Date(endDate) };
  }

  const txs = await prisma.cashTransaction.findMany({ where });
  const income = txs.filter(t => t.type === 'INGRESO').reduce((acc, t) => acc + t.amount, 0);
  const expense = txs.filter(t => t.type === 'EGRESO').reduce((acc, t) => acc + t.amount, 0);

  return { income, expense, balance: income - expense };
}

async function update(id, data) {
  return prisma.cashTransaction.update({ where: { id: Number(id) }, data });
}

async function remove(id) {
  return prisma.cashTransaction.delete({ where: { id: Number(id) } });
}

module.exports = { list, create, update, remove, getSummary };
