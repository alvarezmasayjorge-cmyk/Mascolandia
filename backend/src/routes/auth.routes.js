const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const { loginSchema, changePasswordSchema } = require('../validators/auth.schema');
const authService = require('../services/auth.service');
const { ok } = require('../utils/response');
const env = require('../config/env');

const router = Router();

const loginLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_ATTEMPTS,
  message: { success: false, message: 'Demasiados intentos. Intenta en unos minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, validate({ body: loginSchema }), async (req, res, next) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    ok(res, result);
  } catch (err) { next(err); }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token requerido' });
    const result = await authService.refresh(refreshToken);
    ok(res, result);
  } catch (err) { next(err); }
});

router.put('/password', authenticate, validate({ body: changePasswordSchema }), async (req, res, next) => {
  try {
    await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
    ok(res, { message: 'Contraseña actualizada' });
  } catch (err) { next(err); }
});

module.exports = router;
