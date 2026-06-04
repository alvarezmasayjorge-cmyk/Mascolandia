const prisma = require('../prisma');
const { nextNumber } = require('../utils/sequences');
const { BusinessError, NotFoundError, ForbiddenError } = require('../utils/errors');

async function create(payload, user) {
  const { itemsUsed, cost, ...consultationData } = payload;

  return prisma.$transaction(async (tx) => {
    // Validar stock disponible antes de tocar nada
    if (itemsUsed && itemsUsed.length > 0) {
      const items = await tx.inventoryItem.findMany({
        where: { id: { in: itemsUsed.map(i => i.id) } },
      });

      for (const used of itemsUsed) {
        const item = items.find(i => i.id === used.id);
        if (!item) {
          throw new BusinessError(`Medicamento con ID ${used.id} no encontrado`);
        }
        if (item.stock < used.quantity) {
          throw new BusinessError(
            `Stock insuficiente de "${item.name}". Disponible: ${item.stock} ${item.unit}`
          );
        }
      }
    }

    const number = await nextNumber(tx, 'consultation');

    const consultation = await tx.consultation.create({
      data: {
        ...consultationData,
        number,
        vetId: user.id,
        status: 'COMPLETADA',
      },
    });

    // Descontar inventario y registrar movimientos
    if (itemsUsed && itemsUsed.length > 0) {
      for (const used of itemsUsed) {
        await tx.inventoryItem.update({
          where: { id: used.id },
          data: { stock: { decrement: used.quantity } },
        });
        await tx.inventoryMovement.create({
          data: {
            itemId: used.id,
            type: 'USO',
            quantity: used.quantity,
            userId: user.id,
            consultationId: consultation.id,
          },
        });
      }
    }

    // Registrar ingreso en caja
    if (cost > 0) {
      const patient = await tx.patient.findUnique({
        where: { id: consultationData.patientId },
        select: { name: true },
      });

      await tx.cashTransaction.create({
        data: {
          description: `Consulta #${number} — ${patient?.name || 'Paciente'}`,
          amount: Number(cost),
          category: 'Consulta',
          type: 'INGRESO',
        },
      });
    }

    return consultation;
  });
}

async function addEvolution(consultationId, text, user) {
  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
  });
  if (!consultation) throw new NotFoundError('Consulta');

  return prisma.evolution.create({
    data: {
      consultationId,
      userId: user.id,
      text,
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  });
}

async function updateEvolution(consultationId, evolutionId, text, user) {
  const evolution = await prisma.evolution.findFirst({
    where: { id: evolutionId, consultationId },
  });

  if (!evolution) throw new NotFoundError('Evolución');

  if (evolution.userId !== user.id && user.role !== 'ADMIN') {
    throw new ForbiddenError('Solo puedes editar tus propias evoluciones');
  }

  return prisma.evolution.update({
    where: { id: evolutionId },
    data: { text },
    include: {
      user: { select: { id: true, name: true } },
    },
  });
}

module.exports = { create, addEvolution, updateEvolution };
