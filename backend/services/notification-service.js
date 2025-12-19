import nodemailer from 'nodemailer';
import { getDatabase, getMessaging } from '../config/firebase.js';

/**
 * Email transporter configuration
 */
let transporter = null;

function getTransporter() {
    if (!transporter && process.env.EMAIL_USER) {
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }
    return transporter;
}

/**
 * FCM messaging instance
 */
let messaging = null;

function getMessagingInstance() {
    if (!messaging) {
        try {
            messaging = getMessaging();
        } catch (error) {
            console.warn('FCM not configured:', error.message);
        }
    }
    return messaging;
}

/**
 * Send notification to guardian
 */
export async function sendNotification(guardianId, notification) {
    try {
        const db = getDatabase();
        if (!db) {
            console.log('📧 Notification (demo mode):', notification.title);
            return;
        }

        // Get guardian info
        const guardianSnapshot = await db.ref(`users/${guardianId}`).once('value');
        const guardian = guardianSnapshot.val();

        if (!guardian) {
            console.error('Guardian not found:', guardianId);
            return;
        }

        // Store notification in database
        const notificationId = `notif_${Date.now()}`;
        await db.ref(`notifications/${guardianId}/${notificationId}`).set({
            id: notificationId,
            ...notification,
            timestamp: Date.now(),
            read: false
        });

        // Send email notification if configured
        if (guardian.email && notification.data?.severity === 'critical') {
            await sendEmailNotification(guardian.email, notification);
        }

        // Send push notification (FCM)
        const fcmTokens = await getUserFCMTokens(guardianId);
        if (fcmTokens.length > 0) {
            const pushResult = await sendPushNotification(fcmTokens, notification);

            // Clean up invalid tokens
            if (pushResult.invalidTokens && pushResult.invalidTokens.length > 0) {
                await cleanupInvalidTokens(guardianId, pushResult.invalidTokens);
            }

            console.log(`📱 Push notification result: ${pushResult.success} sent, ${pushResult.failure} failed`);
        }

        console.log(`✅ Notification sent to ${guardian.name}`);
    } catch (error) {
        console.error('Send notification error:', error);
    }
}

/**
 * Send email notification
 */
async function sendEmailNotification(email, notification) {
    try {
        const transport = getTransporter();
        if (!transport) {
            console.log('📧 Email not configured, skipping email notification');
            return;
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `[긴급] ${notification.title}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🚨 긴급 알림</h1>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1e293b; margin-top: 0;">${notification.title}</h2>
            <p style="font-size: 16px; color: #475569; line-height: 1.6;">
              ${notification.body}
            </p>
            ${notification.data?.location ? `
              <p style="font-size: 14px; color: #64748b;">
                <strong>위치:</strong> ${notification.data.location}
              </p>
            ` : ''}
            <p style="font-size: 14px; color: #64748b;">
              <strong>시간:</strong> ${new Date(notification.data?.timestamp || Date.now()).toLocaleString('ko-KR')}
            </p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                이 알림은 우리 부모님 돌봄 플랫폼에서 자동으로 발송되었습니다.
              </p>
            </div>
          </div>
        </div>
      `
        };

        await transport.sendMail(mailOptions);
        console.log(`📧 Email sent to ${email}`);
    } catch (error) {
        console.error('Send email error:', error);
    }
}

/**
 * Send push notification (FCM)
 */
