/**
 * Payment Routes
 */

import express from 'express';
import Stripe from 'stripe';
import paymentService, { SUBSCRIPTION_PLANS } from '../services/payment-service.js';
import { authenticateToken } from '../middleware/auth-middleware.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Get available subscription plans
 */
router.get('/plans', (req, res) => {
    const plans = Object.values(SUBSCRIPTION_PLANS).map(plan => ({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        features: plan.features,
        limits: plan.limits
    }));

    res.json({ plans });
});

/**
 * Create checkout session
 */
router.post('/create-checkout', authenticateToken, async (req, res) => {
    try {
        const { planId } = req.body;
        const userId = req.user.uid;

        const successUrl = `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${process.env.FRONTEND_URL}/subscription`;

        const session = await paymentService.createCheckoutSession(
            userId,
            planId,
            successUrl,
            cancelUrl
        );

        res.json(session);
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Stripe webhook handler
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        await paymentService.handleWebhook(event);
        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
});

/**
 * Get current subscription
 */
router.get('/subscription', authenticateToken, async (req, res) => {
    try {
        const subscription = await paymentService.getUserSubscription(req.user.uid);
        res.json({ subscription });
    } catch (error) {
        console.error('Get subscription error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Cancel subscription
 */
router.post('/subscription/cancel', authenticateToken, async (req, res) => {
    try {
        await paymentService.cancelUserSubscription(req.user.uid);
        res.json({ success: true, message: 'Subscription canceled' });
    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get invoices
 */
router.get('/invoices', authenticateToken, async (req, res) => {
    try {
        const invoices = await paymentService.getUserInvoices(req.user.uid);
        res.json({ invoices });
    } catch (error) {
        console.error('Get invoices error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
