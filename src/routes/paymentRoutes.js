import express from 'express';
import { createCheckoutSession } from '../controllers/paymentController.js';

const router = express.Router();

// Public endpoint to create a Stripe Checkout session
router.post('/checkout-session', createCheckoutSession);

export default router;


