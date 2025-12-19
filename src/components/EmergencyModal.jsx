import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X, Phone, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

function EmergencyModal({ alert, onClose }) {
    const emergencyTypes = {
        fall: {
            title: '낙상 감지',
            description: '낙상이 감지되었습니다. 즉시 확인이 필요합니다.',
            icon: '🚨',
        },
        apnea: {
            title: '무호흡 감지',
            description: '호흡이 감지되지 않습니다. 긴급 확인이 필요합니다.',
            icon: '⚠️',
        },
        abnormal: {
            title: '이상 징후',
            description: '비정상적인 생체 신호가 감지되었습니다.',
            icon: '⚡',
        },
    };

    const config = emergencyTypes[alert.type] || emergencyTypes.abnormal;

    return (
        <motion.div
            className="emergency-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="emergency-modal"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: 'var(--spacing-lg)',
                        right: 'var(--spacing-lg)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-tertiary)',
                        cursor: 'pointer',
                        padding: 'var(--spacing-sm)',
                    }}
                >
                    <X size={24} />
                </button>

                <div className="emergency-icon">{config.icon}</div>

                <h2
                    className="text-center"
                    style={{
                        fontSize: '2rem',
                        fontWeight: 900,
                        color: 'var(--color-danger)',
                        marginBottom: 'var(--spacing-md)',
                    }}
                >
                    {config.title}
                </h2>

                <p
                    className="text-center"
                    style={{
                        fontSize: '1.125rem',
                        color: 'var(--text-secondary)',
                        marginBottom: 'var(--spacing-xl)',
                    }}
                >
                    {config.description}
                </p>

                <div
                    className="card card-glass mb-lg"
                    style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        padding: 'var(--spacing-lg)',
                    }}
                >
                    <div className="flex items-center gap-md mb-md">
                        <MapPin size={20} style={{ color: 'var(--color-danger)' }} />
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>위치</div>
                            <div style={{ fontSize: '1rem', fontWeight: 600 }}>{alert.location}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-md">
                        <AlertTriangle size={20} style={{ color: 'var(--color-danger)' }} />
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>발생 시간</div>
                            <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                                {format(alert.timestamp, 'PPp', { locale: ko })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-md">
                    <button className="btn btn-danger" style={{ flex: 1 }}>
                        <Phone size={20} />
                        긴급 연락
                    </button>
                    <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>
                        확인
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default EmergencyModal;
