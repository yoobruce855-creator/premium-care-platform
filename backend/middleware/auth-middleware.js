import jwt from 'jsonwebtoken';
import { getDatabase } from '../config/firebase.js';

// JWT Secret with fallback for development
const JWT_SECRET = process.env.JWT_SECRET || 'premium-care-development-jwt-secret-key-2024';

/**
 * Verify JWT token and attach user to request
 */
export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(403).json({ error: 'Invalid token' });
    }
}

/**
 * Check if user has required role
 */
export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Insufficient permissions',
                required: roles,
                current: req.user.role
            });
        }

        next();
    };
}

/**
 * Check if user has access to patient data
 */
export async function requirePatientAccess(req, res, next) {
    const { patientId } = req.params;
    const userId = req.user.id;

    if (!patientId) {
        return res.status(400).json({ error: 'Patient ID required' });
    }

    try {
        const db = getDatabase();

        if (db) {
            // Check Firebase
            const patientSnapshot = await db.ref(`patients/${patientId}`).once('value');
            const patient = patientSnapshot.val();

            if (!patient) {
                return res.status(404).json({ error: 'Patient not found' });
            }

            // Admin has access to all patients
            if (req.user.role === 'admin') {
                return next();
            }

            // Check if user is a guardian of this patient
            if (!patient.guardians || !patient.guardians.includes(userId)) {
                return res.status(403).json({ error: 'Access denied to this patient' });
            }
        } else {
            // Demo mode - allow access
            console.log('Demo mode: Skipping patient access check');
        }

        next();
    } catch (error) {
        console.error('Patient access check error:', error);
        res.status(500).json({ error: 'Failed to verify patient access' });
    }
}

/**
 * Rate limiting middleware
 * Prevents abuse by limiting requests per IP
 */
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute

export function rateLimit(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!requestCounts.has(ip)) {
        requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return next();
    }

    const record = requestCounts.get(ip);

    if (now > record.resetTime) {
        // Reset counter
        record.count = 1;
        record.resetTime = now + RATE_LIMIT_WINDOW;
        return next();
    }

    if (record.count >= MAX_REQUESTS) {
        return res.status(429).json({
            error: 'Too many requests',
            retryAfter: Math.ceil((record.resetTime - now) / 1000)
        });
    }

    record.count++;
    next();
}

/**
 * Validate request body against schema
 */
export function validateBody(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);

        if (error) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.details.map(d => d.message)
            });
        }

        next();
    };
}

/**
 * Check subscription status
 */
export async function requireActiveSubscription(req, res, next) {
    const userId = req.user.id;

    try {
        const db = getDatabase();

        if (db) {
            const subscriptionSnapshot = await db.ref(`subscriptions/${userId}`).once('value');
            const subscription = subscriptionSnapshot.val();

            if (!subscription || subscription.status !== 'active') {
                return res.status(402).json({
                    error: 'Active subscription required',
                    currentStatus: subscription?.status || 'none'
                });
            }
        } else {
            // Demo mode - allow access
            console.log('Demo mode: Skipping subscription check');
        }

        next();
    } catch (error) {
        console.error('Subscription check error:', error);
        res.status(500).json({ error: 'Failed to verify subscription' });
    }
}
