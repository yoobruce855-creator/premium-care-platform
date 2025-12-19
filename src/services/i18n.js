import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
    ko: {
        translation: {
            // Navigation
            nav: {
                dashboard: '대시보드',
                history: '기록',
                sensors: '센서',
                subscription: '구독',
                settings: '설정',
                profile: '프로필',
                insights: 'AI 인사이트',
                devices: '하드웨어',
                notifications: '알림'
            },
            // Dashboard
            dashboard: {
                title: '건강 모니터링',
                vitals: '생체 신호',
                heartRate: '심박수',
                bloodPressure: '혈압',
                temperature: '체온',
                oxygen: '산소포화도',
                emergency: '긴급 호출',
                status: '상태',
                normal: '정상',
                warning: '주의',
                critical: '위험'
            },
            // Subscription
            subscription: {
                title: '구독 관리',
                subtitle: '케어 플랫폼의 모든 기능을 활용하세요',
                currentPlan: '현재 구독',
                active: '활성',
                inactive: '비활성',
                cancel: '구독 취소',
                subscribe: '구독하기',
                currentPlanLabel: '현재 플랜',
                processing: '처리 중...',
                free: '무료',
                perMonth: '/월',
                billingHistory: '결제 내역',
                paid: '결제 완료',
                failed: '결제 실패',
                downloadPDF: 'PDF 다운로드'
            },
            // Sensors
            sensors: {
                title: '센서 관리',
                subtitle: '스마트폰의 모든 센서를 실시간으로 모니터링하세요',
                startMonitoring: '모니터링 시작',
                stopMonitoring: '모니터링 중지',
                active: '활성',
                inactive: '비활성',
                notSupported: '지원 안 됨',
                collectingData: '데이터 수집 중...',
                accelerometer: '가속도계',
                gyroscope: '자이로스코프',
                gps: 'GPS',
                battery: '배터리',
                network: '네트워크',
                light: '조도 센서',
                magnetometer: '자기장 센서'
            },
            // Common
            common: {
                loading: '로딩 중...',
                save: '저장',
                cancel: '취소',
                confirm: '확인',
                delete: '삭제',
                edit: '편집',
                close: '닫기',
                search: '검색',
                filter: '필터',
                export: '내보내기',
                import: '가져오기'
            }
        }
    },
    en: {
        translation: {
            // Navigation
            nav: {
                dashboard: 'Dashboard',
                history: 'History',
                sensors: 'Sensors',
                subscription: 'Subscription',
                settings: 'Settings',
                profile: 'Profile',
                insights: 'AI Insights',
                devices: 'Hardware',
                notifications: 'Notifications'
            },
            // Dashboard
            dashboard: {
                title: 'Health Monitoring',
                vitals: 'Vital Signs',
                heartRate: 'Heart Rate',
                bloodPressure: 'Blood Pressure',
                temperature: 'Temperature',
                oxygen: 'Oxygen Saturation',
                emergency: 'Emergency Call',
                status: 'Status',
                normal: 'Normal',
                warning: 'Warning',
                critical: 'Critical'
            },
            // Subscription
            subscription: {
                title: 'Subscription Management',
                subtitle: 'Unlock all features of the care platform',
                currentPlan: 'Current Subscription',
                active: 'Active',
                inactive: 'Inactive',
                cancel: 'Cancel Subscription',
                subscribe: 'Subscribe',
                currentPlanLabel: 'Current Plan',
                processing: 'Processing...',
                free: 'Free',
                perMonth: '/month',
                billingHistory: 'Billing History',
                paid: 'Paid',
                failed: 'Failed',
                downloadPDF: 'Download PDF'
            },
            // Sensors
            sensors: {
                title: 'Sensor Management',
                subtitle: 'Monitor all smartphone sensors in real-time',
                startMonitoring: 'Start Monitoring',
                stopMonitoring: 'Stop Monitoring',
                active: 'Active',
                inactive: 'Inactive',
                notSupported: 'Not Supported',
                collectingData: 'Collecting data...',
                accelerometer: 'Accelerometer',
                gyroscope: 'Gyroscope',
                gps: 'GPS',
                battery: 'Battery',
                network: 'Network',
                light: 'Light Sensor',
                magnetometer: 'Magnetometer'
            },
            // Common
            common: {
                loading: 'Loading...',
                save: 'Save',
                cancel: 'Cancel',
                confirm: 'Confirm',
                delete: 'Delete',
                edit: 'Edit',
                close: 'Close',
                search: 'Search',
                filter: 'Filter',
                export: 'Export',
                import: 'Import'
            }
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: localStorage.getItem('language') || 'ko',
        fallbackLng: 'ko',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
