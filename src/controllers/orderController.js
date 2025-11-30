import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';

// Place new order (protected route, user must be logged in)
export const createOrder = async (req, res, next) => {
  try {
    const { products, total, paymentId, shippingAddress } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'No products specified' });
    }

    // 1. Validate stock for all products and prepare updates
    // We'll attempt to reserve stock for each product.
    // If any fails, we must rollback.
    const reservedProducts = [];

    for (const item of products) {
      const product = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!product) {
        // Rollback previously reserved products
        for (const reserved of reservedProducts) {
          await Product.findByIdAndUpdate(reserved.product, {
            $inc: { stock: reserved.quantity }
          });
        }
        return res.status(400).json({
          message: `Insufficient stock for product ID: ${item.product} or product not found`
        });
      }

      reservedProducts.push({
        product: item.product,
        quantity: item.quantity,
        name: product.name,
        imageUrl: product.imageUrl
      });
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
      products: reservedProducts,
      total,
      paymentId,
      shippingAddress: mappedAddress,
      status: paymentId && paymentId !== 'COD' ? 'paid' : 'pending'
    });

    try {
      await order.save();
      res.status(201).json(order);
    } catch (saveError) {
      // If order save fails, rollback stock
      for (const reserved of reservedProducts) {
        await Product.findByIdAndUpdate(reserved.product, {
          $inc: { stock: reserved.quantity }
        });
      }
      throw saveError;
    }

  } catch (err) {
    next(err);
  }
};

// List orders for logged in user
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate({ path: 'products.product', select: 'name imageUrl' })
      .lean();
    const withDerived = orders.map((doc) => {
      doc.products = (doc.products || []).map((p) => ({
        ...p,
        name: p.name || p.product?.name,
        imageUrl: p.imageUrl || p.product?.imageUrl,
      }));
      return doc;
    });
    res.json(withDerived);
  } catch (err) {
    next(err);
  }
};

// Get a single order belonging to the logged in user
export const getMyOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .populate({ path: 'products.product', select: 'name imageUrl' })
      .lean();
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const doc = order;
    doc.products = (doc.products || []).map((p) => ({
      ...p,
      name: p.name || p.product?.name,
      imageUrl: p.imageUrl || p.product?.imageUrl,
    }));
    res.json(doc);
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

// Cancel an order for the logged-in user if it's still pending
export const cancelMyOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    // Restore stock
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    order.status = 'cancelled';
    await order.save();
    res.json({ message: 'Order cancelled', order });
  } catch (err) {
    next(err);
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Validate status
    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// Check if user can review a product
export const checkReviewEligibility = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Find a delivered order for this user containing the product
    const order = await Order.findOne({
      user: req.user._id,
      status: 'delivered',
      'products.product': productId
    });

    if (!order) {
      return res.json({ canReview: false, message: 'No delivered order found for this product' });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId,
      order: order._id
    });

    if (existingReview) {
      return res.json({ canReview: false, message: 'Already reviewed' });
    }

    res.json({ canReview: true, orderId: order._id });
  } catch (err) {
    next(err);
  }
};