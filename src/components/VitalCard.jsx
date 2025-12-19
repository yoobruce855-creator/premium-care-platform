import React from 'react';
import { motion } from 'framer-motion';

function VitalCard({ icon, label, value, unit, trend, color = 'primary' }) {
    const colorMap = {
        primary: 'var(--color-primary)',
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
        info: 'var(--color-info)',
        warning: 'var(--color-warning)',
    };

    const glowMap = {
        primary: 'var(--color-primary-glow)',
        danger: 'var(--color-danger-glow)',
        success: 'var(--color-success-glow)',
        info: 'rgba(59, 130, 246, 0.2)',
        warning: 'var(--color-warning-glow)',
    };

    return (
        <motion.div
            className="vital-card"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <div
                className="vital-icon"
                style={{
                    background: glowMap[color],
                    color: colorMap[color],
                }}
            >
                {icon}
            </div>
            <div className="vital-label">{label}</div>
            <div className="vital-value" style={{ color: colorMap[color] }}>
                {value}
                {unit && <span style={{ fontSize: '1.25rem', marginLeft: '0.25rem' }}>{unit}</span>}
            </div>
            <div className={`vital-trend ${trend}`}>
                {trend === 'stable' && '━ 안정'}
                {trend === 'up' && '↑ 상승'}
                {trend === 'down' && '↓ 하강'}
            </div>
        </motion.div>
    );
}

export default VitalCard;
