import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String, required: true, trim: true },
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    rating: {
        type: Number,
        required: true,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    comment: { type: String, required: true, trim: true },
    replies: [replySchema]
}, {
    timestamps: true,
    indexes: [
        { product: 1, createdAt: -1 },
        { user: 1, product: 1, order: 1 }
    ]
});

// Ensure user can only review each product once per order
reviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
