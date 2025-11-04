import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET;
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

export const createCheckoutSession = async (req, res, next) => {
  try {
    if (!stripe) return res.status(500).json({ message: 'Stripe not configured on server' });
    const { items, successUrl, cancelUrl } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items provided' });
    }
    const line_items = items.map((it) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: it.name || 'Item' },
        unit_amount: Math.round((it.price || 0) * 100),
      },
      quantity: it.quantity || 1,
    }));
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
    });
    res.json({ url: session.url, id: session.id });
  } catch (err) {
    next(err);
  }
};


