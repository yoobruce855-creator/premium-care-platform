import { useState, useEffect } from 'react';
import { Activity, Smartphone, Wifi, Battery, MapPin, Sun, Compass, Radio } from 'lucide-react';
import SmartphoneSensorManager from '../services/smartphone-sensors';
import '../styles/SensorManagement.css';

const SensorManagement = () => {
    const [sensorManager] = useState(() => new SmartphoneSensorManager());
    const [sensorData, setSensorData] = useState({});
    const [sensorStatus, setSensorStatus] = useState({});
    const [supported, setSupported] = useState({});
    const [monitoring, setMonitoring] = useState(false);

    useEffect(() => {
        const supportedSensors = SmartphoneSensorManager.isSupported();
        setSupported(supportedSensors);

        return () => {
            if (monitoring) {
                sensorManager.stopMonitoring();
            }
        };
    }, []);

    const handleSensorData = (type, data) => {
        setSensorData(prev => ({
            ...prev,
            [type]: data
        }));
    };

    const toggleMonitoring = async () => {
        if (monitoring) {
            sensorManager.stopMonitoring();
            setMonitoring(false);
            setSensorStatus({});
        } else {
            try {
                await sensorManager.requestPermissions();
                const results = await sensorManager.startMonitoring(handleSensorData, {
                    enableCamera: false,
                    enableSound: false
                });
                setSensorStatus(results);
                setMonitoring(true);
            } catch (error) {
                console.error('Start monitoring error:', error);
                alert('센서 활성화 중 오류가 발생했습니다.');
            }
        }
    };

    const formatValue = (value) => {
        if (typeof value === 'number') {
            return value.toFixed(2);
        }
        if (typeof value === 'boolean') {
            return value ? '예' : '아니오';
        }
        return value || 'N/A';
    };

    const sensors = [
        {
            id: 'accelerometer',
            name: '가속도계',
            icon: <Activity />,
            color: '#667eea',
            fields: ['x', 'y', 'z', 'magnitude']
        },
        {
            id: 'gyroscope',
            name: '자이로스코프',
            icon: <Compass />,
            color: '#764ba2',
            fields: ['alpha', 'beta', 'gamma']
        },
        {
            id: 'gps',
            name: 'GPS',
            icon: <MapPin />,
            color: '#f093fb',
            fields: ['latitude', 'longitude', 'accuracy']
        },
        {
            id: 'battery',
            name: '배터리',
            icon: <Battery />,
            color: '#4facfe',
            fields: ['level', 'charging']
        },
        {
            id: 'network',
            name: '네트워크',
            icon: <Wifi />,
            color: '#43e97b',
            fields: ['effectiveType', 'online', 'downlink']
        },
        {
            id: 'light',
            name: '조도 센서',
            icon: <Sun />,
            color: '#fa709a',
            fields: ['illuminance']
        },
        {
            id: 'magnetometer',
            name: '자기장 센서',
            icon: <Radio />,
            color: '#30cfd0',
            fields: ['x', 'y', 'z', 'heading']
        }
    ];

    return (
        <div className="sensor-management-page">
            <div className="sensor-header">
                <h1>센서 관리</h1>
                <p>스마트폰의 모든 센서를 실시간으로 모니터링하세요</p>
            </div>

            <div className="control-panel">
                <button
                    className={`btn-toggle ${monitoring ? 'active' : ''}`}
                    onClick={toggleMonitoring}
                >
                    <Smartphone />
                    {monitoring ? '모니터링 중지' : '모니터링 시작'}
                </button>
            </div>

            <div className="sensors-grid">
                {sensors.map((sensor) => {
                    const isSupported = supported[sensor.id];
                    const isActive = sensorStatus[sensor.id];
                    const data = sensorData[sensor.id];

                    return (
                        <div
                            key={sensor.id}
                            className={`sensor-card ${isActive ? 'active' : ''} ${!isSupported ? 'disabled' : ''}`}
                            style={{ '--sensor-color': sensor.color }}
                        >
                            <div className="sensor-card-header">
                                <div className="sensor-icon" style={{ color: sensor.color }}>
                                    {sensor.icon}
                                </div>
                                <div className="sensor-info">
                                    <h3>{sensor.name}</h3>
                                    <span className={`status ${isActive ? 'active' : 'inactive'}`}>
                                        {!isSupported ? '지원 안 됨' : isActive ? '활성' : '비활성'}
                                    </span>
                                </div>
                            </div>

                            {data && (
                                <div className="sensor-data">
                                    {sensor.fields.map((field) => (
                                        data[field] !== undefined && (
                                            <div key={field} className="data-row">
                                                <span className="data-label">{field}:</span>
                                                <span className="data-value">{formatValue(data[field])}</span>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}

                            {!data && isActive && (
                                <div className="sensor-loading">데이터 수집 중...</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SensorManagement;
