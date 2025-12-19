import { getDatabase } from '../config/firebase.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Backup configuration
 */
const BACKUP_CONFIG = {
    enabled: process.env.BACKUP_ENABLED === 'true',
    schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *', // 2 AM daily
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30,
    backupPath: process.env.BACKUP_PATH || './backups',
    maxBackups: parseInt(process.env.MAX_BACKUPS) || 10
};

/**
 * Create backup directory if it doesn't exist
 */
async function ensureBackupDirectory() {
    try {
        await fs.mkdir(BACKUP_CONFIG.backupPath, { recursive: true });
        return true;
    } catch (error) {
        console.error('Failed to create backup directory:', error);
        return false;
    }
}

/**
 * Export Firebase Realtime Database data
 */
export async function backupFirebaseData() {
    try {
        const db = getDatabase();
        if (!db) {
            console.log('⚠️  Firebase not connected, skipping backup');
            return { success: false, reason: 'Firebase not connected' };
        }

        console.log('📦 Starting Firebase data backup...');

        // Ensure backup directory exists
        await ensureBackupDirectory();

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `firebase-backup-${timestamp}.json`;
        const backupFilePath = path.join(BACKUP_CONFIG.backupPath, backupFileName);

        // Get all data from Firebase
        const snapshot = await db.ref('/').once('value');
        const data = snapshot.val();

        // Add metadata
        const backupData = {
            metadata: {
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                source: 'Premium Care Platform',
                projectId: process.env.FIREBASE_PROJECT_ID
            },
            data: data
        };

        // Write to file
        await fs.writeFile(
            backupFilePath,
            JSON.stringify(backupData, null, 2),
            'utf-8'
        );

        const stats = await fs.stat(backupFilePath);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log(`✅ Backup completed successfully`);
        console.log(`📁 File: ${backupFileName}`);
        console.log(`💾 Size: ${fileSizeMB} MB`);

        // Clean up old backups
        await cleanupOldBackups();

        return {
            success: true,
            fileName: backupFileName,
            filePath: backupFilePath,
            size: stats.size,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ Backup failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Restore Firebase data from backup
 */
export async function restoreFirebaseData(backupFileName) {
    try {
        const db = getDatabase();
        if (!db) {
            throw new Error('Firebase not connected');
        }

        const backupFilePath = path.join(BACKUP_CONFIG.backupPath, backupFileName);

        console.log(`📥 Restoring from backup: ${backupFileName}...`);

        // Read backup file
        const backupContent = await fs.readFile(backupFilePath, 'utf-8');
        const backupData = JSON.parse(backupContent);

        if (!backupData.data) {
            throw new Error('Invalid backup file format');
        }

        // Restore data to Firebase
        await db.ref('/').set(backupData.data);

        console.log('✅ Restore completed successfully');

        return {
            success: true,
            fileName: backupFileName,
            restoredAt: new Date().toISOString(),
            backupTimestamp: backupData.metadata?.timestamp
        };
    } catch (error) {
        console.error('❌ Restore failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * List available backups
 */
export async function listBackups() {
    try {
        await ensureBackupDirectory();

        const files = await fs.readdir(BACKUP_CONFIG.backupPath);
        const backupFiles = files.filter(f => f.startsWith('firebase-backup-') && f.endsWith('.json'));

        const backups = await Promise.all(
            backupFiles.map(async (fileName) => {
                const filePath = path.join(BACKUP_CONFIG.backupPath, fileName);
                const stats = await fs.stat(filePath);

                return {
                    fileName,
                    filePath,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime
                };
            })
        );

        // Sort by creation date (newest first)
        backups.sort((a, b) => b.created - a.created);

        return backups;
    } catch (error) {
        console.error('Failed to list backups:', error);
        return [];
    }
}

/**
 * Clean up old backups
 */
async function cleanupOldBackups() {
    try {
        const backups = await listBackups();

        if (backups.length <= BACKUP_CONFIG.maxBackups) {
            return;
        }

        // Delete oldest backups
        const backupsToDelete = backups.slice(BACKUP_CONFIG.maxBackups);

        for (const backup of backupsToDelete) {
            await fs.unlink(backup.filePath);
            console.log(`🗑️  Deleted old backup: ${backup.fileName}`);
        }

        console.log(`✅ Cleaned up ${backupsToDelete.length} old backups`);
    } catch (error) {
        console.error('Failed to cleanup old backups:', error);
    }
}

/**
 * Delete a specific backup
 */
export async function deleteBackup(backupFileName) {
    try {
        const backupFilePath = path.join(BACKUP_CONFIG.backupPath, backupFileName);
        await fs.unlink(backupFilePath);

        console.log(`🗑️  Deleted backup: ${backupFileName}`);

        return { success: true };
    } catch (error) {
        console.error('Failed to delete backup:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Schedule automatic backups
 */
export function scheduleBackups() {
    if (!BACKUP_CONFIG.enabled) {
        console.log('⚠️  Automatic backups are disabled');
        return null;
    }

    // Using simple interval for demonstration
    // In production, use node-cron or similar
    const backupIntervalMs = 24 * 60 * 60 * 1000; // 24 hours

    console.log('⏰ Scheduled automatic backups (every 24 hours)');

    const intervalId = setInterval(async () => {
        console.log('⏰ Running scheduled backup...');
        await backupFirebaseData();
    }, backupIntervalMs);

    // Run initial backup
    setTimeout(() => {
        console.log('⏰ Running initial backup...');
        backupFirebaseData();
    }, 60000); // 1 minute after startup

    return intervalId;
}

/**
 * Get backup statistics
 */
export async function getBackupStats() {
    try {
        const backups = await listBackups();

        const totalSize = backups.reduce((sum, b) => sum + b.size, 0);
        const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

        return {
            count: backups.length,
            totalSize: totalSize,
            totalSizeMB: totalSizeMB,
            oldest: backups[backups.length - 1]?.created,
            newest: backups[0]?.created,
            backups: backups.map(b => ({
                fileName: b.fileName,
                sizeMB: (b.size / (1024 * 1024)).toFixed(2),
                created: b.created
            }))
        };
    } catch (error) {
        console.error('Failed to get backup stats:', error);
        return null;
    }
}

export default {
    backupFirebaseData,
    restoreFirebaseData,
    listBackups,
    deleteBackup,
    scheduleBackups,
    getBackupStats
};
