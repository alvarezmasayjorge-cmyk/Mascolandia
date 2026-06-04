const { Router } = require('express');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const { createConsultationSchema, evolutionSchema } = require('../validators/consultation.schema');
const consultationsService = require('../services/consultations.service');
const { ok, created } = require('../utils/response');
const { z } = require('zod');

const router = Router();

router.post('/', authenticate, validate({ body: createConsultationSchema }), async (req, res, next) => {
  try {
    const consultation = await consultationsService.create(req.body, req.user);
    created(res, consultation);
  } catch (err) { next(err); }
});

const consultationParams = z.object({ id: z.coerce.number().int().positive() });

router.post('/:id/evolutions', authenticate, validate({ params: consultationParams, body: evolutionSchema }), async (req, res, next) => {
  try {
    const evolution = await consultationsService.addEvolution(req.params.id, req.body.text, req.user);
    created(res, evolution);
  } catch (err) { next(err); }
});

const evolutionParams = z.object({
  id: z.coerce.number().int().positive(),
  evId: z.coerce.number().int().positive(),
});

router.put('/:id/evolutions/:evId', authenticate, validate({ params: evolutionParams, body: evolutionSchema }), async (req, res, next) => {
  try {
    const evolution = await consultationsService.updateEvolution(req.params.id, req.params.evId, req.body.text, req.user);
    ok(res, evolution);
  } catch (err) { next(err); }
});

module.exports = router;
