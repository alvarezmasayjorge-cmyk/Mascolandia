async function nextNumber(tx, name) {
  const existing = await tx.counter.findUnique({ where: { name } });

  if (!existing) {
    await tx.counter.create({ data: { name, value: 1 } });
    return '000001';
  }

  const updated = await tx.counter.update({
    where: { name },
    data: { value: { increment: 1 } },
  });

  return String(updated.value).padStart(6, '0');
}

module.exports = { nextNumber };
