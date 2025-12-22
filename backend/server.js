import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import vitalRoutes from './routes/vitals.js';
import alertRoutes from './routes/alerts.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payment-routes.js';
import { initializeFirebase } from './config/firebase.js';
import { handleWebSocketConnection } from './services/websocket-service.js';
import { scheduleBackups } from './services/backup-service.js';
import {
    securityHeaders,
    corsConfig,
    sanitizeInput,
    requestLogger,
    errorHandler,
    notFoundHandler,
    validateContentType
} from './middleware/security-middleware.js';
import { apiLimiter, authLimiter } from './middleware/rate-limit.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Security middleware
app.use(securityHeaders());
app.use(corsConfig());
app.use(requestLogger);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);
app.use(validateContentType);

// Rate limiting - skip auth routes to prevent lockouts during login/register
app.use('/api/', (req, res, next) => {
    // Skip rate limiting for auth routes
    if (req.path.startsWith('/auth')) {
        return next();
    }
    return apiLimiter(req, res, next);
});

// Initialize Firebase
console.log('🔥 Initializing Firebase...');
const firebaseInitialized = initializeFirebase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/vitals', vitalRoutes);
app.use('/api', adminRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        firebase: firebaseInitialized ? 'connected' : 'demo mode',
        version: '1.0.0'
    });
});

// Firebase diagnostic endpoint
app.get('/firebase-test', async (req, res) => {
    if (!firebaseInitialized) {
        return res.json({ status: 'error', message: 'Firebase not initialized' });
    }

    const { getDatabase } = await import('./config/firebase.js');
    const db = getDatabase();

    if (!db) {
        return res.json({ status: 'error', message: 'Database is null' });
    }

    const results = {
        timestamp: new Date().toISOString(),
        tests: {}
    };

    // Test 1: Simple set operation
    const testId = `test_${Date.now()}`;
    const startTime = Date.now();

    try {
        const writePromise = db.ref(`_diagnostics/${testId}`).set({ timestamp: Date.now(), test: true });
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Write timeout after 10s')), 10000)
        );

        await Promise.race([writePromise, timeoutPromise]);
        results.tests.write = { status: 'success', duration: Date.now() - startTime };

        // Test 2: Read back
        const readStart = Date.now();
        const readPromise = db.ref(`_diagnostics/${testId}`).once('value');
        const readTimeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Read timeout after 10s')), 10000)
        );

        const snapshot = await Promise.race([readPromise, readTimeoutPromise]);
        results.tests.read = { status: 'success', duration: Date.now() - readStart, data: snapshot.val() };

        // Cleanup
        await db.ref(`_diagnostics/${testId}`).remove();
        results.tests.cleanup = { status: 'success' };

    } catch (error) {
        results.tests.error = { message: error.message, duration: Date.now() - startTime };
    }

    results.status = results.tests.write?.status === 'success' ? 'ok' : 'error';
    res.json(results);
});

// API info
app.get('/api', (req, res) => {
    res.json({
        name: 'Premium Care Platform API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            patients: '/api/patients',
            vitals: '/api/vitals',
            alerts: '/api/alerts'
        },
        documentation: '/api/docs'
    });
});

// WebSocket connection handling
wss.on('connection', handleWebSocketConnection);

// Schedule automatic backups
if (firebaseInitialized) {
    scheduleBackups();
}

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log('');
    console.log('========================================');
    console.log('  Premium Care Platform - Server');
    console.log('========================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 WebSocket server ready`);
    console.log(`🔥 Firebase: ${firebaseInitialized ? 'Connected' : 'Demo Mode'}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('========================================');
    console.log('');
    console.log(`API Endpoints:`);
    console.log(`  - Health: http://localhost:${PORT}/health`);
    console.log(`  - Auth: http://localhost:${PORT}/api/auth`);
    console.log(`  - Patients: http://localhost:${PORT}/api/patients`);
    console.log(`  - Vitals: http://localhost:${PORT}/api/vitals`);
    console.log(`  - Alerts: http://localhost:${PORT}/api/alerts`);
    console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

export default app;
