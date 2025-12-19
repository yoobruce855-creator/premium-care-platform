import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/firebase.js';
import { authenticateToken, requirePatientAccess } from '../middleware/auth-middleware.js';

const router = express.Router();

/**
 * GET /api/alerts/:patientId
 * Get alerts for a patient
 */
router.get('/:patientId', authenticateToken, requirePatientAccess, async (req, res) => {
    try {
        const { patientId } = req.params;
        const { limit = 50, status, severity } = req.query;
        const db = getDatabase();

        if (db) {
            let query = db.ref(`alerts/${patientId}`);

            const snapshot = await query.limitToLast(parseInt(limit)).once('value');
            let alerts = snapshot.val() || {};
            let alertsArray = Object.values(alerts);

            // Filter by status
            if (status) {
                alertsArray = alertsArray.filter(alert => alert.status === status);
            }

            // Filter by severity
            if (severity) {
                alertsArray = alertsArray.filter(alert => alert.severity === severity);
            }

            // Sort by timestamp (newest first)
            alertsArray.sort((a, b) => b.timestamp - a.timestamp);

            res.json(alertsArray);
        } else {
            // Demo mode
            res.json([{
                id: 'alert-1',
                type: 'fall',
                severity: 'high',
                status: 'pending',
                message: 'Fall detected',
                timestamp: Date.now() - 300000,
                data: {}
            }]);
        }
    } catch (error) {
        console.error('Get alerts error:', error);
        res.status(500).json({ error: 'Failed to get alerts' });
    }
});

/**
 * POST /api/alerts/:patientId
 * Create a new alert
 */
router.post('/:patientId', authenticateToken, requirePatientAccess, async (req, res) => {
    try {
        const { patientId } = req.params;
        const { type, severity, message, data } = req.body;

        if (!type || !severity || !message) {
            return res.status(400).json({ error: 'Type, severity, and message are required' });
        }

        const db = getDatabase();
        const alertId = uuidv4();

        const newAlert = {
            id: alertId,
            type,
            severity,
            status: 'pending',
            message,
            data: data || {},
            timestamp: Date.now(),
            acknowledgedBy: null,
            acknowledgedAt: null,
            resolvedAt: null,
            notificationsSent: {
                email: false,
                push: false,
                sms: false
            }
        };

        if (db) {
            await db.ref(`alerts/${patientId}/${alertId}`).set(newAlert);

            // Update patient status
            if (severity === 'critical') {
                await db.ref(`patients/${patientId}/status`).set('emergency');
            } else if (severity === 'high') {
                await db.ref(`patients/${patientId}/status`).set('warning');
            }

            // Log event
            await db.ref(`events/${patientId}/${uuidv4()}`).set({
                id: uuidv4(),
                type: 'alert_created',
                description: `Alert created: ${message}`,
                data: newAlert,
                userId: req.user.id,
                timestamp: Date.now()
            });

            res.status(201).json(newAlert);
        } else {
            res.status(503).json({ error: 'Alert creation not available in demo mode' });
        }
    } catch (error) {
        console.error('Create alert error:', error);
        res.status(500).json({ error: 'Failed to create alert' });
    }
});

/**
 * PUT /api/alerts/:patientId/:alertId/acknowledge
 * Acknowledge an alert
 */
router.put('/:patientId/:alertId/acknowledge', authenticateToken, requirePatientAccess, async (req, res) => {
    try {
        const { patientId, alertId } = req.params;
        const db = getDatabase();

        if (db) {
            const alertSnapshot = await db.ref(`alerts/${patientId}/${alertId}`).once('value');
            const alert = alertSnapshot.val();

            if (!alert) {
                return res.status(404).json({ error: 'Alert not found' });
            }

            await db.ref(`alerts/${patientId}/${alertId}`).update({
                status: 'acknowledged',
                acknowledgedBy: req.user.id,
                acknowledgedAt: Date.now()
            });

            // Log event
            await db.ref(`events/${patientId}/${uuidv4()}`).set({
                id: uuidv4(),
                type: 'alert_acknowledged',
                description: `Alert acknowledged: ${alert.message}`,
                data: { alertId },
                userId: req.user.id,
                timestamp: Date.now()
            });

            const updatedSnapshot = await db.ref(`alerts/${patientId}/${alertId}`).once('value');
            res.json(updatedSnapshot.val());
        } else {
            res.status(503).json({ error: 'Alert acknowledgment not available in demo mode' });
        }
    } catch (error) {
        console.error('Acknowledge alert error:', error);
        res.status(500).json({ error: 'Failed to acknowledge alert' });
    }
});

