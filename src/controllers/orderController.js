import Order from '../models/Order.js';

// Place new order (protected route, user must be logged in)
export const createOrder = async (req, res, next) => {
  try {
    const { products, total, paymentId, shippingAddress } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'No products specified' });
    }
    const mappedAddress = shippingAddress ? {
      name: shippingAddress.fullName || shippingAddress.name || '',
      phone: shippingAddress.phone || '',
      address: shippingAddress.line1 || shippingAddress.address || '',
      city: shippingAddress.city || '',
      state: shippingAddress.state || '',
      postalCode: shippingAddress.postalCode || '',
      country: shippingAddress.country || '',
    } : undefined;
    const order = new Order({
      user: req.user._id,
      products,
      total,
      paymentId,
      shippingAddress: mappedAddress,
      status: paymentId && paymentId !== 'COD' ? 'paid' : 'pending'
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

// List orders for logged in user
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('products.product');
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// Get a single order belonging to the logged in user
export const getMyOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).populate('products.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// (Optional) List all orders as admin
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user').populate('products.product');
    res.json(orders);
  } catch (err) {
    next(err);
  }
};