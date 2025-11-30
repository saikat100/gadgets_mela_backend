import express from 'express';
import passport from 'passport';
import {
    createReview,
    getProductReviews,
    addReply,
    updateReview,
    deleteReview
} from '../controllers/reviewController.js';

const router = express.Router();

// Create a review (protected - user must be logged in)
router.post('/', passport.authenticate('jwt', { session: false }), createReview);

// Get all reviews for a product (public)
router.get('/product/:productId', getProductReviews);

// Add a reply to a review (protected - user or admin)
router.post('/:reviewId/reply', passport.authenticate('jwt', { session: false }), addReply);

// Update a review (protected - user can only update own review)
router.put('/:reviewId', passport.authenticate('jwt', { session: false }), updateReview);

// Delete a review (protected - user can delete own, admin can delete any)
router.delete('/:reviewId', passport.authenticate('jwt', { session: false }), deleteReview);

export default router;
