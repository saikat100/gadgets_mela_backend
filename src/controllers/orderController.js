import Order from '../models/Order.js';
import Product from '../models/Product.js';

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
    // Enrich products with snapshot of name and imageUrl
    const ids = products.map((p) => p.product);
    const dbProducts = await Product.find({ _id: { $in: ids } }, { _id: 1, name: 1, imageUrl: 1 });
    const idToProduct = new Map(dbProducts.map((p) => [String(p._id), p]));

    const productsWithSnapshot = products.map((p) => {
      const prod = idToProduct.get(String(p.product));
      return {
        product: p.product,
        quantity: p.quantity,
        name: prod?.name,
        imageUrl: prod?.imageUrl,
      };
    });

    const order = new Order({
      user: req.user._id,
      products: productsWithSnapshot,
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