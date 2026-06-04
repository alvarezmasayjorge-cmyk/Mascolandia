const { Router } = require('express');
const validate = require('../middlewares/validate');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const { createTransactionSchema, updateTransactionSchema } = require('../validators/cashflow.schema');
const cashflowService = require('../services/cashflow.service');
const { ok, created } = require('../utils/response');
const { z } = require('zod');

const router = Router();
const idParams = z.object({ id: z.coerce.number().int().positive() });

router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const transactions = await cashflowService.list(req.query);
    ok(res, transactions);
  } catch (err) { next(err); }
});

router.post('/', authenticate, requireAdmin, validate({ body: createTransactionSchema }), async (req, res, next) => {
  try {
    const tx = await cashflowService.create(req.body);
    created(res, tx);
  } catch (err) { next(err); }
});

router.put('/:id', authenticate, requireAdmin, validate({ params: idParams, body: updateTransactionSchema }), async (req, res, next) => {
  try {
    const tx = await cashflowService.update(req.params.id, req.body);
    ok(res, tx);
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, requireAdmin, validate({ params: idParams }), async (req, res, next) => {
  try {
    await cashflowService.remove(req.params.id);
    ok(res, { message: 'Transacción eliminada' });
  } catch (err) { next(err); }
});

router.get('/summary', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const summary = await cashflowService.getSummary(req.query);
    ok(res, summary);
  } catch (err) { next(err); }
});

module.exports = router;
