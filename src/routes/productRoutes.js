import express from 'express';
import passport from 'passport';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { requireAdmin } from '../middlewares/requireAdmin.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', passport.authenticate('jwt', { session: false }), requireAdmin, createProduct);
router.put('/:id', passport.authenticate('jwt', { session: false }), requireAdmin, updateProduct);
router.delete('/:id', passport.authenticate('jwt', { session: false }), requireAdmin, deleteProduct);

export default router;