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

// Rate limiting - disabled on auth routes to prevent lockouts
app.use('/api/', apiLimiter);
// Note: authLimiter removed from login/register to prevent 429 errors during testing

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
