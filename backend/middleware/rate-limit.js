import rateLimit from 'express-rate-limit';

/**
 * Rate limiting middleware - Synchronous initialization
 * Uses in-memory store for simplicity and reliability
 * Redis can be added later for distributed deployments
 */

/**
 * General API rate limiter
 * 200 requests per 15 minutes (generous for development)
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: 900
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for health checks
    skip: (req) => req.path === '/health'
});

/**
 * Authentication rate limiter
 * 100 login attempts per 15 minutes (very relaxed for testing)
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Too many login attempts, please try again later.',
        retryAfter: 900
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true
});

/**
 * Strict rate limiter for sensitive operations
 * 20 requests per hour
 */
export const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: {
        error: 'Rate limit exceeded for this operation.',
        retryAfter: 3600
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * WebSocket connection rate limiter
 * 50 connections per minute
 */
export const wsLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 50,
    message: {
        error: 'Too many WebSocket connections, please try again later.',
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Alert creation rate limiter
 * 60 alerts per minute (prevents spam)
 */
export const alertLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: {
        error: 'Too many alerts created, please slow down.',
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Custom rate limiter factory
 */
export function createCustomLimiter(options) {
    return rateLimit({
        windowMs: options.windowMs || 15 * 60 * 1000,
        max: options.max || 100,
        message: options.message || 'Too many requests, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
        ...options
    });
}

/**
 * Cleanup function (no-op for memory store)
 */
export function disconnectRedis() {
    console.log('💡 Using in-memory rate limiting, no Redis to disconnect');
}

export default {
    apiLimiter,
    authLimiter,
    strictLimiter,
    wsLimiter,
    alertLimiter,
    createCustomLimiter,
    disconnectRedis
};
