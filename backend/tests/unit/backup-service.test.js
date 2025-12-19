import { backupFirebaseData, listBackups, getBackupStats } from '../../services/backup-service.js';
import fs from 'fs/promises';

jest.mock('../../config/firebase.js');
jest.mock('fs/promises');

describe('Backup Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('backupFirebaseData', () => {
        it('should create backup successfully', async () => {
            const mockDatabase = {
                ref: jest.fn(() => ({
                    once: jest.fn(() => Promise.resolve({
                        val: () => ({ users: {}, patients: {} })
                    }))
                }))
            };

            require('../../config/firebase.js').getDatabase.mockReturnValue(mockDatabase);
            fs.mkdir.mockResolvedValue();
            fs.writeFile.mockResolvedValue();
            fs.stat.mockResolvedValue({ size: 1024 });

            const result = await backupFirebaseData();

            expect(result.success).toBe(true);
            expect(result).toHaveProperty('fileName');
            expect(result).toHaveProperty('size');
        });

        it('should handle backup failure', async () => {
            require('../../config/firebase.js').getDatabase.mockReturnValue(null);

            const result = await backupFirebaseData();

            expect(result.success).toBe(false);
            expect(result.reason).toBe('Firebase not connected');
        });
    });

    describe('listBackups', () => {
        it('should list backups successfully', async () => {
            fs.mkdir.mockResolvedValue();
            fs.readdir.mockResolvedValue([
                'firebase-backup-2024-01-01.json',
                'firebase-backup-2024-01-02.json',
                'other-file.txt'
            ]);
            fs.stat.mockResolvedValue({
                size: 1024,
                birthtime: new Date(),
                mtime: new Date()
            });

            const backups = await listBackups();

            expect(backups).toHaveLength(2);
            expect(backups[0]).toHaveProperty('fileName');
            expect(backups[0]).toHaveProperty('size');
        });
    });

    describe('getBackupStats', () => {
        it('should calculate backup statistics', async () => {
            fs.mkdir.mockResolvedValue();
            fs.readdir.mockResolvedValue(['firebase-backup-2024-01-01.json']);
            fs.stat.mockResolvedValue({
                size: 1048576, // 1 MB
                birthtime: new Date(),
                mtime: new Date()
            });

            const stats = await getBackupStats();

            expect(stats).toHaveProperty('count');
            expect(stats).toHaveProperty('totalSizeMB');
            expect(stats.count).toBe(1);
        });
    });
});
