import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

/**
 * Redis client for distributed rate limiting
 * Falls back to memory store if Redis is not available
 */
let redisClient = null;

async function getRedisClient() {
    if (redisClient) return redisClient;

    if (process.env.REDIS_URL) {
        try {
            redisClient = createClient({
                url: process.env.REDIS_URL,
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > 10) {
                            console.error('❌ Redis connection failed after 10 retries');
                            return new Error('Redis connection failed');
                        }
                        return retries * 100;
                    }
                }
            });

            redisClient.on('error', (err) => console.warn('⚠️  Redis Client Error:', err.message));
            redisClient.on('connect', () => console.log('✅ Redis connected for rate limiting'));

            await redisClient.connect();
            return redisClient;
        } catch (error) {
            console.warn('⚠️  Redis not available, using memory store for rate limiting');
            return null;
        }
    }

    console.log('💡 Redis URL not configured, using memory store for rate limiting');
    return null;
}

/**
 * Create rate limiter with Redis or memory store
 */
async function createRateLimiter(options) {
    const client = await getRedisClient();

    const limiterOptions = {
        windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes default
        max: options.max || 100,
        message: options.message || 'Too many requests, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
        ...options
    };

    if (client) {
        limiterOptions.store = new RedisStore({
            client: client,
            prefix: 'rl:',
        });
    }

    return rateLimit(limiterOptions);
}

/**
 * General API rate limiter
 * 100 requests per 15 minutes
 */
export const apiLimiter = await createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: 900
    }
});

/**
 * Authentication rate limiter
 * 5 login attempts per 15 minutes
 */
export const authLimiter = await createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        error: 'Too many login attempts, please try again later.',
        retryAfter: 900
    },
    skipSuccessfulRequests: true
});

/**
 * Strict rate limiter for sensitive operations
 * 10 requests per hour
 */
export const strictLimiter = await createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: {
        error: 'Rate limit exceeded for this operation.',
        retryAfter: 3600
    }
});

/**
 * WebSocket connection rate limiter
 * 20 connections per minute
 */
export const wsLimiter = await createRateLimiter({
    windowMs: 60 * 1000,
    max: 20,
    message: {
        error: 'Too many WebSocket connections, please try again later.',
        retryAfter: 60
    }
});

/**
 * Alert creation rate limiter
 * 30 alerts per minute (prevents spam)
 */
export const alertLimiter = await createRateLimiter({
    windowMs: 60 * 1000,
    max: 30,
    message: {
        error: 'Too many alerts created, please slow down.',
        retryAfter: 60
    }
});

/**
 * Custom rate limiter factory
 */
export async function createCustomLimiter(options) {
    return await createRateLimiter(options);
}

/**
 * Cleanup function
 */
export async function disconnectRedis() {
    if (redisClient) {
        await redisClient.quit();
        console.log('🔌 Redis disconnected');
    }
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
