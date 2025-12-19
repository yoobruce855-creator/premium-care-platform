import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/firebase.js';
import { authenticateToken, requirePatientAccess } from '../middleware/auth-middleware.js';

const router = express.Router();

/**
 * GET /api/vitals/:patientId
 * Get vital signs for a patient
 */
router.get('/:patientId', authenticateToken, requirePatientAccess, async (req, res) => {
    try {
        const { patientId } = req.params;
        const { limit = 100, startTime, endTime } = req.query;
        const db = getDatabase();

        if (db) {
            let query = db.ref(`vitals/${patientId}`);

            if (startTime) {
                query = query.orderByKey().startAt(startTime);
            }
            if (endTime) {
                query = query.orderByKey().endAt(endTime);
            }

            query = query.limitToLast(parseInt(limit));

            const snapshot = await query.once('value');
            const vitals = snapshot.val() || {};

            // Convert to array and sort by timestamp
            const vitalsArray = Object.values(vitals).sort((a, b) => b.timestamp - a.timestamp);

            res.json(vitalsArray);
        } else {
            // Demo mode - return sample data
            const sampleVitals = Array.from({ length: 10 }, (_, i) => ({
                timestamp: Date.now() - i * 60000,
                heartRate: Math.floor(Math.random() * 20) + 65,
                respiratoryRate: Math.floor(Math.random() * 6) + 14,
                activity: 'normal',
                confidence: 0.95,
                source: 'simulator'
            }));
            res.json(sampleVitals);
        }
    } catch (error) {
        console.error('Get vitals error:', error);
        res.status(500).json({ error: 'Failed to get vital signs' });
    }
});

/**
 * GET /api/vitals/:patientId/latest
 * Get latest vital signs
 */
router.get('/:patientId/latest', authenticateToken, requirePatientAccess, async (req, res) => {
    try {
        const { patientId } = req.params;
        const db = getDatabase();

        if (db) {
            const snapshot = await db.ref(`vitals/${patientId}`)
                .orderByKey()
                .limitToLast(1)
                .once('value');

            const vitals = snapshot.val();
            if (!vitals) {
                return res.status(404).json({ error: 'No vital signs found' });
            }

            const latest = Object.values(vitals)[0];
            res.json(latest);
        } else {
            // Demo mode
            res.json({
                timestamp: Date.now(),
                heartRate: 72,
                respiratoryRate: 16,
                activity: 'normal',
                confidence: 0.95,
                source: 'simulator'
            });
        }
    } catch (error) {
        console.error('Get latest vitals error:', error);
        res.status(500).json({ error: 'Failed to get latest vital signs' });
    }
});

/**
 * POST /api/vitals/:patientId
 * Submit vital signs (for manual entry or external sensors)
 */
router.post('/:patientId', authenticateToken, requirePatientAccess, async (req, res) => {
    try {
        const { patientId } = req.params;
        const vitalData = req.body;

        const vitalRecord = {
            ...vitalData,
            timestamp: Date.now(),
            source: vitalData.source || 'manual'
        };

        const db = getDatabase();
        if (db) {
            await db.ref(`vitals/${patientId}/${vitalRecord.timestamp}`).set(vitalRecord);

            // Check for anomalies and create alerts if needed
            await checkVitalAnomalies(db, patientId, vitalRecord);

            // Log event
            await db.ref(`events/${patientId}/${uuidv4()}`).set({
                id: uuidv4(),
                type: 'vital_recorded',
                description: 'Vital signs recorded',
                data: vitalRecord,
                userId: req.user.id,
                timestamp: Date.now()
            });

            res.json(vitalRecord);
        } else {
            res.status(503).json({ error: 'Vital signs submission not available in demo mode' });
        }
    } catch (error) {
        console.error('Submit vitals error:', error);
        res.status(500).json({ error: 'Failed to submit vital signs' });
    }
});

/**
 * GET /api/vitals/:patientId/statistics
 * Get statistics for vital signs
 */
