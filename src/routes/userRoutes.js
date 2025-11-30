import express from 'express';
import passport from 'passport';
import {
  register,
  login,
  getMe,
  promoteToAdmin,
  getAllUsers,
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

// Get all users (admin only)
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  requireAdmin,
  getAllUsers
);

export default router;