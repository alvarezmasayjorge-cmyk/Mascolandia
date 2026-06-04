const { Router } = require('express');

const router = Router();

router.use('/auth', require('./auth.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/patients', require('./patients.routes'));
router.use('/consultations', require('./consultations.routes'));
router.use('/inventory', require('./inventory.routes'));
router.use('/appointments', require('./appointments.routes'));
router.use('/cashflow', require('./cashflow.routes'));
router.use('/settings', require('./settings.routes'));
router.use('/users', require('./users.routes'));

router.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

module.exports = router;
