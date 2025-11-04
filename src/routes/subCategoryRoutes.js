import express from 'express';
import passport from 'passport';
import { requireAdmin } from '../middlewares/requireAdmin.js';
import {
  listSubCategories,
  createSubCategory,
  deleteSubCategory,
} from '../controllers/subCategoryController.js';

const router = express.Router();

router.get('/', listSubCategories);
router.post('/', passport.authenticate('jwt', { session: false }), requireAdmin, createSubCategory);
router.delete('/:id', passport.authenticate('jwt', { session: false }), requireAdmin, deleteSubCategory);

export default router;