/**
 * PUT /api/alerts/:patientId/:alertId/resolve
 * Resolve an alert
 */
router.put('/:patientId/:alertId/resolve', authenticateToken, requirePatientAccess, async (req, res) => {
    try {
        const { patientId, alertId } = req.params;
        const db = getDatabase();

        if (db) {
            const alertSnapshot = await db.ref(`alerts/${patientId}/${alertId}`).once('value');
            const alert = alertSnapshot.val();

            if (!alert) {
                return res.status(404).json({ error: 'Alert not found' });
            }

            await db.ref(`alerts/${patientId}/${alertId}`).update({
                status: 'resolved',
                resolvedAt: Date.now()
            });

            // Check if there are any other pending/acknowledged alerts
            const allAlertsSnapshot = await db.ref(`alerts/${patientId}`).once('value');
            const allAlerts = allAlertsSnapshot.val() || {};
            const activeAlerts = Object.values(allAlerts).filter(a =>
                a.status === 'pending' || a.status === 'acknowledged'
            );

            // Update patient status if no active alerts
            if (activeAlerts.length === 0) {
                await db.ref(`patients/${patientId}/status`).set('normal');
            }

            // Log event
            await db.ref(`events/${patientId}/${uuidv4()}`).set({
                id: uuidv4(),
                type: 'alert_resolved',
                description: `Alert resolved: ${alert.message}`,
                data: { alertId },
                userId: req.user.id,
                timestamp: Date.now()
            });

            const updatedSnapshot = await db.ref(`alerts/${patientId}/${alertId}`).once('value');
            res.json(updatedSnapshot.val());
        } else {
            res.status(503).json({ error: 'Alert resolution not available in demo mode' });
        }
    } catch (error) {
        console.error('Resolve alert error:', error);
        res.status(500).json({ error: 'Failed to resolve alert' });
    }
});

/**
 * GET /api/alerts/:patientId/statistics
 * Get alert statistics
 */
router.get('/:patientId/statistics', authenticateToken, requirePatientAccess, async (req, res) => {
    try {
        const { patientId } = req.params;
        const { period = '7d' } = req.query;
        const db = getDatabase();

        if (db) {
            const now = Date.now();
            const periodMs = {
                '24h': 24 * 60 * 60 * 1000,
                '7d': 7 * 24 * 60 * 60 * 1000,
                '30d': 30 * 24 * 60 * 60 * 1000
            };
            const startTime = now - (periodMs[period] || periodMs['7d']);

            const snapshot = await db.ref(`alerts/${patientId}`).once('value');
            const allAlerts = snapshot.val() || {};
            const alertsArray = Object.values(allAlerts).filter(alert =>
                alert.timestamp >= startTime
            );

            const stats = {
                period,
                total: alertsArray.length,
                byType: {},
                bySeverity: {},
                byStatus: {},
                averageResponseTime: 0
            };

            // Count by type, severity, status
            alertsArray.forEach(alert => {
                stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;
                stats.bySeverity[alert.severity] = (stats.bySeverity[alert.severity] || 0) + 1;
                stats.byStatus[alert.status] = (stats.byStatus[alert.status] || 0) + 1;
            });

            // Calculate average response time
            const acknowledgedAlerts = alertsArray.filter(a => a.acknowledgedAt);
            if (acknowledgedAlerts.length > 0) {
                const totalResponseTime = acknowledgedAlerts.reduce((sum, alert) =>
                    sum + (alert.acknowledgedAt - alert.timestamp), 0
                );
                stats.averageResponseTime = Math.round(totalResponseTime / acknowledgedAlerts.length / 1000); // in seconds
            }

            res.json(stats);
        } else {
            // Demo mode
            res.json({
                period,
                total: 5,
                byType: { fall: 2, apnea: 1, abnormal_heart_rate: 2 },
                bySeverity: { low: 1, medium: 2, high: 2 },
                byStatus: { pending: 1, acknowledged: 2, resolved: 2 },
                averageResponseTime: 120
            });
        }
    } catch (error) {
        console.error('Get alert statistics error:', error);
        res.status(500).json({ error: 'Failed to get alert statistics' });
    }
});

export default router;
