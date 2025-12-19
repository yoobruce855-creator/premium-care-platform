import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { getDatabase } from '../config/firebase.js';

/**
 * Generate 2FA secret for a user
 */
export async function generate2FASecret(userId, userEmail) {
    try {
        const secret = speakeasy.generateSecret({
            name: `Premium Care (${userEmail})`,
            issuer: 'Premium Care Platform',
            length: 32
        });

        const db = getDatabase();
        if (db) {
            // Store secret in database (encrypted in production)
            await db.ref(`users/${userId}/twoFactor`).set({
                secret: secret.base32,
                enabled: false,
                createdAt: Date.now()
            });
        }

        // Generate QR code
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

        return {
            success: true,
            secret: secret.base32,
            qrCode: qrCodeUrl,
            otpauth_url: secret.otpauth_url
        };
    } catch (error) {
        console.error('Generate 2FA secret error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Verify 2FA token
 */
export async function verify2FAToken(userId, token) {
    try {
        const db = getDatabase();
        if (!db) {
            return { success: false, error: 'Database not available' };
        }

        const snapshot = await db.ref(`users/${userId}/twoFactor`).once('value');
        const twoFactorData = snapshot.val();

        if (!twoFactorData || !twoFactorData.secret) {
            return { success: false, error: '2FA not configured' };
        }

        const verified = speakeasy.totp.verify({
            secret: twoFactorData.secret,
            encoding: 'base32',
            token: token,
            window: 2 // Allow 2 time steps before/after
        });

        return { success: verified };
    } catch (error) {
        console.error('Verify 2FA token error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Enable 2FA for a user
 */
export async function enable2FA(userId, token) {
    try {
        // First verify the token
        const verification = await verify2FAToken(userId, token);
        if (!verification.success) {
            return { success: false, error: 'Invalid token' };
        }

        const db = getDatabase();
        if (!db) {
            return { success: false, error: 'Database not available' };
        }

        // Enable 2FA
        await db.ref(`users/${userId}/twoFactor/enabled`).set(true);
        await db.ref(`users/${userId}/twoFactor/enabledAt`).set(Date.now());

        // Generate backup codes
        const backupCodes = generateBackupCodes();
        await db.ref(`users/${userId}/twoFactor/backupCodes`).set(backupCodes);

        console.log(`✅ 2FA enabled for user: ${userId}`);

        return {
            success: true,
            backupCodes: backupCodes.map(c => c.code)
        };
    } catch (error) {
        console.error('Enable 2FA error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Disable 2FA for a user
 */
export async function disable2FA(userId, password) {
    try {
        const db = getDatabase();
        if (!db) {
            return { success: false, error: 'Database not available' };
        }

        // Verify password before disabling (implement password verification)
        // For now, just disable

        await db.ref(`users/${userId}/twoFactor/enabled`).set(false);
        await db.ref(`users/${userId}/twoFactor/disabledAt`).set(Date.now());

        console.log(`✅ 2FA disabled for user: ${userId}`);

        return { success: true };
    } catch (error) {
        console.error('Disable 2FA error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Generate backup codes
 */
function generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        codes.push({
            code,
            used: false,
            createdAt: Date.now()
        });
    }
    return codes;
}

/**
 * Verify backup code
 */
export async function verifyBackupCode(userId, code) {
    try {
        const db = getDatabase();
        if (!db) {
            return { success: false, error: 'Database not available' };
        }

        const snapshot = await db.ref(`users/${userId}/twoFactor/backupCodes`).once('value');
        const backupCodes = snapshot.val() || [];

        const codeIndex = backupCodes.findIndex(c => c.code === code.toUpperCase() && !c.used);

        if (codeIndex === -1) {
            return { success: false, error: 'Invalid or used backup code' };
        }

        // Mark code as used
        await db.ref(`users/${userId}/twoFactor/backupCodes/${codeIndex}/used`).set(true);
        await db.ref(`users/${userId}/twoFactor/backupCodes/${codeIndex}/usedAt`).set(Date.now());

        console.log(`✅ Backup code used for user: ${userId}`);

        return { success: true };
    } catch (error) {
        console.error('Verify backup code error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Check if 2FA is enabled for a user
 */
export async function is2FAEnabled(userId) {
    try {
        const db = getDatabase();
        if (!db) return false;

        const snapshot = await db.ref(`users/${userId}/twoFactor/enabled`).once('value');
        return snapshot.val() === true;
    } catch (error) {
        console.error('Check 2FA enabled error:', error);
        return false;
    }
}

export default {
    generate2FASecret,
    verify2FAToken,
    enable2FA,
    disable2FA,
    verifyBackupCode,
    is2FAEnabled
};