async function sendPushNotification(fcmTokens, notification) {
    try {
        const fcm = getMessagingInstance();
        if (!fcm) {
            console.log('📱 FCM not configured, skipping push notification');
            return { success: false, reason: 'FCM not configured' };
        }

        // Ensure fcmTokens is an array
        const tokens = Array.isArray(fcmTokens) ? fcmTokens : [fcmTokens];
        const validTokens = tokens.filter(token => token && typeof token === 'string');

        if (validTokens.length === 0) {
            console.log('📱 No valid FCM tokens provided');
            return { success: false, reason: 'No valid tokens' };
        }

        // Prepare FCM message
        const message = {
            notification: {
                title: notification.title,
                body: notification.body,
                imageUrl: notification.imageUrl
            },
            data: {
                ...notification.data,
                timestamp: String(Date.now()),
                click_action: 'FLUTTER_NOTIFICATION_CLICK'
            },
            android: {
                priority: notification.data?.severity === 'critical' ? 'high' : 'normal',
                notification: {
                    sound: notification.data?.severity === 'critical' ? 'emergency' : 'default',
                    channelId: notification.data?.severity === 'critical' ? 'emergency_alerts' : 'general_alerts',
                    priority: notification.data?.severity === 'critical' ? 'max' : 'default',
                    defaultVibrateTimings: true
                }
            },
            apns: {
                payload: {
                    aps: {
                        alert: {
                            title: notification.title,
                            body: notification.body
                        },
                        sound: notification.data?.severity === 'critical' ? 'emergency.caf' : 'default',
                        badge: 1,
                        'content-available': 1
                    }
                }
            },
            webpush: {
                notification: {
                    title: notification.title,
                    body: notification.body,
                    icon: '/icon-192x192.png',
                    badge: '/badge-72x72.png',
                    vibrate: notification.data?.severity === 'critical' ? [200, 100, 200, 100, 200] : [100, 50, 100],
                    requireInteraction: notification.data?.severity === 'critical',
                    tag: notification.data?.type || 'general',
                    renotify: true
                },
                fcmOptions: {
                    link: notification.data?.link || '/'
                }
            }
        };

        // Send to multiple tokens
        const results = {
            success: 0,
            failure: 0,
            invalidTokens: [],
            errors: []
        };

        for (const token of validTokens) {
            try {
                await fcm.send({ ...message, token });
                results.success++;
                console.log(`📱 Push notification sent to token: ${token.substring(0, 20)}...`);
            } catch (error) {
                results.failure++;

                // Handle invalid tokens
                if (error.code === 'messaging/invalid-registration-token' ||
                    error.code === 'messaging/registration-token-not-registered') {
                    results.invalidTokens.push(token);
                    console.warn(`📱 Invalid FCM token: ${token.substring(0, 20)}...`);
                } else {
                    results.errors.push({
                        token: token.substring(0, 20),
                        error: error.message
                    });
                    console.error(`📱 Failed to send push notification:`, error.message);
                }
            }
        }

        return results;
    } catch (error) {
        console.error('Send push notification error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Register FCM token for a user
 */
export async function registerFCMToken(userId, fcmToken, deviceInfo = {}) {
    try {
        const db = getDatabase();
        if (!db) {
            console.log('📱 Database not available, cannot register FCM token');
            return false;
        }

        const tokenData = {
            token: fcmToken,
            deviceInfo: {
                platform: deviceInfo.platform || 'unknown',
                userAgent: deviceInfo.userAgent || '',
                lastUpdated: Date.now()
            },
            createdAt: Date.now()
        };

        // Store token in user's FCM tokens list
        await db.ref(`users/${userId}/fcmTokens/${fcmToken.substring(0, 20)}`).set(tokenData);

        console.log(`📱 FCM token registered for user: ${userId}`);
        return true;
    } catch (error) {
        console.error('Register FCM token error:', error);
        return false;
    }
}

/**
 * Unregister FCM token
 */
export async function unregisterFCMToken(userId, fcmToken) {
    try {
        const db = getDatabase();
        if (!db) return false;

        await db.ref(`users/${userId}/fcmTokens/${fcmToken.substring(0, 20)}`).remove();
        console.log(`📱 FCM token unregistered for user: ${userId}`);
        return true;
    } catch (error) {
        console.error('Unregister FCM token error:', error);
        return false;
    }
}

/**
 * Get all FCM tokens for a user
 */
async function getUserFCMTokens(userId) {
    try {
        const db = getDatabase();
        if (!db) return [];

        const snapshot = await db.ref(`users/${userId}/fcmTokens`).once('value');
        const tokens = snapshot.val() || {};

        return Object.values(tokens).map(t => t.token);
    } catch (error) {
        console.error('Get user FCM tokens error:', error);
        return [];
    }
}

/**
 * Clean up invalid FCM tokens
 */
export async function cleanupInvalidTokens(userId, invalidTokens) {
    try {
        const db = getDatabase();
        if (!db || !invalidTokens || invalidTokens.length === 0) return;

        for (const token of invalidTokens) {
            await db.ref(`users/${userId}/fcmTokens/${token.substring(0, 20)}`).remove();
        }

        console.log(`📱 Cleaned up ${invalidTokens.length} invalid FCM tokens for user: ${userId}`);
    } catch (error) {
        console.error('Cleanup invalid tokens error:', error);
    }
}

/**
 * Get notifications for a user
 */
export async function getNotifications(userId, limit = 50) {
    try {
        const db = getDatabase();
        if (!db) return [];

        const snapshot = await db.ref(`notifications/${userId}`)
            .orderByKey()
            .limitToLast(limit)
            .once('value');

        const notifications = snapshot.val() || {};
        return Object.values(notifications);
    } catch (error) {
        console.error('Get notifications error:', error);
        return [];
    }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(userId, notificationId) {
    try {
        const db = getDatabase();
        if (!db) return;

        await db.ref(`notifications/${userId}/${notificationId}`).update({
            read: true,
            readAt: Date.now()
        });
    } catch (error) {
        console.error('Mark notification as read error:', error);
    }
}

export default {
    sendNotification,
    getNotifications,
    markNotificationAsRead,
    registerFCMToken,
    unregisterFCMToken,
    cleanupInvalidTokens
};
