import express from 'express';
import passport from 'passport';
import { requireAdmin } from '../middlewares/requireAdmin.js';
import { createOrder, getMyOrders, getAllOrders, getMyOrderById, cancelMyOrder } from '../controllers/orderController.js';

const router = express.Router();

// Place a new order (login required)
router.post('/', passport.authenticate('jwt', { session: false }), createOrder);

// All of a user's orders (login required)
router.get('/mine', passport.authenticate('jwt', { session: false }), getMyOrders);

// Single order (login required)
router.get('/:id', passport.authenticate('jwt', { session: false }), getMyOrderById);

// Cancel my pending order (login required)
router.post('/:id/cancel', passport.authenticate('jwt', { session: false }), cancelMyOrder);

// List all orders (admin only)
router.get('/', passport.authenticate('jwt', { session: false }), requireAdmin, getAllOrders);

export default router;