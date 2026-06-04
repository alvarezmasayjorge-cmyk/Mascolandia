const prisma = require('../prisma');

async function get() {
  let settings = await prisma.clinicSettings.findFirst();
  if (!settings) {
    settings = await prisma.clinicSettings.create({ data: {} });
  }
  return settings;
}

async function update(data) {
  let settings = await prisma.clinicSettings.findFirst();
  if (!settings) {
    return prisma.clinicSettings.create({ data });
  }
  return prisma.clinicSettings.update({ where: { id: settings.id }, data });
}

module.exports = { get, update };
