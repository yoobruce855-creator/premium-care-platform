import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { I18nextProvider } from 'react-i18next';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Subscription from './pages/Subscription';
import SensorManagement from './pages/SensorManagement';
import BottomNav from './components/BottomNav';
import EmergencyModal from './components/EmergencyModal';
import LanguageSelector from './components/LanguageSelector';
import { WebSocketClient, getAuthToken, patientsAPI } from './services/api';
import SmartphoneSensorManager from './services/smartphone-sensors';
import i18n from './services/i18n';

function App() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [emergencyAlert, setEmergencyAlert] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentPatient, setCurrentPatient] = useState(null);
    const [vitalData, setVitalData] = useState({
        heartRate: 72,
        respiratoryRate: 16,
        activity: 'normal',
        lastUpdate: new Date()
    });

    const wsClient = useRef(null);
    const sensorManager = useRef(null);

    // Check authentication on mount
    useEffect(() => {
        const token = getAuthToken();
        if (token) {
            setIsAuthenticated(true);
            loadUserData();
        }
    }, []);

    // Load user and patient data
    const loadUserData = async () => {
        try {
            const patients = await patientsAPI.getAll();
            if (patients && patients.length > 0) {
                setCurrentPatient(patients[0]);
                connectWebSocket(patients[0].id);
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    };

    // Connect to WebSocket
    const connectWebSocket = async (patientId) => {
        try {
            wsClient.current = new WebSocketClient();
            await wsClient.current.connect();

            // Subscribe to patient data
            wsClient.current.subscribe(patientId, 'simulator');

            // Listen for vital signs
            wsClient.current.on('vital_signs', (message) => {
                setVitalData({
                    ...message.data,
                    lastUpdate: new Date(message.data.timestamp)
                });
            });

            // Listen for alerts
            wsClient.current.on('alert', (message) => {
                setEmergencyAlert(message.data);

                // Request notification permission and show
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('긴급 알림!', {
                        body: `${message.data.type} 감지됨`,
                        icon: '/icon-192.png',
                        vibrate: [200, 100, 200]
                    });
                }
            });

            console.log('✅ Connected to backend');
        } catch (error) {
            console.error('WebSocket connection failed:', error);
        }
    };

    // Initialize smartphone sensors (optional)
    const initializeSmartphoneSensors = async () => {
        if (!currentPatient) return;

        sensorManager.current = new SmartphoneSensorManager();
        const permissions = await sensorManager.current.requestPermissions();

        if (permissions.some(p => p.granted)) {
            sensorManager.current.startMonitoring((sensorType, data) => {
                // Send sensor data to backend
                if (wsClient.current) {
                    wsClient.current.sendSensorData(currentPatient.id, sensorType, data);
                }
            });
        }
    };

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (wsClient.current) {
                wsClient.current.disconnect();
            }
            if (sensorManager.current) {
                sensorManager.current.stopMonitoring();
            }
        };
    }, []);

    const handleLogin = (user) => {
        setIsAuthenticated(true);
        setCurrentUser(user);
        loadUserData();
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard vitalData={vitalData} patient={currentPatient} />;
            case 'history':
                return <History patient={currentPatient} />;
            case 'subscription':
                return <Subscription />;
            case 'sensors':
                return <SensorManagement />;
            case 'settings':
                return <Settings
                    user={currentUser}
                    patient={currentPatient}
                    onEnableSmartphoneSensors={initializeSmartphoneSensors}
                />;
            default:
                return <Dashboard vitalData={vitalData} patient={currentPatient} />;
        }
    };

    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <I18nextProvider i18n={i18n}>
            <div className="app-container">
                <div className="app-header">
                    <LanguageSelector />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPage}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderPage()}
                    </motion.div>
                </AnimatePresence>
            </div>

            <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />

            <AnimatePresence>
                {emergencyAlert && (
                    <EmergencyModal
                        alert={emergencyAlert}
                        onClose={() => setEmergencyAlert(null)}
                    />
                )}
            </AnimatePresence>
        </I18nextProvider>
    );
}

export default App;
