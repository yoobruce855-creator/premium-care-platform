import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus } from 'lucide-react';
import { authAPI, setAuthToken } from '../services/api';

function Login({ onLogin }) {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let response;
            if (isRegister) {
                response = await authAPI.register(formData);
            } else {
                response = await authAPI.login({
                    email: formData.email,
                    password: formData.password
                });
            }

            setAuthToken(response.token);
            onLogin(response.user);
        } catch (err) {
            setError(err.message || '로그인에 실패했습니다');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setFormData({ email: 'demo@example.com', password: 'demo123' });
        setLoading(true);

        try {
            const response = await authAPI.login({
                email: 'demo@example.com',
                password: 'demo123'
            });
            setAuthToken(response.token);
            onLogin(response.user);
        } catch (err) {
            setError('데모 로그인 실패');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-xl)'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ maxWidth: '400px', width: '100%' }}
            >
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>
                        우리 부모님
                    </h1>
                    <p style={{ color: 'var(--text-tertiary)' }}>
                        프리미엄 돌봄 서비스
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            color: 'var(--text-tertiary)',
                            marginBottom: 'var(--spacing-xs)'
                        }}>
                            이메일
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-md)',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--text-primary)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            color: 'var(--text-tertiary)',
                            marginBottom: 'var(--spacing-xs)'
                        }}>
                            비밀번호
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-md)',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--text-primary)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    {isRegister && (
                        <>
                            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    color: 'var(--text-tertiary)',
                                    marginBottom: 'var(--spacing-xs)'
                                }}>
                                    이름
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required={isRegister}
                                    style={{
                                        width: '100%',
                                        padding: 'var(--spacing-md)',
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'var(--text-primary)',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    color: 'var(--text-tertiary)',
                                    marginBottom: 'var(--spacing-xs)'
                                }}>
                                    전화번호
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: 'var(--spacing-md)',
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'var(--text-primary)',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                        </>
                    )}

                    {error && (
                        <div style={{
                            padding: 'var(--spacing-md)',
                            background: 'var(--color-danger-glow)',
                            border: '1px solid var(--color-danger)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-danger-light)',
                            fontSize: '0.875rem',
                            marginBottom: 'var(--spacing-lg)'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '100%', marginBottom: 'var(--spacing-md)' }}
                    >
                        {loading ? '처리중...' : (isRegister ? '회원가입' : '로그인')}
                    </button>

                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => setIsRegister(!isRegister)}
                        style={{ width: '100%', marginBottom: 'var(--spacing-md)' }}
                    >
                        {isRegister ? '로그인으로 전환' : '회원가입'}
                    </button>

                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={handleDemoLogin}
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        데모 계정으로 시작하기
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

export default Login;
