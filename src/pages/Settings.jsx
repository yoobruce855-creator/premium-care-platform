import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Phone, User, Shield } from 'lucide-react';

function Settings() {
    const [notifications, setNotifications] = useState(true);
    const [emergencyContact, setEmergencyContact] = useState('010-1234-5678');

    return (
        <div>
            <header className="page-header">
                <motion.h1
                    className="page-title"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    설정
                </motion.h1>
                <p className="page-subtitle">알림 및 계정 설정</p>
            </header>

            {/* Notification Settings */}
            <div className="card mb-lg">
                <div className="card-header">
                    <h3 className="card-title">
                        <Bell size={20} />
                        알림 설정
                    </h3>
                </div>
                <div className="card-body">
                    <div className="flex items-center justify-between mb-md">
                        <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
                                푸시 알림
                            </h4>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                                응급 상황 및 이상 징후 알림 받기
                            </p>
                        </div>
                        <label style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}>
                            <input
                                type="checkbox"
                                checked={notifications}
                                onChange={(e) => setNotifications(e.target.checked)}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span
                                style={{
                                    position: 'absolute',
                                    cursor: 'pointer',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: notifications ? 'var(--color-primary)' : 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius-full)',
                                    transition: 'var(--transition-base)',
                                }}
                            >
                                <span
                                    style={{
                                        position: 'absolute',
                                        content: '',
                                        height: '26px',
                                        width: '26px',
                                        left: notifications ? '30px' : '4px',
                                        bottom: '4px',
                                        background: 'white',
                                        borderRadius: '50%',
                                        transition: 'var(--transition-base)',
                                    }}
                                />
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Emergency Contact */}
            <div className="card mb-lg">
                <div className="card-header">
                    <h3 className="card-title">
                        <Phone size={20} />
                        긴급 연락처
                    </h3>
                </div>
                <div className="card-body">
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                            주 보호자 연락처
                        </span>
                        <input
                            type="tel"
                            value={emergencyContact}
                            onChange={(e) => setEmergencyContact(e.target.value)}
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-md)',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                            }}
                        />
                    </label>
                    <button className="btn btn-primary mt-md">
                        연락처 저장
                    </button>
                </div>
            </div>

            {/* Profile */}
            <div className="card mb-lg">
                <div className="card-header">
                    <h3 className="card-title">
                        <User size={20} />
                        프로필
                    </h3>
                </div>
                <div className="card-body">
                    <div className="flex items-center gap-md mb-md">
                        <div
                            style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                            }}
                        >
                            👴
                        </div>
                        <div>
                            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--spacing-xs)' }}>
                                김철수
                            </h4>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                                82세 · 남성
                            </p>
                        </div>
                    </div>
                    <button className="btn btn-ghost">
                        프로필 수정
                    </button>
                </div>
            </div>

            {/* Privacy */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <Shield size={20} />
                        개인정보 보호
                    </h3>
                </div>
                <div className="card-body">
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-md)' }}>
                        모든 건강 데이터는 암호화되어 안전하게 보관됩니다.
                    </p>
                    <button className="btn btn-ghost">
                        개인정보 처리방침
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Settings;
