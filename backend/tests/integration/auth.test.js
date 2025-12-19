import request from 'supertest';
import app from '../../server.js';

describe('Authentication API', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const userData = {
                email: `test${Date.now()}@example.com`,
                password: 'Test123!@#',
                name: 'Test User',
                phone: '010-1234-5678'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body).toHaveProperty('user');
            expect(response.body).toHaveProperty('token');
            expect(response.body.user.email).toBe(userData.email);
        });

        it('should reject registration with invalid email', async () => {
            const userData = {
                email: 'invalid-email',
                password: 'Test123!@#',
                name: 'Test User'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should reject registration with weak password', async () => {
            const userData = {
                email: 'test@example.com',
                password: '123',
                name: 'Test User'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with demo credentials', async () => {
            const credentials = {
                email: 'demo@example.com',
                password: 'demo123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(credentials)
                .expect(200);

            expect(response.body).toHaveProperty('user');
            expect(response.body).toHaveProperty('token');
            expect(response.body.user.email).toBe(credentials.email);
        });

        it('should reject login with invalid credentials', async () => {
            const credentials = {
                email: 'wrong@example.com',
                password: 'wrongpassword'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(credentials)
                .expect(401);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/auth/me', () => {
        let authToken;

        beforeAll(async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'demo@example.com',
                    password: 'demo123'
                });
            authToken = response.body.token;
        });

        it('should get current user with valid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('email');
        });

        it('should reject request without token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .expect(401);

            expect(response.body).toHaveProperty('error');
        });

        it('should reject request with invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);

            expect(response.body).toHaveProperty('error');
        });
    });
});