router.get('/:patientId/statistics', authenticateToken, requirePatientAccess, async (req, res) => {
    try {
        const { patientId } = req.params;
        const { period = '24h' } = req.query;
        const db = getDatabase();

        if (db) {
            // Calculate time range
            const now = Date.now();
            const periodMs = {
                '1h': 60 * 60 * 1000,
                '24h': 24 * 60 * 60 * 1000,
                '7d': 7 * 24 * 60 * 60 * 1000,
                '30d': 30 * 24 * 60 * 60 * 1000
            };
            const startTime = now - (periodMs[period] || periodMs['24h']);

            const snapshot = await db.ref(`vitals/${patientId}`)
                .orderByKey()
                .startAt(startTime.toString())
                .once('value');

            const vitals = snapshot.val() || {};
            const vitalsArray = Object.values(vitals);

            if (vitalsArray.length === 0) {
                return res.json({
                    period,
                    count: 0,
                    heartRate: { min: 0, max: 0, avg: 0 },
                    respiratoryRate: { min: 0, max: 0, avg: 0 }
                });
            }

            // Calculate statistics
            const heartRates = vitalsArray.map(v => v.heartRate).filter(Boolean);
            const respiratoryRates = vitalsArray.map(v => v.respiratoryRate).filter(Boolean);

            const stats = {
                period,
                count: vitalsArray.length,
                heartRate: {
                    min: Math.min(...heartRates),
                    max: Math.max(...heartRates),
                    avg: Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length)
                },
                respiratoryRate: {
                    min: Math.min(...respiratoryRates),
                    max: Math.max(...respiratoryRates),
                    avg: Math.round(respiratoryRates.reduce((a, b) => a + b, 0) / respiratoryRates.length)
                }
            };

            res.json(stats);
        } else {
            // Demo mode
            res.json({
                period,
                count: 100,
                heartRate: { min: 60, max: 85, avg: 72 },
                respiratoryRate: { min: 12, max: 20, avg: 16 }
            });
        }
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({ error: 'Failed to get statistics' });
    }
});

/**
 * DELETE /api/vitals/:patientId
 * Delete vital signs data (admin only)
 */
router.delete('/:patientId', authenticateToken, requirePatientAccess, async (req, res) => {
    try {
        const { patientId } = req.params;
        const { before } = req.query;

        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const db = getDatabase();
        if (db) {
            if (before) {
                // Delete vitals before a certain timestamp
                const snapshot = await db.ref(`vitals/${patientId}`)
                    .orderByKey()
                    .endAt(before)
                    .once('value');

                const vitals = snapshot.val() || {};
                const updates = {};
                Object.keys(vitals).forEach(key => {
                    updates[`vitals/${patientId}/${key}`] = null;
                });

                await db.ref().update(updates);
                res.json({ message: `Deleted ${Object.keys(vitals).length} vital records` });
            } else {
                // Delete all vitals for patient
                await db.ref(`vitals/${patientId}`).remove();
                res.json({ message: 'All vital records deleted' });
            }
        } else {
            res.status(503).json({ error: 'Vital signs deletion not available in demo mode' });
        }
    } catch (error) {
        console.error('Delete vitals error:', error);
        res.status(500).json({ error: 'Failed to delete vital signs' });
    }
});

/**
 * Check for vital sign anomalies and create alerts
 */
async function checkVitalAnomalies(db, patientId, vitalRecord) {
    try {
        const alerts = [];

        // Check heart rate
        if (vitalRecord.heartRate) {
            if (vitalRecord.heartRate < 50 || vitalRecord.heartRate > 120) {
                alerts.push({
                    type: 'abnormal_heart_rate',
                    severity: vitalRecord.heartRate < 40 || vitalRecord.heartRate > 140 ? 'critical' : 'high',
                    message: `Abnormal heart rate: ${vitalRecord.heartRate} bpm`,
                    data: { heartRate: vitalRecord.heartRate }
                });
            }
        }

        // Check respiratory rate
        if (vitalRecord.respiratoryRate) {
            if (vitalRecord.respiratoryRate < 8 || vitalRecord.respiratoryRate > 25) {
                alerts.push({
                    type: 'abnormal_respiration',
                    severity: vitalRecord.respiratoryRate < 6 || vitalRecord.respiratoryRate > 30 ? 'critical' : 'high',
                    message: `Abnormal respiratory rate: ${vitalRecord.respiratoryRate} breaths/min`,
                    data: { respiratoryRate: vitalRecord.respiratoryRate }
                });
            }
        }

        // Check for apnea (very low respiratory rate)
        if (vitalRecord.respiratoryRate && vitalRecord.respiratoryRate < 6) {
            alerts.push({
                type: 'apnea',
                severity: 'critical',
                message: 'Possible apnea detected',
                data: { respiratoryRate: vitalRecord.respiratoryRate }
            });
        }

        // Create alerts in Firebase
        for (const alertData of alerts) {
            const alertId = uuidv4();
            await db.ref(`alerts/${patientId}/${alertId}`).set({
                id: alertId,
                ...alertData,
                status: 'pending',
                timestamp: Date.now(),
                acknowledgedBy: null,
                acknowledgedAt: null,
                resolvedAt: null,
                notificationsSent: {
                    email: false,
                    push: false,
                    sms: false
                }
            });

            // Update patient status
            await db.ref(`patients/${patientId}/status`).set(
                alertData.severity === 'critical' ? 'emergency' : 'warning'
            );
        }
    } catch (error) {
        console.error('Check anomalies error:', error);
    }
}

export default router;
