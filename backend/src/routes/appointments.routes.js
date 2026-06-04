const { Router } = require('express');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const { createAppointmentSchema, updateAppointmentSchema } = require('../validators/appointment.schema');
const appointmentsService = require('../services/appointments.service');
const { ok, created } = require('../utils/response');
const { z } = require('zod');

const router = Router();
const idParams = z.object({ id: z.coerce.number().int().positive() });

router.get('/', authenticate, async (req, res, next) => {
  try {
    const appointments = await appointmentsService.list(req.query);
    ok(res, appointments);
  } catch (err) { next(err); }
});

router.post('/', authenticate, validate({ body: createAppointmentSchema }), async (req, res, next) => {
  try {
    const appointment = await appointmentsService.create(req.body);
    created(res, appointment);
  } catch (err) { next(err); }
});

router.put('/:id', authenticate, validate({ params: idParams, body: updateAppointmentSchema }), async (req, res, next) => {
  try {
    const appointment = await appointmentsService.update(req.params.id, req.body);
    ok(res, appointment);
  } catch (err) { next(err); }
});

module.exports = router;
