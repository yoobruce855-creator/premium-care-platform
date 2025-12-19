import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

function History() {
    const events = [
        { id: 1, type: 'normal', title: '정상 활동 감지', time: new Date(Date.now() - 1000 * 60 * 15), description: '침실에서 정상적인 움직임 감지됨' },
        { id: 2, type: 'warning', title: '심박수 상승', time: new Date(Date.now() - 1000 * 60 * 60 * 2), description: '심박수가 일시적으로 95 BPM까지 상승' },
        { id: 3, type: 'info', title: '약 복용 시간', time: new Date(Date.now() - 1000 * 60 * 60 * 4), description: '오후 약 복용 알림 전송됨' },
        { id: 4, type: 'normal', title: '수면 종료', time: new Date(Date.now() - 1000 * 60 * 60 * 8), description: '정상적인 기상 패턴 감지' },
        { id: 5, type: 'info', title: '일일 리포트', time: new Date(Date.now() - 1000 * 60 * 60 * 24), description: '어제 활동 요약: 정상 범위' },
    ];

    const getEventIcon = (type) => {
        switch (type) {
            case 'warning':
                return <AlertTriangle size={20} />;
            case 'normal':
                return <CheckCircle size={20} />;
            default:
                return <Info size={20} />;
        }
    };

    const getEventColor = (type) => {
        switch (type) {
            case 'warning':
                return 'warning';
            case 'normal':
                return 'success';
            default:
                return 'info';
        }
    };

    return (
        <div>
            <header className="page-header">
                <motion.h1
                    className="page-title"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    활동 기록
                </motion.h1>
                <p className="page-subtitle">최근 이벤트 및 알림 내역</p>
            </header>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <Clock size={20} />
                        최근 활동
                    </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    {events.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="card card-glass"
                            style={{ padding: 'var(--spacing-lg)' }}
                        >
                            <div className="flex items-center gap-md">
                                <div
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: 'var(--radius-lg)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: `var(--color-${getEventColor(event.type)}-glow)`,
                                        color: `var(--color-${getEventColor(event.type)})`,
                                    }}
                                >
                                    {getEventIcon(event.type)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
                                        {event.title}
                                    </h4>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-xs)' }}>
                                        {event.description}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {formatDistanceToNow(event.time, { addSuffix: true, locale: ko })}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default History;
