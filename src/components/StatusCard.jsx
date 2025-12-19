import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

function StatusCard({ status, lastUpdate }) {
    const statusConfig = {
        success: {
            icon: <CheckCircle size={32} />,
            title: '정상',
            description: '모든 생체 신호가 정상 범위입니다',
            color: 'var(--color-success)',
            glow: 'var(--color-success-glow)',
        },
        warning: {
            icon: <AlertTriangle size={32} />,
            title: '주의',
            description: '일부 수치가 정상 범위를 벗어났습니다',
            color: 'var(--color-warning)',
            glow: 'var(--color-warning-glow)',
        },
        danger: {
            icon: <AlertTriangle size={32} />,
            title: '위험',
            description: '즉시 확인이 필요합니다',
            color: 'var(--color-danger)',
            glow: 'var(--color-danger-glow)',
        },
    };

    const config = statusConfig[status];

    return (
        <motion.div
            className="card card-glass mb-lg"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
                border: `2px solid ${config.color}`,
                background: `linear-gradient(135deg, ${config.glow}, var(--bg-card))`,
            }}
        >
            <div className="flex items-center gap-lg">
                <div
                    style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: 'var(--radius-xl)',
                        background: config.glow,
                        color: config.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {config.icon}
                </div>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 'var(--spacing-xs)', color: config.color }}>
                        {config.title}
                    </h2>
                    <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                        {config.description}
                    </p>
                    <div className="flex items-center gap-sm" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        <Clock size={14} />
                        <span>{formatDistanceToNow(lastUpdate, { addSuffix: true, locale: ko })} 업데이트</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default StatusCard;
