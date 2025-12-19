/**
 * Payment Service - Stripe Integration
 * Handles subscription management and payments
 */

import Stripe from 'stripe';
import admin from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
    FREE: {
        id: 'free',
        name: 'Free',
        price: 0,
        priceId: null,
        features: [
            'Basic vital monitoring',
            'Emergency alerts',
            '7-day history',
            '1 caregiver'
        ],
        limits: {
            caregivers: 1,
            historyDays: 7,
            aiInsights: false,
            hardwareSensors: 0
        }
    },
    BASIC: {
        id: 'basic',
        name: 'Basic',
        price: 9900, // $99/month in cents
        priceId: process.env.STRIPE_BASIC_PRICE_ID,
        features: [
            'All Free features',
            'Advanced sensor monitoring',
            '30-day history',
            'Up to 3 caregivers',
            'Email support'
        ],
        limits: {
            caregivers: 3,
            historyDays: 30,
            aiInsights: false,
            hardwareSensors: 2
        }
    },
    PREMIUM: {
        id: 'premium',
        name: 'Premium',
        price: 19900, // $199/month
        priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
        features: [
            'All Basic features',
            'AI health insights',
            'Unlimited history',
            'Up to 10 caregivers',
            'Hardware sensor integration',
            'Priority support',
            'Custom reports'
        ],
        limits: {
            caregivers: 10,
            historyDays: -1, // unlimited
            aiInsights: true,
            hardwareSensors: 5
        }
    },
    ENTERPRISE: {
        id: 'enterprise',
        name: 'Enterprise',
        price: 49900, // $499/month
        priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
        features: [
            'All Premium features',
            'Unlimited caregivers',
            'Multi-location support',
            'Dedicated account manager',
            '24/7 phone support',
            'Custom integrations',
            'SLA guarantee'
        ],
        limits: {
            caregivers: -1, // unlimited
            historyDays: -1,
            aiInsights: true,
            hardwareSensors: -1 // unlimited
        }
    }
};

class PaymentService {
    /**
     * Create checkout session for subscription
     */
    async createCheckoutSession(userId, planId, successUrl, cancelUrl) {
        try {
            const plan = SUBSCRIPTION_PLANS[planId.toUpperCase()];
            if (!plan || !plan.priceId) {
                throw new Error('Invalid plan or free plan selected');
            }

            // Get or create Stripe customer
            const customer = await this.getOrCreateCustomer(userId);

            const session = await stripe.checkout.sessions.create({
                customer: customer.id,
                mode: 'subscription',
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: plan.priceId,
                        quantity: 1,
                    },
                ],
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata: {
                    userId,
                    planId: plan.id
                }
            });

            return {
                sessionId: session.id,
                url: session.url
            };
        } catch (error) {
            console.error('Checkout session creation error:', error);
            throw error;
        }
    }

    /**
     * Get or create Stripe customer
     */
    async getOrCreateCustomer(userId) {
        const db = admin.firestore();
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();

        if (userData.stripeCustomerId) {
            return await stripe.customers.retrieve(userData.stripeCustomerId);
        }

        const customer = await stripe.customers.create({
            email: userData.email,
            metadata: { userId }
        });

        await db.collection('users').doc(userId).update({
            stripeCustomerId: customer.id
        });

        return customer;
    }

    /**
     * Handle webhook events
     */
    async handleWebhook(event) {
        const db = admin.firestore();

        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                await this.activateSubscription(
                    session.metadata.userId,
                    session.metadata.planId,
                    session.subscription
                );
                break;

            case 'customer.subscription.updated':
                const subscription = event.data.object;
                await this.updateSubscriptionStatus(subscription);
                break;

            case 'customer.subscription.deleted':
                const deletedSub = event.data.object;
                await this.cancelSubscription(deletedSub.metadata.userId);
                break;

            case 'invoice.payment_succeeded':
                const invoice = event.data.object;
                await this.recordPayment(invoice);
                break;

            case 'invoice.payment_failed':
                const failedInvoice = event.data.object;
                await this.handlePaymentFailure(failedInvoice);
                break;
        }
    }

    /**
     * Activate subscription
     */
    async activateSubscription(userId, planId, stripeSubscriptionId) {
        const db = admin.firestore();
        const plan = SUBSCRIPTION_PLANS[planId.toUpperCase()];

        await db.collection('users').doc(userId).update({
            subscription: {
                plan: planId,
                status: 'active',
                stripeSubscriptionId,
                startDate: admin.firestore.FieldValue.serverTimestamp(),
                limits: plan.limits
            }
        });

        // Log subscription event
        await db.collection('subscriptionEvents').add({
            userId,
            type: 'activated',
            plan: planId,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
    }

    /**
     * Update subscription status
     */
    async updateSubscriptionStatus(subscription) {
        const db = admin.firestore();
        const userId = subscription.metadata.userId;

        await db.collection('users').doc(userId).update({
            'subscription.status': subscription.status
        });
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(userId) {
        const db = admin.firestore();

        await db.collection('users').doc(userId).update({
            subscription: {
                plan: 'free',
                status: 'canceled',
                canceledAt: admin.firestore.FieldValue.serverTimestamp(),
                limits: SUBSCRIPTION_PLANS.FREE.limits
            }
        });

        await db.collection('subscriptionEvents').add({
            userId,
            type: 'canceled',
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
    }

    /**
     * Record successful payment
     */
    async recordPayment(invoice) {
        const db = admin.firestore();

        await db.collection('payments').add({
            invoiceId: invoice.id,
            customerId: invoice.customer,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: 'succeeded',
            paidAt: admin.firestore.Timestamp.fromDate(new Date(invoice.created * 1000))
        });
    }

    /**
     * Handle payment failure
     */
    async handlePaymentFailure(invoice) {
        const db = admin.firestore();

        await db.collection('payments').add({
            invoiceId: invoice.id,
            customerId: invoice.customer,
            amount: invoice.amount_due,
            currency: invoice.currency,
            status: 'failed',
            attemptedAt: admin.firestore.Timestamp.fromDate(new Date(invoice.created * 1000))
        });

        // TODO: Send notification to user about payment failure
    }

    /**
     * Get user's subscription
     */
    async getUserSubscription(userId) {
        const db = admin.firestore();
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();

        return userData.subscription || {
            plan: 'free',
            status: 'active',
            limits: SUBSCRIPTION_PLANS.FREE.limits
        };
    }

    /**
     * Get invoices for user
     */
    async getUserInvoices(userId) {
        const db = admin.firestore();
        const userDoc = await db.collection('users').doc(userId).get();
        const stripeCustomerId = userDoc.data().stripeCustomerId;

        if (!stripeCustomerId) {
            return [];
        }

        const invoices = await stripe.invoices.list({
            customer: stripeCustomerId,
            limit: 100
        });

        return invoices.data.map(inv => ({
            id: inv.id,
            amount: inv.amount_paid,
            currency: inv.currency,
            status: inv.status,
            date: new Date(inv.created * 1000),
            pdfUrl: inv.invoice_pdf
        }));
    }

    /**
     * Cancel user's subscription
     */
    async cancelUserSubscription(userId) {
        const db = admin.firestore();
        const userDoc = await db.collection('users').doc(userId).get();
        const subscription = userDoc.data().subscription;

        if (subscription && subscription.stripeSubscriptionId) {
            await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
        }

        await this.cancelSubscription(userId);
    }
}

export default new PaymentService();
