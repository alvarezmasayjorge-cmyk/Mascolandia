const { Router } = require('express');
const { authenticate } = require('../middlewares/auth');
const dashboardService = require('../services/dashboard.service');
const { ok } = require('../utils/response');

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboard(req.user);
    ok(res, data);
  } catch (err) { next(err); }
});

router.get('/alerts', authenticate, async (req, res, next) => {
  try {
    const alerts = await dashboardService.getAlerts();
    ok(res, alerts);
  } catch (err) { next(err); }
});

module.exports = router;
