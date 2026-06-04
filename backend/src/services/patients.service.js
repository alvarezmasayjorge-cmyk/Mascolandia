const prisma = require('../prisma');
const { nextNumber } = require('../utils/sequences');
const { NotFoundError } = require('../utils/errors');

async function list({ search, species }) {
  const where = {};
  if (species) where.species = species;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { ownerName: { contains: search } },
      { recordNumber: { contains: search } },
    ];
  }
  return prisma.patient.findMany({ where, orderBy: { updatedAt: 'desc' } });
}

async function getById(id) {
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      consultations: {
        orderBy: { date: 'desc' },
        include: {
          vet: { select: { id: true, name: true } },
          evolutions: {
            orderBy: { date: 'desc' },
            include: { user: { select: { id: true, name: true } } },
          },
        },
      },
      vaccinations: { orderBy: { date: 'desc' } },
      dewormings: { orderBy: { date: 'desc' } },
      appointments: {
        orderBy: { date: 'desc' },
        take: 10,
      },
    },
  });

  if (!patient) throw new NotFoundError('Paciente');
  return patient;
}

async function create(data) {
  return prisma.$transaction(async (tx) => {
    const recordNumber = await nextNumber(tx, 'patient');
    return tx.patient.create({ data: { ...data, recordNumber } });
  });
}

async function addVaccination(patientId, { type, date }) {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new NotFoundError('Paciente');

  return prisma.vaccination.create({
    data: { patientId, type, date: new Date(date) },
  });
}

async function addDeworming(patientId, { date }) {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new NotFoundError('Paciente');

  return prisma.deworming.create({
    data: { patientId, date: new Date(date) },
  });
}

module.exports = { list, getById, create, addVaccination, addDeworming };
