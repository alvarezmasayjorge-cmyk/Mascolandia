const prisma = require('../prisma');
const { BusinessError, NotFoundError } = require('../utils/errors');

async function list() {
  return prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } });
}

async function create(data) {
  return prisma.inventoryItem.create({ data });
}

async function update(id, data) {
  const item = await prisma.inventoryItem.findUnique({ where: { id } });
  if (!item) throw new NotFoundError('Producto');

  return prisma.inventoryItem.update({ where: { id }, data });
}

async function remove(id) {
  const item = await prisma.inventoryItem.findUnique({ where: { id } });
  if (!item) throw new NotFoundError('Producto');

  return prisma.inventoryItem.delete({ where: { id } });
}

async function registerMovement(itemId, payload, user) {
  const { type, quantity, registerExpense, cost } = payload;

  return prisma.$transaction(async (tx) => {
    const item = await tx.inventoryItem.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundError('Producto');

    if (type === 'SALIDA' && item.stock < quantity) {
      throw new BusinessError(
        `Stock insuficiente de "${item.name}". Disponible: ${item.stock} ${item.unit}`
      );
    }

    const stockChange = type === 'ENTRADA' ? { increment: quantity } : { decrement: quantity };

    await tx.inventoryItem.update({
      where: { id: itemId },
      data: { stock: stockChange },
    });

    const movement = await tx.inventoryMovement.create({
      data: {
        itemId,
        type,
        quantity,
        userId: user.id,
      },
    });

    // Registrar gasto en caja si es entrada con gasto
    if (type === 'ENTRADA' && registerExpense && cost > 0) {
      await tx.cashTransaction.create({
        data: {
          description: `Compra: ${item.name} x${quantity} ${item.unit}`,
          amount: Number(cost),
          category: 'Compra',
          type: 'EGRESO',
        },
      });
    }

    return movement;
  });
}

module.exports = { list, create, update, remove, registerMovement };
