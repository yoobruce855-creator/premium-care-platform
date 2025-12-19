import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Wind, TrendingUp, AlertCircle, Phone, Bell } from 'lucide-react';
import VitalCard from '../components/VitalCard';
import StatusCard from '../components/StatusCard';
import ActivityChart from '../components/ActivityChart';

function Dashboard({ vitalData, patient }) {
    const [showNotification, setShowNotification] = useState(false);

    const getStatus = () => {
        if (vitalData.heartRate > 100 || vitalData.heartRate < 60) return 'warning';
        if (vitalData.respiratoryRate > 20 || vitalData.respiratoryRate < 12) return 'warning';
        return 'success';
    };

    const handleEmergencyContact = () => {
        // Show notification
        setShowNotification(true);

        // Simulate emergency call
        if (patient?.emergencyContact) {
            alert(`긴급 연락처로 전화 연결 중...\n${patient.emergencyContact}`);
        } else {
            alert('긴급 연락처가 설정되지 않았습니다.\n설정 페이지에서 연락처를 등록해주세요.');
        }

        // Hide notification after 3 seconds
        setTimeout(() => setShowNotification(false), 3000);
    };

    const handleNotificationSettings = () => {
        // Navigate to settings page (this would be handled by parent component)
        alert('알림 설정 페이지로 이동합니다.');
    };

    const status = getStatus();

    return (
        <div>
            {/* Notification Toast */}
            {showNotification && (
                <motion.div
                    className="notification-toast"
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    style={{
                        position: 'fixed',
                        top: '80px',
                        right: '20px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '16px 24px',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                >
                    <Phone size={20} />
                    <span>긴급 연락 처리 중...</span>
                </motion.div>
            )}

            <header className="page-header">
                <motion.h1
                    className="page-title"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    우리 부모님 건강 모니터링
                </motion.h1>
                <p className="page-subtitle">실시간 건강 상태를 확인하세요</p>
            </header>

            {/* Status Overview */}
            <StatusCard status={status} lastUpdate={vitalData.lastUpdate} />

            {/* Vital Signs Grid */}
            <div className="vital-grid">
                <VitalCard
                    icon={<Heart />}
                    label="심박수"
                    value={vitalData.heartRate}
                    unit="BPM"
                    trend="stable"
                    color="danger"
                />
                <VitalCard
                    icon={<Wind />}
                    label="호흡수"
                    value={vitalData.respiratoryRate}
                    unit="/분"
                    trend="stable"
                    color="info"
                />
                <VitalCard
                    icon={<Activity />}
                    label="활동 상태"
                    value={vitalData.activity === 'normal' ? '정상' : '활동중'}
                    unit=""
                    trend="stable"
                    color="success"
                />
            </div>

            {/* Activity Chart */}
            <div className="card mt-lg">
                <div className="card-header">
                    <h3 className="card-title">
                        <TrendingUp size={20} />
                        24시간 활동 추이
                    </h3>
                </div>
                <ActivityChart />
            </div>

            {/* Quick Actions */}
            <div className="card card-glass mt-lg">
                <div className="card-header">
                    <h3 className="card-title">
                        <AlertCircle size={20} />
                        빠른 작업
                    </h3>
                </div>
                <div className="flex gap-md">
                    <button
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        onClick={handleEmergencyContact}
                    >
                        <Phone size={18} style={{ marginRight: '8px' }} />
                        긴급 연락
                    </button>
                    <button
                        className="btn btn-ghost"
                        style={{ flex: 1 }}
                        onClick={handleNotificationSettings}
                    >
                        <Bell size={18} style={{ marginRight: '8px' }} />
                        알림 설정
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
