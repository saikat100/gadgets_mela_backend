import express from 'express';
import passport from 'passport';
import {
  register,
  login,
  getMe,
  promoteToAdmin,
} from '../controllers/userController.js';
import { requireAdmin } from '../middlewares/requireAdmin.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', passport.authenticate('jwt', { session: false }), getMe);
router.post(
  '/promote',
  passport.authenticate('jwt', { session: false }),
  requireAdmin,
  promoteToAdmin
);

export default router;