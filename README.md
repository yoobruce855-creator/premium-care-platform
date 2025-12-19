# Premium Care Platform 🏥

실시간 건강 모니터링과 AI 기반 응급 알림 서비스

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yoobruce855-creator/premium-care-platform)

## 🌟 주요 기능

- 📱 **스마트폰 센서 모니터링**: 가속도계, GPS, 자이로스코프 등 9가지 센서
- 🚨 **낙상 감지**: 실시간 충격 감지 및 자동 알림
- 📍 **위치 추적**: GPS 기반 배회 감지
- 💳 **구독 관리**: 4가지 플랜 (Free, Basic, Premium, Enterprise)
- 📊 **실시간 대시보드**: 생체 신호 및 활동 추이 시각화
- 🔔 **푸시 알림**: PWA 기반 긴급 알림
- 🌐 **다국어 지원**: 한국어, English

## 🚀 빠른 시작

### 로컬 개발

```bash
# 저장소 클론
git clone https://github.com/yoobruce855-creator/premium-care-platform.git
cd premium-care-platform

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

앱이 `http://localhost:3000`에서 실행됩니다.

### Backend 실행 (선택사항)

```bash
cd backend
npm install
npm start
```

Backend가 `http://localhost:5000`에서 실행됩니다.

## 📦 배포

### Vercel (권장)

1. [Vercel](https://vercel.com)에 로그인
2. "New Project" 클릭
3. GitHub 저장소 선택
4. 자동 배포 시작

### Netlify

1. [Netlify](https://netlify.com)에 로그인
2. "New site from Git" 클릭
3. GitHub 저장소 선택
4. Build command: `npm run build`
5. Publish directory: `dist`

## 🔧 환경 변수

`.env.example`을 복사하여 `.env` 파일 생성:

```bash
cp .env.example .env
```

### Frontend 환경 변수

```bash
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
```

### Backend 환경 변수

```bash
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key
FIREBASE_PROJECT_ID=your-project-id
STRIPE_SECRET_KEY=your-stripe-key
```

## 📱 PWA 설치

### 데스크톱
- 주소창 오른쪽 설치 아이콘 클릭

### Android
- "홈 화면에 추가" 배너 클릭

### iOS
- Safari > 공유 > "홈 화면에 추가"

## 🛠️ 기술 스택

### Frontend
- React 18
- Vite
- Framer Motion
- Recharts
- i18next

### Backend
- Node.js
- Express
- WebSocket
- Firebase
- Stripe

### 센서
- Web Sensors API
- Geolocation API
- Battery Status API
- Device Motion/Orientation

## 📖 문서

- [센서 구현 가이드](docs/sensor-implementation-guide.md)
- [PWA 설치 가이드](docs/pwa-installation-guide.md)
- [배포 가이드](DEPLOYMENT_GUIDE.md)

## 🤝 기여

이슈와 PR을 환영합니다!

## 📄 라이선스

MIT License

## 👤 개발자

**yoobruce855-creator**

- GitHub: [@yoobruce855-creator](https://github.com/yoobruce855-creator)

---

Made with ❤️ for elderly care
