import express from 'express';
import { authenticateToken } from '../middleware/auth-middleware.js';
import { registerFCMToken, unregisterFCMToken } from '../services/notification-service.js';
import {
    backupFirebaseData,
    restoreFirebaseData,
    listBackups,
    deleteBackup,
    getBackupStats
} from '../services/backup-service.js';
import { strictLimiter } from '../middleware/rate-limit.js';

const router = express.Router();

/**
 * Register FCM token
 * POST /api/notifications/register-token
 */
router.post('/register-token', authenticateToken, async (req, res) => {
    try {
        const { fcmToken, deviceInfo } = req.body;

        if (!fcmToken) {
            return res.status(400).json({ error: 'FCM token is required' });
        }

        const success = await registerFCMToken(req.user.id, fcmToken, deviceInfo);

        if (success) {
            res.json({
                message: 'FCM token registered successfully',
                token: fcmToken.substring(0, 20) + '...'
            });
        } else {
            res.status(500).json({ error: 'Failed to register FCM token' });
        }
    } catch (error) {
        console.error('Register FCM token error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Unregister FCM token
 * POST /api/notifications/unregister-token
 */
router.post('/unregister-token', authenticateToken, async (req, res) => {
    try {
        const { fcmToken } = req.body;

        if (!fcmToken) {
            return res.status(400).json({ error: 'FCM token is required' });
        }

        const success = await unregisterFCMToken(req.user.id, fcmToken);

        if (success) {
            res.json({ message: 'FCM token unregistered successfully' });
        } else {
            res.status(500).json({ error: 'Failed to unregister FCM token' });
        }
    } catch (error) {
        console.error('Unregister FCM token error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Create manual backup
 * POST /api/admin/backup
 */
router.post('/admin/backup', authenticateToken, strictLimiter, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const result = await backupFirebaseData();

        if (result.success) {
            res.json({
                message: 'Backup created successfully',
                backup: result
            });
        } else {
            res.status(500).json({
                error: 'Backup failed',
                reason: result.reason || result.error
            });
        }
    } catch (error) {
        console.error('Backup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * List backups
 * GET /api/admin/backups
 */
router.get('/admin/backups', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const backups = await listBackups();
        const stats = await getBackupStats();

        res.json({
            backups,
            stats
        });
    } catch (error) {
        console.error('List backups error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Restore from backup
 * POST /api/admin/restore
 */
router.post('/admin/restore', authenticateToken, strictLimiter, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { backupFileName } = req.body;

        if (!backupFileName) {
            return res.status(400).json({ error: 'Backup file name is required' });
        }

        const result = await restoreFirebaseData(backupFileName);

        if (result.success) {
            res.json({
                message: 'Restore completed successfully',
                restore: result
            });
        } else {
            res.status(500).json({
                error: 'Restore failed',
                reason: result.error
            });
        }
    } catch (error) {
        console.error('Restore error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Delete backup
 * DELETE /api/admin/backups/:fileName
 */
router.delete('/admin/backups/:fileName', authenticateToken, strictLimiter, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { fileName } = req.params;

        const result = await deleteBackup(fileName);

        if (result.success) {
            res.json({ message: 'Backup deleted successfully' });
        } else {
            res.status(500).json({
                error: 'Failed to delete backup',
                reason: result.error
            });
        }
    } catch (error) {
        console.error('Delete backup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
