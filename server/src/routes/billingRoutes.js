import { Router } from 'express';
import Stripe from 'stripe';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { Tenant } from '../models/Tenant.js';

const router = Router();
const stripe = new Stripe(env.stripeSecretKey || 'sk_test_placeholder');

const priceByPlan = {
  basic: process.env.STRIPE_PRICE_BASIC,
  pro: process.env.STRIPE_PRICE_PRO,
  premium: process.env.STRIPE_PRICE_PREMIUM
};

router.use(requireAuth);

router.post('/create-checkout-session', async (req, res) => {
  const { plan } = req.body;
  if (!priceByPlan[plan]) return res.status(400).json({ error: 'Invalid or unconfigured plan' });

  const tenant = await Tenant.findById(req.user.tenantId);
  let customerId = tenant.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({ email: tenant.email, name: tenant.companyName });
    customerId = customer.id;
    tenant.stripeCustomerId = customerId;
    await tenant.save();
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceByPlan[plan], quantity: 1 }],
    success_url: `${process.env.CORS_ORIGIN}/dashboard?billing=success`,
    cancel_url: `${process.env.CORS_ORIGIN}/dashboard?billing=cancelled`,
    metadata: { tenantId: String(tenant._id), plan }
  });

  res.json({ url: session.url });
});

export default router;
