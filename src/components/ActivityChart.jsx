import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

function ActivityChart() {
    // Generate sample data for the last 24 hours
    const data = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}시`,
        heartRate: Math.floor(Math.random() * 20) + 65,
        respiratoryRate: Math.floor(Math.random() * 6) + 14,
    }));

    return (
        <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorHeart" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorResp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis
                        dataKey="hour"
                        stroke="#94a3b8"
                        style={{ fontSize: '0.75rem' }}
                    />
                    <YAxis stroke="#94a3b8" style={{ fontSize: '0.75rem' }} />
                    <Tooltip
                        contentStyle={{
                            background: 'rgba(30, 41, 59, 0.95)',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '0.5rem',
                            color: '#f1f5f9',
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="heartRate"
                        stroke="#ef4444"
                        strokeWidth={2}
                        fill="url(#colorHeart)"
                        name="심박수"
                    />
                    <Area
                        type="monotone"
                        dataKey="respiratoryRate"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#colorResp)"
                        name="호흡수"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export default ActivityChart;
