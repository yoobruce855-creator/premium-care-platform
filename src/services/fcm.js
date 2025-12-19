// Firebase Cloud Messaging service for frontend
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';
import api from './api';

// Firebase configuration (should match your Firebase project)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let messaging = null;
let isSupported = false;

/**
 * Initialize Firebase Messaging
 */
export async function initializeMessaging() {
    try {
        // Check if messaging is supported
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return false;
        }

        if (!('serviceWorker' in navigator)) {
            console.warn('Service Worker not supported');
            return false;
        }

        // Initialize Firebase app
        const app = initializeApp(firebaseConfig);
        messaging = getMessaging(app);
        isSupported = true;

        console.log('✅ Firebase Messaging initialized');
        return true;
    } catch (error) {
        console.error('Failed to initialize Firebase Messaging:', error);
        return false;
    }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            console.log('✅ Notification permission granted');
            return true;
        } else if (permission === 'denied') {
            console.warn('⚠️  Notification permission denied');
            return false;
        } else {
            console.log('ℹ️  Notification permission dismissed');
            return false;
        }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
    }
}

/**
 * Get FCM token
 */
export async function getFCMToken() {
    try {
        if (!messaging || !isSupported) {
            console.warn('Firebase Messaging not initialized');
            return null;
        }

        // Get registration token
        const currentToken = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
        });

        if (currentToken) {
            console.log('✅ FCM token obtained');
            return currentToken;
        } else {
            console.warn('No registration token available');
            return null;
        }
    } catch (error) {
        console.error('An error occurred while retrieving token:', error);
        return null;
    }
}

/**
 * Register FCM token with backend
 */
export async function registerFCMToken() {
    try {
        // Request permission first
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) {
            return { success: false, reason: 'Permission denied' };
        }

        // Get FCM token
        const token = await getFCMToken();
        if (!token) {
            return { success: false, reason: 'Failed to get token' };
        }

        // Register with backend
        const deviceInfo = {
            platform: navigator.platform,
            userAgent: navigator.userAgent
        };

        const response = await api.post('/notifications/register-token', {
            fcmToken: token,
            deviceInfo
        });

        console.log('✅ FCM token registered with backend');

        // Store token locally
        localStorage.setItem('fcm_token', token);

        return { success: true, token };
    } catch (error) {
        console.error('Failed to register FCM token:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Unregister FCM token
 */
export async function unregisterFCMToken() {
    try {
        const token = localStorage.getItem('fcm_token');
        if (!token) {
            return { success: true };
        }

        await api.post('/notifications/unregister-token', {
            fcmToken: token
        });

        localStorage.removeItem('fcm_token');
        console.log('✅ FCM token unregistered');

        return { success: true };
    } catch (error) {
        console.error('Failed to unregister FCM token:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Setup foreground message handler
 */
export function setupForegroundMessageHandler(callback) {
    if (!messaging || !isSupported) {
        console.warn('Firebase Messaging not initialized');
        return null;
    }

    // Handle foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
        console.log('📱 Foreground message received:', payload);

        const { notification, data } = payload;

        // Show browser notification
        if (notification) {
            showBrowserNotification(notification, data);
        }

        // Call custom callback
        if (callback) {
            callback(payload);
        }
    });

    return unsubscribe;
}

/**
 * Show browser notification
 */
function showBrowserNotification(notification, data = {}) {
    if (!('Notification' in window)) {
        return;
    }

    if (Notification.permission !== 'granted') {
        return;
    }

    const options = {
        body: notification.body,
        icon: notification.icon || '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: data.severity === 'critical' ? [200, 100, 200, 100, 200] : [100, 50, 100],
        requireInteraction: data.severity === 'critical',
        tag: data.type || 'general',
        renotify: true,
        data: data
    };

    const notif = new Notification(notification.title, options);

    notif.onclick = function (event) {
        event.preventDefault();
        window.focus();

        // Navigate to relevant page
        if (data.link) {
            window.location.href = data.link;
        }

        notif.close();
    };
}

/**
 * Check if notifications are enabled
 */
export function areNotificationsEnabled() {
    return Notification.permission === 'granted' && !!localStorage.getItem('fcm_token');
}

/**
 * Get notification permission status
 */
export function getNotificationPermissionStatus() {
    if (!('Notification' in window)) {
        return 'unsupported';
    }
    return Notification.permission;
}

export default {
    initializeMessaging,
    requestNotificationPermission,
    getFCMToken,
    registerFCMToken,
    unregisterFCMToken,
    setupForegroundMessageHandler,
    areNotificationsEnabled,
    getNotificationPermissionStatus
};
