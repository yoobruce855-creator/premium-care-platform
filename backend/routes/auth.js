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

// In-memory user cache for faster response (Firebase backup happens async)
const userCache = new Map();

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

// Add demo user to cache
userCache.set(DEMO_USER.email, DEMO_USER);

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
 * Save user to Firebase in background (non-blocking)
 */
async function saveUserToFirebaseAsync(user) {
    const db = getDatabase();
    if (!db) return;

    try {
        await db.ref(`users/${user.id}`).set(user);
        console.log(`✅ User ${user.email} saved to Firebase`);
    } catch (error) {
        console.error(`⚠️ Firebase save failed for ${user.email}:`, error.message);
        // User is already in cache, so the app still works
    }
}

/**
 * POST /api/auth/register
 * Register a new user - uses cache-first approach for reliability
 */
router.post('/register', async (req, res) => {
    try {
        console.log('📝 회원가입 요청 받음');
        console.log('📝 요청 데이터:', JSON.stringify(req.body));

        const { email, password, name, phone } = req.body;

        // Validation
        if (!email || !password || !name) {
            console.log('❌ 필수 필드 누락');
            return res.status(400).json({ error: '이메일, 비밀번호, 이름은 필수입니다' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: '비밀번호는 최소 6자 이상이어야 합니다' });
        }

        // Check if email already exists in cache
        if (userCache.has(email)) {
            console.log('❌ 이미 존재하는 이메일:', email);
            return res.status(409).json({ error: '이미 등록된 이메일입니다' });
        }

        // Create new user
        const userId = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);

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

        // Save to cache immediately (fast)
        userCache.set(email, newUser);
        console.log('✅ 사용자 캐시에 저장됨:', email);

        // Generate tokens
        const accessToken = generateAccessToken(newUser);
        const refreshToken = generateRefreshToken(newUser);

        // Save to Firebase in background (don't wait)
        saveUserToFirebaseAsync(newUser);

        // Return success immediately
        const { password: _, ...userWithoutPassword } = newUser;

        console.log('✅ 회원가입 성공:', email);
        res.status(201).json({
            user: userWithoutPassword,
            token: accessToken,
            refreshToken,
            message: '회원가입이 완료되었습니다'
        });

    } catch (error) {
        console.error('❌ 회원가입 오류:', error);
        res.status(500).json({ error: '회원가입 중 오류가 발생했습니다' });
    }
});

/**
 * POST /api/auth/login
 * Login user - checks cache first, then Firebase
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요' });
        }

        console.log('🔐 로그인 시도:', email);

        // Check cache first (includes demo user)
        let user = userCache.get(email);

        // If not in cache, try Firebase
        if (!user) {
            const db = getDatabase();
            if (db) {
                try {
                    console.log('🔍 Firebase에서 사용자 검색 중...');
                    const queryPromise = db.ref('users').orderByChild('email').equalTo(email).once('value');
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Firebase 쿼리 타임아웃')), 15000)
                    );
                    const usersSnapshot = await Promise.race([queryPromise, timeoutPromise]);

                    if (usersSnapshot.exists()) {
                        const users = usersSnapshot.val();
                        const userId = Object.keys(users)[0];
                        user = users[userId];
                        // Add to cache for future logins
                        userCache.set(email, user);
                        console.log('✅ Firebase에서 사용자 찾음:', email);
                    }
                } catch (dbError) {
                    console.warn('⚠️ Firebase 쿼리 실패:', dbError.message);
                    // Continue without Firebase
                }
            }
        }

        // User not found
        if (!user) {
            console.log('❌ 사용자 없음:', email);
            return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log('❌ 비밀번호 불일치:', email);
            return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다' });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;

        console.log('✅ 로그인 성공:', email);
        res.json({
            user: userWithoutPassword,
            token: accessToken,
            refreshToken,
            demo: email === DEMO_USER.email
        });

    } catch (error) {
        console.error('❌ 로그인 오류:', error);
        res.status(500).json({ error: '로그인 중 오류가 발생했습니다' });
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
            return res.status(400).json({ error: 'Refresh token이 필요합니다' });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, JWT_SECRET);

        // Find user in cache
        let user = null;
        for (const [email, u] of userCache) {
            if (u.id === decoded.id) {
                user = u;
                break;
            }
        }

        // If not in cache, try Firebase
        if (!user) {
            const db = getDatabase();
            if (db) {
                try {
                    const userSnapshot = await db.ref(`users/${decoded.id}`).once('value');
                    user = userSnapshot.val();
                    if (user) {
                        userCache.set(user.email, user);
                    }
                } catch (err) {
                    console.warn('⚠️ Firebase 사용자 조회 실패');
                }
            }
        }

        if (!user) {
            return res.status(401).json({ error: '사용자를 찾을 수 없습니다' });
        }

        // Generate new access token
        const accessToken = generateAccessToken(user);
        res.json({ token: accessToken });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Refresh token이 만료되었습니다' });
        }
        console.error('토큰 갱신 오류:', error);
        res.status(403).json({ error: '잘못된 refresh token입니다' });
    }
});

/**
 * POST /api/auth/logout
 * Logout user (invalidate session)
 */
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        console.log('👋 로그아웃:', req.user.email);
        res.json({ message: '로그아웃되었습니다' });
    } catch (error) {
        console.error('로그아웃 오류:', error);
        res.status(500).json({ error: '로그아웃 중 오류가 발생했습니다' });
    }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Find user in cache
        let user = null;
        for (const [email, u] of userCache) {
            if (u.id === userId) {
                user = u;
                break;
            }
        }

        // If not in cache, try Firebase
        if (!user) {
            const db = getDatabase();
            if (db) {
                try {
                    const userSnapshot = await db.ref(`users/${userId}`).once('value');
                    user = userSnapshot.val();
                    if (user) {
                        userCache.set(user.email, user);
                    }
                } catch (err) {
                    console.warn('⚠️ Firebase 사용자 조회 실패');
                }
            }
        }

        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);

    } catch (error) {
        console.error('사용자 조회 오류:', error);
        res.status(500).json({ error: '사용자 정보를 가져오는 중 오류가 발생했습니다' });
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

        // Find user in cache
        let user = null;
        let userEmail = null;
        for (const [email, u] of userCache) {
            if (u.id === userId) {
                user = u;
                userEmail = email;
                break;
            }
        }

        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
        }

        // Update user in cache
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (profileImage) user.profileImage = profileImage;
        if (settings) user.settings = settings;
        user.updatedAt = Date.now();

        userCache.set(userEmail, user);

        // Update Firebase in background
        saveUserToFirebaseAsync(user);

        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);

    } catch (error) {
        console.error('프로필 업데이트 오류:', error);
        res.status(500).json({ error: '프로필 업데이트 중 오류가 발생했습니다' });
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
            return res.status(400).json({ error: '현재 비밀번호와 새 비밀번호를 입력해주세요' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: '새 비밀번호는 최소 6자 이상이어야 합니다' });
        }

        // Find user in cache
        let user = null;
        let userEmail = null;
        for (const [email, u] of userCache) {
            if (u.id === userId) {
                user = u;
                userEmail = email;
                break;
            }
        }

        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: '현재 비밀번호가 올바르지 않습니다' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.updatedAt = Date.now();

        userCache.set(userEmail, user);

        // Update Firebase in background
        saveUserToFirebaseAsync(user);

        res.json({ message: '비밀번호가 변경되었습니다' });

    } catch (error) {
        console.error('비밀번호 변경 오류:', error);
        res.status(500).json({ error: '비밀번호 변경 중 오류가 발생했습니다' });
    }
});

export default router;
