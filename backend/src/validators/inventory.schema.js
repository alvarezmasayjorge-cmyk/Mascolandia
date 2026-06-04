const { z } = require('zod');

const createInventoryItemSchema = z.object({
  name: z.string().min(1, '¿Cómo se llama el producto?'),
  category: z.string().min(1, 'Selecciona una categoría'),
  stock: z.number().min(0, 'El stock no puede ser negativo'),
  unit: z.string().min(1, '¿Cuál es la unidad de medida?'),
  expiryDate: z.string().datetime().nullable().optional(),
  costPrice: z.number().min(0).nullable().optional(),
  sellingPrice: z.number().min(0).nullable().optional(),
  supplier: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const updateInventoryItemSchema = createInventoryItemSchema.partial();

const inventoryMovementSchema = z.object({
  type: z.enum(['ENTRADA', 'SALIDA'], {
    errorMap: () => ({ message: 'Tipo debe ser ENTRADA o SALIDA' }),
  }),
  quantity: z.number().positive('La cantidad debe ser mayor a 0'),
  registerExpense: z.boolean().optional().default(false),
  cost: z.number().min(0).optional(),
});

module.exports = { createInventoryItemSchema, updateInventoryItemSchema, inventoryMovementSchema };
