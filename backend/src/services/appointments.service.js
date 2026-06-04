const prisma = require('../prisma');
const { BusinessError, NotFoundError } = require('../utils/errors');

async function list({ start, end }) {
  const where = {};
  if (start && end) {
    where.date = { gte: new Date(start), lte: new Date(end) };
  }
  return prisma.appointment.findMany({
    where,
    include: { patient: true, vet: { select: { id: true, name: true } } },
    orderBy: { date: 'asc' },
  });
}

async function create(data) {
  // Validar conflictos de horario (±30 min)
  if (data.vetId) {
    const appointmentDate = new Date(data.date);
    const startWindow = new Date(appointmentDate.getTime() - 30 * 60 * 1000);
    const endWindow = new Date(appointmentDate.getTime() + 30 * 60 * 1000);

    const conflict = await prisma.appointment.findFirst({
      where: {
        vetId: data.vetId,
        status: { notIn: ['CANCELADA', 'REAGENDADA', 'NO_ASISTIO'] },
        date: { gte: startWindow, lte: endWindow },
      },
    });

    if (conflict) {
      throw new BusinessError('El veterinario ya tiene una cita en ese horario');
    }
  }

  return prisma.appointment.create({
    data: {
      ...data,
      date: new Date(data.date),
    },
    include: { patient: true },
  });
}

async function update(id, data) {
  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Cita');

  // Validar conflictos si cambia fecha o vet
  const vetId = data.vetId ?? existing.vetId;
  const date = data.date ? new Date(data.date) : existing.date;

  if (vetId && (data.vetId || data.date)) {
    const startWindow = new Date(date.getTime() - 30 * 60 * 1000);
    const endWindow = new Date(date.getTime() + 30 * 60 * 1000);

    const conflict = await prisma.appointment.findFirst({
      where: {
        id: { not: id },
        vetId,
        status: { notIn: ['CANCELADA', 'REAGENDADA', 'NO_ASISTIO'] },
        date: { gte: startWindow, lte: endWindow },
      },
    });

    if (conflict) {
      throw new BusinessError('El veterinario ya tiene una cita en ese horario');
    }
  }

  return prisma.appointment.update({
    where: { id },
    data: {
      ...data,
      ...(data.date ? { date: new Date(data.date) } : {}),
    },
    include: { patient: true },
  });
}

module.exports = { list, create, update };
