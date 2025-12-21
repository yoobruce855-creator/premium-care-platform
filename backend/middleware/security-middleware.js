import helmet from 'helmet';
import cors from 'cors';

/**
 * Security headers middleware using Helmet
 */
export function securityHeaders() {
    return helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                connectSrc: ["'self'", 'wss:', 'https:'],
                fontSrc: ["'self'", 'data:'],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"],
            },
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        },
        noSniff: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    });
}

/**
 * CORS configuration for production
 */
export function corsConfig() {
    // Build allowed origins list from environment and hardcoded production domains
    const allowedOrigins = [
        // Environment variable (primary frontend URL)
        process.env.FRONTEND_URL,
        // Production domains - explicitly add Vercel URLs
        'https://premium-care-platform.vercel.app',
        'https://premium-care-platform-git-main-yoobruce855-creator.vercel.app',
        // Local development
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
    ].filter(Boolean); // Remove undefined/null values

    console.log('🔐 CORS Allowed Origins:', allowedOrigins);

    return cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (mobile apps, Postman, curl, server-to-server, etc.)
            if (!origin) {
                return callback(null, true);
            }

            // Check if origin is in the allowed list
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            // Allow all Vercel preview/deployment URLs for this project
            if (origin.includes('premium-care-platform') && origin.includes('vercel.app')) {
                console.log('✅ Allowing Vercel preview URL:', origin);
                return callback(null, true);
            }

            // Log rejected origin for debugging
            console.warn('⚠️ CORS blocked origin:', origin);
            console.warn('   Allowed origins:', allowedOrigins);

            // Return false but don't throw an error - let browser handle CORS rejection
            return callback(null, false);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
        maxAge: 600, // 10 minutes
        preflightContinue: false,
        optionsSuccessStatus: 204
    });
}

/**
 * Sanitize user input to prevent XSS
 * Note: Password and other sensitive fields are excluded to prevent corruption
 */
export function sanitizeInput(req, res, next) {
    // Fields that should NOT be sanitized (passwords, tokens, user data, etc.)
    const excludedFields = ['password', 'currentPassword', 'newPassword', 'refreshToken', 'token', 'name', 'email', 'phone'];

    const sanitize = (obj, parentKey = '') => {
        if (typeof obj === 'string') {
            return obj
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;');
            // Note: Not escaping / anymore as it breaks passwords
        }
        if (typeof obj === 'object' && obj !== null) {
            const result = Array.isArray(obj) ? [] : {};
            Object.keys(obj).forEach(key => {
                // Skip sanitization for excluded fields
                if (excludedFields.includes(key)) {
                    result[key] = obj[key];
                } else {
                    result[key] = sanitize(obj[key], key);
                }
            });
            return result;
        }
        return obj;
    };

    if (req.body) {
        req.body = sanitize(req.body);
    }
    if (req.query) {
        req.query = sanitize(req.query);
    }
    if (req.params) {
        req.params = sanitize(req.params);
    }

    next();
}

/**
 * Request logging middleware
 */
export function requestLogger(req, res, next) {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const log = {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            timestamp: new Date().toISOString()
        };

        if (res.statusCode >= 400) {
            console.error('❌', JSON.stringify(log));
        } else {
            console.log('✅', JSON.stringify(log));
        }
    });

    next();
}

/**
 * Error handling middleware
 */
export function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';

    const errorResponse = {
        error: err.message || 'Internal server error',
        ...(isDevelopment && { stack: err.stack })
    };

    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json(errorResponse);
}

/**
 * 404 handler
 */
export function notFoundHandler(req, res) {
    res.status(404).json({
        error: 'Not found',
        path: req.path,
        method: req.method
    });
}

/**
 * Validate content type
 * Note: OPTIONS requests are skipped to allow CORS preflight
 */
export function validateContentType(req, res, next) {
    // Skip OPTIONS requests (CORS preflight)
    if (req.method === 'OPTIONS') {
        return next();
    }

    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return res.status(415).json({
                error: 'Unsupported Media Type',
                expected: 'application/json'
            });
        }
    }
    next();
}
