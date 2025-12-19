/**
 * Frontend Payment Service
 * Handles payment API calls
 */

import api from './api';

class PaymentService {
    /**
     * Get available subscription plans
     */
    async getPlans() {
        try {
            const response = await api.get('/payments/plans');
            return response.plans || [];
        } catch (error) {
            console.error('Get plans error:', error);
            // Return default plans if API fails
            return this.getDefaultPlans();
        }
    }

    /**
     * Create checkout session
     */
    async createCheckout(planId) {
        try {
            const response = await api.post('/payments/create-checkout', { planId });
            return response;
        } catch (error) {
            console.error('Create checkout error:', error);
            throw error;
        }
    }

    /**
     * Get current subscription
     */
    async getSubscription() {
        try {
            const response = await api.get('/payments/subscription');
            return response.subscription || { plan: 'free', status: 'active' };
        } catch (error) {
            console.error('Get subscription error:', error);
            return { plan: 'free', status: 'active' };
        }
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription() {
        try {
            const response = await api.post('/payments/subscription/cancel');
            return response;
        } catch (error) {
            console.error('Cancel subscription error:', error);
            throw error;
        }
    }

    /**
     * Get invoices
     */
    async getInvoices() {
        try {
            const response = await api.get('/payments/invoices');
            return response.invoices || [];
        } catch (error) {
            console.error('Get invoices error:', error);
            return [];
        }
    }

    /**
     * Get default plans (fallback when API is unavailable)
     */
    getDefaultPlans() {
        return [
            {
                id: 'free',
                name: 'Free',
                price: 0,
                features: [
                    'Basic vital monitoring',
                    'Emergency alerts',
                    '7-day history',
                    '1 caregiver'
                ]
            },
            {
                id: 'basic',
                name: 'Basic',
                price: 9900,
                features: [
                    'All Free features',
                    'Advanced sensor monitoring',
                    '30-day history',
                    'Up to 3 caregivers',
                    'Email support'
                ]
            },
            {
                id: 'premium',
                name: 'Premium',
                price: 19900,
                features: [
                    'All Basic features',
                    'AI health insights',
                    'Unlimited history',
                    'Up to 10 caregivers',
                    'Hardware sensor integration',
                    'Priority support',
                    'Custom reports'
                ]
            },
            {
                id: 'enterprise',
                name: 'Enterprise',
                price: 49900,
                features: [
                    'All Premium features',
                    'Unlimited caregivers',
                    'Multi-location support',
                    'Dedicated account manager',
                    '24/7 phone support',
                    'Custom integrations',
                    'SLA guarantee'
                ]
            }
        ];
    }
}

export default new PaymentService();
