const { z } = require('zod');

const createTransactionSchema = z.object({
  description: z.string().min(1, '¿Qué describe esta transacción?'),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  category: z.string().min(1, 'Selecciona una categoría'),
  type: z.enum(['INGRESO', 'EGRESO'], {
    errorMap: () => ({ message: 'Tipo debe ser INGRESO o EGRESO' }),
  }),
});

module.exports = { createTransactionSchema };
