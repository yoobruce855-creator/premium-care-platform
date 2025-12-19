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
- 🔥 **Firebase 통합**: 실시간 데이터베이스 및 인증

## 🚀 빠른 시작

### 통합 시작 스크립트 (Windows)

```bash
# 저장소 클론
git clone https://github.com/yoobruce855-creator/premium-care-platform.git
cd premium-care-platform

# 통합 시작 (백엔드 + 프론트엔드)
start-all.bat
```

### 로컬 개발 (수동)

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

앱이 `http://localhost:3000`에서 실행됩니다.

### Backend 실행

```bash
cd backend
npm install
npm start
```

Backend가 `http://localhost:5000`에서 실행됩니다.

## 📦 프로덕션 배포

### ✅ Firebase 설정 완료

- **프로젝트 ID**: `premium-care-platform`
- **Realtime Database**: `https://premium-care-platform-default-rtdb.asia-southeast1.firebasedatabase.app`
- **위치**: `asia-southeast1` (싱가포르)
- **인증**: 이메일/비밀번호 활성화

### 배포 옵션

#### Option 1: Vercel (Frontend) + Render (Backend) ⭐ 권장

**Frontend (Vercel):**
1. [Vercel](https://vercel.com)에 로그인
2. "New Project" 클릭
3. GitHub 저장소 선택
4. 환경 변수 설정:
   ```
   VITE_API_URL=https://[your-backend].onrender.com/api
   VITE_WS_URL=wss://[your-backend].onrender.com
   ```
5. 자동 배포 시작

**Backend (Render):**
1. [Render](https://render.com)에 로그인
2. "New Web Service" 클릭
3. GitHub 저장소 연결
4. Root Directory: `backend`
5. 환경 변수 설정 (Firebase 인증 정보 포함)
6. 배포 시작

상세 가이드: [FINAL_DEPLOYMENT_GUIDE.md](FINAL_DEPLOYMENT_GUIDE.md)

#### Option 2: Netlify (Frontend)

1. [Netlify](https://netlify.com)에 로그인
2. "New site from Git" 클릭
3. GitHub 저장소 선택
4. Build command: `npm run build`
5. Publish directory: `dist`

#### Option 3: Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase deploy
```

## 🔧 환경 변수

### Frontend 환경 변수

`.env` 파일 생성:

```bash
# 로컬 개발
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000

# 프로덕션
VITE_API_URL=https://[your-backend].onrender.com/api
VITE_WS_URL=wss://[your-backend].onrender.com
```

### Backend 환경 변수

`backend/.env` 파일 생성:

```bash
# 서버 설정
PORT=5000
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key

# Firebase 설정
FIREBASE_PROJECT_ID=premium-care-platform
FIREBASE_DATABASE_URL=https://premium-care-platform-default-rtdb.asia-southeast1.firebasedatabase.app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@premium-care-platform.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Stripe 설정 (선택사항)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_BASIC_PRICE_ID=price_xxxxx
STRIPE_PREMIUM_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx

# CORS
FRONTEND_URL=https://[your-frontend].vercel.app
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
- Firebase SDK

### Backend
- Node.js
- Express
- WebSocket
- Firebase Admin SDK
- Stripe
- JWT Authentication

### Database
- Firebase Realtime Database
- Firebase Authentication

### 센서
- Web Sensors API
- Geolocation API
- Battery Status API
- Device Motion/Orientation

## 📖 문서

- [빠른 시작 가이드](QUICK_START.md)
- [프로덕션 배포 가이드](PRODUCTION_DEPLOYMENT.md)
- [최종 배포 가이드](FINAL_DEPLOYMENT_GUIDE.md)
- [Firebase 설정 가이드](FIREBASE_SETUP_GUIDE.md)
- [API 문서](API_DOCUMENTATION.md)
- [배포 가이드](DEPLOYMENT_GUIDE.md)

## 🔐 보안

- JWT 기반 인증
- Firebase Security Rules
- HTTPS/WSS 암호화
- Rate Limiting
- CORS 설정
- 환경 변수 관리

## 🤝 기여

이슈와 PR을 환영합니다!

## 📄 라이선스

MIT License

## 👤 개발자

**yoobruce855-creator**

- GitHub: [@yoobruce855-creator](https://github.com/yoobruce855-creator)

---

Made with ❤️ for elderly care
