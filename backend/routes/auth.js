import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase, isConnected } from '../config/firebase.js';
import { authenticateToken } from '../middleware/auth-middleware.js';

const router = express.Router();

// JWT Secret with fallback for development
const JWT_SECRET = process.env.JWT_SECRET || 'premium-care-development-jwt-secret-key-2024';

if (!process.env.JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET not set in environment, using development fallback');
    console.warn('💡 Set JWT_SECRET in production for security');
}

// Demo user credentials (works both with and without Firebase)
const DEMO_USER = {
    id: 'demo-user-1',
    email: 'demo@example.com',
    password: '$2a$10$C2frcsZ9k6epkzDi1mTVP.mwy5PtOAB8GjkcEFA6cIroRxJReNN1.', // demo123
    name: '데모 사용자',
    phone: '010-1234-5678',
    role: 'guardian',
    createdAt: Date.now()
};

/**
 * Generate JWT access token
 */
function generateAccessToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}

/**
 * Generate refresh token
 */
function generateRefreshToken(user) {
    return jwt.sign(
        { id: user.id },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;

        // Validation
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const db = getDatabase();
        const userId = uuidv4();

        if (db) {
            // Check if user already exists
            const usersSnapshot = await db.ref('users').orderByChild('email').equalTo(email).once('value');
            if (usersSnapshot.exists()) {
                return res.status(409).json({ error: 'User already exists' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const newUser = {
                id: userId,
                email,
                password: hashedPassword,
                name,
                phone: phone || '',
                role: 'guardian',
                profileImage: '',
                subscription: {
                    plan: 'free',
                    status: 'active',
                    startDate: Date.now(),
                    endDate: null
                },
                settings: {
                    notifications: {
                        email: true,
                        push: true,
                        sms: false
                    },
                    language: 'ko',
                    timezone: 'Asia/Seoul'
                },
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            await db.ref(`users/${userId}`).set(newUser);

            // Generate tokens
            const accessToken = generateAccessToken(newUser);
            const refreshToken = generateRefreshToken(newUser);

            // Save session
            await db.ref(`sessions/${uuidv4()}`).set({
                userId,
                token: await bcrypt.hash(accessToken, 10),
                refreshToken: await bcrypt.hash(refreshToken, 10),
                deviceInfo: {
                    userAgent: req.get('user-agent'),
                    ip: req.ip,
                    deviceType: 'web'
                },
                createdAt: Date.now(),
                expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
                lastActivity: Date.now()
            });

            // Return user without password
            const { password: _, ...userWithoutPassword } = newUser;

            res.status(201).json({
                user: userWithoutPassword,
                token: accessToken,
                refreshToken
            });
        } else {
            // Demo mode
            res.status(503).json({
                error: 'Registration not available in demo mode',
                message: 'Please configure Firebase to enable user registration'
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check demo account first (works regardless of Firebase connection)
        if (email === DEMO_USER.email) {
            const isValidDemoPassword = await bcrypt.compare(password, DEMO_USER.password);
            if (isValidDemoPassword) {
                const accessToken = generateAccessToken(DEMO_USER);
                const refreshToken = generateRefreshToken(DEMO_USER);

                const { password: _, ...userWithoutPassword } = DEMO_USER;

                console.log('✅ Demo user login successful');
                return res.json({
                    user: userWithoutPassword,
                    token: accessToken,
                    refreshToken,
                    demo: true
                });
            }
        }

        const db = getDatabase();

        if (db) {
            // Find user by email in Firebase
            const usersSnapshot = await db.ref('users').orderByChild('email').equalTo(email).once('value');

            if (!usersSnapshot.exists()) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const users = usersSnapshot.val();
            const userId = Object.keys(users)[0];
            const user = users[userId];

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate tokens
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            // Save session
            await db.ref(`sessions/${uuidv4()}`).set({
                userId: user.id,
                token: await bcrypt.hash(accessToken, 10),
                refreshToken: await bcrypt.hash(refreshToken, 10),
                deviceInfo: {
                    userAgent: req.get('user-agent'),
                    ip: req.ip,
                    deviceType: 'web'
                },
                createdAt: Date.now(),
                expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
                lastActivity: Date.now()
            });

            // Update last login
            await db.ref(`users/${user.id}/updatedAt`).set(Date.now());

            // Return user without password
            const { password: _, ...userWithoutPassword } = user;

            console.log('✅ Firebase user login successful:', email);
            res.json({
                user: userWithoutPassword,
                token: accessToken,
                refreshToken
            });
        } else {
            // Demo mode only - Firebase not connected
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token required' });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, JWT_SECRET);
        const db = getDatabase();

        if (db) {
            const userSnapshot = await db.ref(`users/${decoded.id}`).once('value');
            const user = userSnapshot.val();

            if (!user) {
                return res.status(401).json({ error: 'User not found' });
            }

            // Generate new access token
            const accessToken = generateAccessToken(user);

            res.json({ token: accessToken });
        } else {
            // Demo mode
            if (decoded.id === DEMO_USER.id) {
                const accessToken = generateAccessToken(DEMO_USER);
                return res.json({ token: accessToken });
            }

            res.status(401).json({ error: 'Invalid refresh token' });
        }
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Refresh token expired' });
        }
        console.error('Token refresh error:', error);
        res.status(403).json({ error: 'Invalid refresh token' });
    }
});

/**
 * POST /api/auth/logout
 * Logout user (invalidate session)
 */
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const db = getDatabase();

        if (db) {
            // Remove all sessions for this user
            const sessionsSnapshot = await db.ref('sessions').orderByChild('userId').equalTo(userId).once('value');
            const sessions = sessionsSnapshot.val();

            if (sessions) {
                const updates = {};
                Object.keys(sessions).forEach(sessionId => {
                    updates[`sessions/${sessionId}`] = null;
                });
                await db.ref().update(updates);
            }
        }

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Failed to logout' });
    }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const db = getDatabase();

        if (db) {
            const userSnapshot = await db.ref(`users/${userId}`).once('value');
            const user = userSnapshot.val();

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const { password: _, ...userWithoutPassword } = user;
            res.json(userWithoutPassword);
        } else {
            // Demo mode
            if (userId === DEMO_USER.id) {
                const { password: _, ...userWithoutPassword } = DEMO_USER;
                return res.json(userWithoutPassword);
            }

            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, phone, profileImage, settings } = req.body;
        const db = getDatabase();

        if (db) {
            const updates = {
                updatedAt: Date.now()
            };

            if (name) updates.name = name;
            if (phone) updates.phone = phone;
            if (profileImage) updates.profileImage = profileImage;
            if (settings) updates.settings = settings;

            await db.ref(`users/${userId}`).update(updates);

            const userSnapshot = await db.ref(`users/${userId}`).once('value');
            const user = userSnapshot.val();
            const { password: _, ...userWithoutPassword } = user;

            res.json(userWithoutPassword);
        } else {
            res.status(503).json({ error: 'Profile update not available in demo mode' });
        }
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post('/change-password', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        const db = getDatabase();

        if (db) {
            const userSnapshot = await db.ref(`users/${userId}`).once('value');
            const user = userSnapshot.val();

            // Verify current password
            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await db.ref(`users/${userId}`).update({
                password: hashedPassword,
                updatedAt: Date.now()
            });

            res.json({ message: 'Password changed successfully' });
        } else {
            res.status(503).json({ error: 'Password change not available in demo mode' });
        }
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

export default router;
