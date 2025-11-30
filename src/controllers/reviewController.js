import Review from '../models/Review.js';
import Order from '../models/Order.js';

// Create a new review (user must have a delivered order with the product)
export const createReview = async (req, res, next) => {
    try {
        const { productId, orderId, rating, comment } = req.body;

        // Validate required fields
        if (!productId || !orderId || !rating || !comment) {
            return res.status(400).json({ message: 'Product ID, Order ID, rating, and comment are required' });
        }

        // Verify order exists and belongs to user
        const order = await Order.findOne({ _id: orderId, user: req.user._id });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'delivered') {
            return res.status(400).json({ message: 'You can only review products from delivered orders' });
        }

        const productInOrder = order.products.find(p => p.product.toString() === productId);
        if (!productInOrder) {
            return res.status(400).json({ message: 'Product not found in this order' });
        }

        const existingReview = await Review.findOne({
            user: req.user._id,
            product: productId,
            order: orderId
        });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this product for this order' });
        }

        // Create review
        const review = new Review({
            user: req.user._id,
            product: productId,
            order: orderId,
            rating,
            comment
        });

        await review.save();

        // Populate user info before sending response
        await review.populate('user', 'name');

        res.status(201).json(review);
    } catch (err) {
        next(err);
    }
};

// Get all reviews for a product
export const getProductReviews = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const reviews = await Review.find({ product: productId })
            .populate('user', 'name')
            .populate('replies.user', 'name')
            .sort({ createdAt: -1 })
            .lean();

        res.json(reviews);
    } catch (err) {
        next(err);
    }
};

// Add a reply to a review
export const addReply = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const { comment } = req.body;

        if (!comment) {
            return res.status(400).json({ message: 'Comment is required' });
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Add reply with admin flag if user is admin
        const reply = {
            user: req.user._id,
            comment,
            isAdmin: req.user.role === 'admin',
            createdAt: new Date()
        };

        review.replies.push(reply);
        await review.save();

        // Populate user info
        await review.populate('user', 'name');
        await review.populate('replies.user', 'name');

        res.json(review);
    } catch (err) {
        next(err);
    }
};

// Update a review (user can only update their own review)
export const updateReview = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;

        const review = await Review.findOne({ _id: reviewId, user: req.user._id });
        if (!review) {
            return res.status(404).json({ message: 'Review not found or you do not have permission to update it' });
        }

        if (rating !== undefined) {
            if (rating < 1 || rating > 5) {
                return res.status(400).json({ message: 'Rating must be between 1 and 5' });
            }
            review.rating = rating;
        }

        if (comment !== undefined) {
            if (!comment.trim()) {
                return res.status(400).json({ message: 'Comment cannot be empty' });
            }
            review.comment = comment;
        }

        await review.save();
        await review.populate('user', 'name');
        await review.populate('replies.user', 'name');

        res.json(review);
    } catch (err) {
        next(err);
    }
};

// Delete a review (user can delete own review, admin can delete any)
export const deleteReview = async (req, res, next) => {
    try {
        const { reviewId } = req.params;

        // Build query based on user role
        const query = { _id: reviewId };
        if (req.user.role !== 'admin') {
            query.user = req.user._id;
        }

        const review = await Review.findOneAndDelete(query);
        if (!review) {
            return res.status(404).json({ message: 'Review not found or you do not have permission to delete it' });
        }

        res.json({ message: 'Review deleted successfully' });
    } catch (err) {
        next(err);
    }
};
