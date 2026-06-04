const { Router } = require('express');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const settingsService = require('../services/settings.service');
const { ok } = require('../utils/response');

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const settings = await settingsService.get();
    ok(res, settings);
  } catch (err) { next(err); }
});

router.put('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const settings = await settingsService.update(req.body);
    ok(res, settings);
  } catch (err) { next(err); }
});

module.exports = router;
