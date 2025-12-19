import React from 'react';
import { Home, Clock, Settings, CreditCard, Activity } from 'lucide-react';

function BottomNav({ currentPage, onNavigate }) {
    const navItems = [
        { id: 'dashboard', icon: Home, label: '홈' },
        { id: 'sensors', icon: Activity, label: '센서' },
        { id: 'subscription', icon: CreditCard, label: '구독' },
        { id: 'history', icon: Clock, label: '기록' },
        { id: 'settings', icon: Settings, label: '설정' },
    ];

    return (
        <nav className="bottom-nav">
            <div className="nav-container">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <a
                            key={item.id}
                            href="#"
                            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                onNavigate(item.id);
                            }}
                        >
                            <Icon className="nav-icon" />
                            <span className="nav-label">{item.label}</span>
                        </a>
                    );
                })}
            </div>
        </nav>
    );
}

export default BottomNav;
