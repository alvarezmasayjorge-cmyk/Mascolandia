const { Router } = require('express');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const usersService = require('../services/users.service');
const { ok, created } = require('../utils/response');

const router = Router();

router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const users = await usersService.list();
    ok(res, users);
  } catch (err) { next(err); }
});

router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const user = await usersService.create(req.body);
    created(res, user);
  } catch (err) { next(err); }
});

router.put('/:id/toggle-active', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const user = await usersService.toggleActive(parseInt(req.params.id));
    ok(res, user);
  } catch (err) { next(err); }
});

router.put('/:id/role', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const user = await usersService.updateRole(parseInt(req.params.id), req.body.role);
    ok(res, user);
  } catch (err) { next(err); }
});

module.exports = router;
