import { sendNotification, registerFCMToken, unregisterFCMToken } from '../../services/notification-service.js';

// Mock Firebase
jest.mock('../../config/firebase.js', () => ({
    getDatabase: jest.fn(() => ({
        ref: jest.fn(() => ({
            once: jest.fn(() => Promise.resolve({
                val: () => ({
                    id: 'user123',
                    name: 'Test User',
                    email: 'test@example.com'
                })
            })),
            set: jest.fn(() => Promise.resolve()),
            update: jest.fn(() => Promise.resolve()),
            remove: jest.fn(() => Promise.resolve())
        }))
    })),
    getMessaging: jest.fn(() => ({
        send: jest.fn(() => Promise.resolve())
    }))
}));

describe('Notification Service', () => {
    describe('registerFCMToken', () => {
        it('should register FCM token successfully', async () => {
            const result = await registerFCMToken('user123', 'test-fcm-token', {
                platform: 'web',
                userAgent: 'test-agent'
            });

            expect(result).toBe(true);
        });

        it('should handle registration without device info', async () => {
            const result = await registerFCMToken('user123', 'test-fcm-token');

            expect(result).toBe(true);
        });
    });

    describe('unregisterFCMToken', () => {
        it('should unregister FCM token successfully', async () => {
            const result = await unregisterFCMToken('user123', 'test-fcm-token');

            expect(result).toBe(true);
        });
    });

    describe('sendNotification', () => {
        it('should send notification successfully', async () => {
            const notification = {
                title: 'Test Notification',
                body: 'This is a test',
                data: {
                    severity: 'normal',
                    type: 'test'
                }
            };

            await expect(sendNotification('user123', notification)).resolves.not.toThrow();
        });

        it('should handle critical notifications', async () => {
            const notification = {
                title: 'Critical Alert',
                body: 'Emergency situation',
                data: {
                    severity: 'critical',
                    type: 'emergency'
                }
            };

            await expect(sendNotification('user123', notification)).resolves.not.toThrow();
        });
    });
});
