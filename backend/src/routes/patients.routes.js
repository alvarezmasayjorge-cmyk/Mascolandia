const { Router } = require('express');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const { createPatientSchema, patientQuerySchema, patientParamsSchema } = require('../validators/patient.schema');
const patientsService = require('../services/patients.service');
const { ok, created } = require('../utils/response');

const router = Router();

router.get('/', authenticate, validate({ query: patientQuerySchema }), async (req, res, next) => {
  try {
    const patients = await patientsService.list(req.query);
    ok(res, patients);
  } catch (err) { next(err); }
});

router.get('/:id', authenticate, validate({ params: patientParamsSchema }), async (req, res, next) => {
  try {
    const patient = await patientsService.getById(req.params.id);
    ok(res, patient);
  } catch (err) { next(err); }
});

router.post('/', authenticate, validate({ body: createPatientSchema }), async (req, res, next) => {
  try {
    const patient = await patientsService.create(req.body);
    created(res, patient);
  } catch (err) { next(err); }
});

router.post('/:id/vaccinations', authenticate, validate({ params: patientParamsSchema }), async (req, res, next) => {
  try {
    const vaccination = await patientsService.addVaccination(req.params.id, req.body);
    created(res, vaccination);
  } catch (err) { next(err); }
});

router.post('/:id/dewormings', authenticate, validate({ params: patientParamsSchema }), async (req, res, next) => {
  try {
    const deworming = await patientsService.addDeworming(req.params.id, req.body);
    created(res, deworming);
  } catch (err) { next(err); }
});

module.exports = router;
