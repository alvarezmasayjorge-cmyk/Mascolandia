const { Router } = require('express');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const { createInventoryItemSchema, updateInventoryItemSchema, inventoryMovementSchema } = require('../validators/inventory.schema');
const inventoryService = require('../services/inventory.service');
const { ok, created } = require('../utils/response');
const { z } = require('zod');

const router = Router();
const idParams = z.object({ id: z.coerce.number().int().positive() });

router.get('/', authenticate, async (req, res, next) => {
  try {
    const items = await inventoryService.list();
    ok(res, items);
  } catch (err) { next(err); }
});

router.post('/', authenticate, validate({ body: createInventoryItemSchema }), async (req, res, next) => {
  try {
    const item = await inventoryService.create(req.body);
    created(res, item);
  } catch (err) { next(err); }
});

router.put('/:id', authenticate, validate({ params: idParams, body: updateInventoryItemSchema }), async (req, res, next) => {
  try {
    const item = await inventoryService.update(req.params.id, req.body);
    ok(res, item);
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, validate({ params: idParams }), async (req, res, next) => {
  try {
    await inventoryService.remove(req.params.id);
    ok(res, { message: 'Producto eliminado' });
  } catch (err) { next(err); }
});

router.post('/:id/movements', authenticate, validate({ params: idParams, body: inventoryMovementSchema }), async (req, res, next) => {
  try {
    const movement = await inventoryService.registerMovement(req.params.id, req.body, req.user);
    created(res, movement);
  } catch (err) { next(err); }
});

module.exports = router;
