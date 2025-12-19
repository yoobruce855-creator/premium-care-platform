import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let db = null;
let isFirebaseConnected = false;

/**
 * Initialize Firebase Admin SDK
 * Production-ready with proper error handling and connection monitoring
 */
export function initializeFirebase() {
    try {
        // Check if Firebase credentials are provided
        if (!process.env.FIREBASE_PROJECT_ID ||
            !process.env.FIREBASE_PRIVATE_KEY ||
            !process.env.FIREBASE_CLIENT_EMAIL ||
            !process.env.FIREBASE_DATABASE_URL) {
            console.log('⚠️  Firebase credentials not found in environment variables');
            console.log('📝 Running in DEMO MODE without Firebase');
            console.log('💡 See FIREBASE_SETUP_GUIDE.md for setup instructions');
            console.log('');
            console.log('Required environment variables:');
            console.log('  - FIREBASE_PROJECT_ID');
            console.log('  - FIREBASE_PRIVATE_KEY');
            console.log('  - FIREBASE_CLIENT_EMAIL');
            console.log('  - FIREBASE_DATABASE_URL');
            return false;
        }

        // Parse private key (handle both escaped and unescaped newlines)
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;
        if (privateKey.includes('\\n')) {
            privateKey = privateKey.replace(/\\n/g, '\n');
        }

        // Validate private key format
        if (!privateKey.includes('BEGIN PRIVATE KEY')) {
            throw new Error('Invalid FIREBASE_PRIVATE_KEY format. Must be a valid PEM private key.');
        }

        const serviceAccount = {
            type: 'service_account',
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key: privateKey,
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
        };

        // Initialize Firebase Admin
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });

        db = admin.database();
        isFirebaseConnected = true;

        // Test connection
        db.ref('.info/connected').on('value', (snapshot) => {
            if (snapshot.val() === true) {
                console.log('✅ Firebase Realtime Database connected');
            } else {
                console.log('⚠️  Firebase Realtime Database disconnected');
            }
        });

        console.log('✅ Firebase Admin SDK initialized successfully');
        console.log(`📊 Project: ${process.env.FIREBASE_PROJECT_ID}`);
        console.log(`🔗 Database: ${process.env.FIREBASE_DATABASE_URL}`);

        return true;
    } catch (error) {
        console.error('❌ Firebase initialization error:', error.message);
        console.log('⚠️  Running in DEMO MODE without Firebase');
        console.log('💡 Check your Firebase credentials in backend/.env');

        if (error.code === 'auth/invalid-credential') {
            console.log('🔑 Invalid service account credentials');
        } else if (error.message.includes('private_key')) {
            console.log('🔑 Check FIREBASE_PRIVATE_KEY format (must include quotes and \\n)');
        }

        return false;
    }
}

/**
 * Get Firebase Realtime Database instance
 * @returns {admin.database.Database | null}
 */
export function getDatabase() {
    return db;
}

/**
 * Check if Firebase is connected
 * @returns {boolean}
 */
export function isConnected() {
    return isFirebaseConnected;
}

/**
 * Get Firebase Auth instance
 * @returns {admin.auth.Auth}
 */
export function getAuth() {
    if (!isFirebaseConnected) {
        throw new Error('Firebase is not initialized. Cannot use Auth.');
    }
    return admin.auth();
}

/**
 * Get Firebase Storage instance
 * @returns {admin.storage.Storage}
 */
export function getStorage() {
    if (!isFirebaseConnected) {
        throw new Error('Firebase is not initialized. Cannot use Storage.');
    }
    return admin.storage();
}

/**
 * Get Firebase Cloud Messaging instance
 * @returns {admin.messaging.Messaging}
 */
export function getMessaging() {
    if (!isFirebaseConnected) {
        throw new Error('Firebase is not initialized. Cannot use Messaging.');
    }
    return admin.messaging();
}

/**
 * Gracefully disconnect from Firebase
 */
export async function disconnect() {
    if (db) {
        await db.goOffline();
        console.log('🔌 Firebase disconnected');
    }
}

export default admin;
