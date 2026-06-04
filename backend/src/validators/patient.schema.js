const { z } = require('zod');

const createPatientSchema = z.object({
  ownerName: z.string().min(1, '¿Cómo se llama el propietario?'),
  ownerAddress: z.string().min(1, '¿Cuál es el domicilio del propietario?'),
  ownerPhone: z.string().min(1, '¿Cuál es el teléfono del propietario?'),
  name: z.string().min(1, '¿Cómo se llama la mascota?'),
  species: z.enum(['CANINO', 'FELINO', 'OTRO'], {
    errorMap: () => ({ message: 'Selecciona la especie' }),
  }),
  breed: z.string().nullable().optional(),
  age: z.string().nullable().optional(),
  weight: z.number().positive('El peso debe ser mayor a 0').nullable().optional(),
  gender: z.enum(['MACHO', 'HEMBRA']).nullable().optional(),
  color: z.string().nullable().optional(),
});

const patientQuerySchema = z.object({
  search: z.string().optional(),
  species: z.string().optional(),
});

const patientParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

module.exports = { createPatientSchema, patientQuerySchema, patientParamsSchema };
