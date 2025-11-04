import express from 'express';
import passport from 'passport';
import { requireAdmin } from '../middlewares/requireAdmin.js';
import {
  listCategories,
  createCategory,
  deleteCategory,
} from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', listCategories);
router.post('/', passport.authenticate('jwt', { session: false }), requireAdmin, createCategory);
router.delete('/:id', passport.authenticate('jwt', { session: false }), requireAdmin, deleteCategory);

export default router;


