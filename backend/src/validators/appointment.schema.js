const { z } = require('zod');

const createAppointmentSchema = z.object({
  patientId: z.number().int().positive().nullable().optional(),
  vetId: z.number().int().positive().nullable().optional(),
  date: z.string().min(1, '¿Cuándo es la cita?'),
  reason: z.string().min(1, '¿Cuál es el motivo de la cita?'),
  status: z.enum(['PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA', 'ASISTIO', 'NO_ASISTIO', 'REAGENDADA']).optional().default('PENDIENTE'),
});

const updateAppointmentSchema = createAppointmentSchema.partial();

module.exports = { createAppointmentSchema, updateAppointmentSchema };
