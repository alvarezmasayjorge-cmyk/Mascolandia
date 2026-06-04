const { z } = require('zod');

const itemUsedSchema = z.object({
  id: z.number().int().positive('Selecciona un medicamento válido'),
  quantity: z.number().positive('La cantidad debe ser mayor a 0'),
});

const createConsultationSchema = z.object({
  patientId: z.number().int().positive('Selecciona un paciente'),
  reason: z.string().min(1, '¿Cuál es el motivo de la consulta?'),
  prevDiseases: z.string().nullable().optional(),
  prevInterventions: z.string().nullable().optional(),
  generalState: z.string().nullable().optional(),
  mucosa: z.string().nullable().optional(),
  appetite: z.string().nullable().optional(),
  hydration: z.string().nullable().optional(),
  temperature: z.number().nullable().optional(),
  respirationType: z.string().nullable().optional(),
  respRate: z.number().int().nullable().optional(),
  heartRate: z.number().int().nullable().optional(),
  digestiveSystem: z.string().nullable().optional(),
  genitourinarySystem: z.string().nullable().optional(),
  requestedExams: z.string().nullable().optional(),
  diagnosis: z.string().nullable().optional(),
  prognosis: z.string().nullable().optional(),
  treatment: z.string().nullable().optional(),
  cost: z.number().min(0).optional().default(0),
  itemsUsed: z.array(itemUsedSchema).optional().default([]),
});

const evolutionSchema = z.object({
  text: z.string().min(1, 'Ingresa el texto de la evolución'),
});

module.exports = { createConsultationSchema, evolutionSchema };
