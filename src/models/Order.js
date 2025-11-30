import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, required: true, min: 1 },
      name: { type: String },
      imageUrl: { type: String }
    }
  ],
  total: { type: Number, required: true },
  paymentId: { type: String }, // Stripe payment/session id
  status: { type: String, enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  shippingAddress: {
    name: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;