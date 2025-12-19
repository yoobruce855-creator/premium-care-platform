# Premium Care Platform - 배포 가이드

## 🎯 배포 아키텍처

**선택된 배포 방식**:
- **프론트엔드**: Vercel (무료)
- **백엔드**: Render (무료)
- **데이터베이스**: Firebase Realtime Database (무료)

## 📋 사전 준비

### 1. 필수 계정 생성
- [Vercel 계정](https://vercel.com/signup) - 프론트엔드 호스팅
- [Render 계정](https://render.com/register) - 백엔드 호스팅
- [Firebase 계정](https://console.firebase.google.com/) - 데이터베이스

### 2. Firebase 프로젝트 설정

#### Firebase Console에서:
1. 새 프로젝트 생성
2. Realtime Database 활성화
3. 프로젝트 설정 > 서비스 계정 > 새 비공개 키 생성
4. JSON 파일 다운로드 (나중에 사용)

## 🚀 백엔드 배포 (Render)

### 방법 1: Render Dashboard 사용

1. **Render 대시보드 접속**
   - https://dashboard.render.com

2. **New Web Service 생성**
   - "New +" 버튼 클릭
   - "Web Service" 선택

3. **저장소 연결**
   - GitHub 저장소 연결 또는
   - 로컬 코드를 GitHub에 푸시 후 연결

4. **설정 입력**
   ```
   Name: premium-care-backend
   Region: Oregon (US West)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: node server.js
   ```

5. **환경 변수 설정**
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string
   
   # Firebase 설정 (다운로드한 JSON 파일에서 복사)
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
   
   # 나중에 프론트엔드 URL로 업데이트
   FRONTEND_URL=https://your-app.vercel.app
   ```

6. **배포**
   - "Create Web Service" 클릭
   - 배포 완료 후 URL 복사 (예: https://premium-care-backend.onrender.com)

### 방법 2: render.yaml 사용

```bash
cd backend
# render.yaml 파일이 이미 생성되어 있습니다
# Render 대시보드에서 "Blueprint" 옵션 선택
```

## 🌐 프론트엔드 배포 (Vercel)

### 방법 1: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm install -g vercel

# 프로젝트 루트에서
cd C:\Users\yoost\.gemini\antigravity\scratch\premium-care-platform

# Vercel 로그인
vercel login

# 배포
vercel

# 환경 변수 설정
vercel env add VITE_API_URL
# 입력: https://premium-care-backend.onrender.com/api

vercel env add VITE_WS_URL
# 입력: wss://premium-care-backend.onrender.com

# 프로덕션 배포
vercel --prod
```

### 방법 2: Vercel Dashboard 사용

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard

2. **New Project**
   - "Add New..." > "Project" 클릭
   - GitHub 저장소 연결

3. **프로젝트 설정**
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   ```

4. **환경 변수 설정**
   ```
   VITE_API_URL=https://premium-care-backend.onrender.com/api
   VITE_WS_URL=wss://premium-care-backend.onrender.com
   ```

5. **Deploy** 클릭

## 🔄 배포 후 설정 업데이트

### 1. 백엔드 환경 변수 업데이트
Render 대시보드에서 `FRONTEND_URL`을 Vercel URL로 업데이트:
```
FRONTEND_URL=https://your-app.vercel.app
```

### 2. Firebase Database Rules 설정
Firebase Console > Realtime Database > Rules:
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "patients": {
      "$patientId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

## ✅ 배포 확인

### 1. 백엔드 Health Check
```bash
curl https://premium-care-backend.onrender.com/health
```

예상 응답:
```json
{
  "status": "ok",
  "timestamp": "2025-12-18T10:25:00.000Z",
  "firebase": "connected",
  "version": "1.0.0"
}
```

### 2. 프론트엔드 접속
브라우저에서 Vercel URL 접속:
- 로그인 페이지 확인
- PWA 설치 가능 확인
- 모바일 반응형 확인

### 3. 기능 테스트
1. 회원가입/로그인
2. 대시보드에서 실시간 데이터 확인
3. WebSocket 연결 확인 (브라우저 콘솔)
4. 알림 권한 요청 확인

## 🎨 로컬 개발 환경

### 환경 변수 설정

**프론트엔드 `.env`**:
```bash
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
```

**백엔드 `.env`**:
```bash
PORT=5000
NODE_ENV=development
JWT_SECRET=dev-secret-key
FRONTEND_URL=http://localhost:3000

# Firebase (선택사항 - 없으면 데모 모드)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-email@project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### 로컬 실행
```bash
# 터미널 1: 백엔드
cd backend
npm install
node server.js

# 터미널 2: 프론트엔드
npm install
npm run dev
```

## 🔧 문제 해결

### CORS 에러
백엔드 `.env`에서 `FRONTEND_URL`이 올바른지 확인

### WebSocket 연결 실패
- Render 무료 플랜은 WebSocket 지원
- URL이 `wss://` (HTTPS의 경우)인지 확인

### Firebase 연결 실패
- 환경 변수가 올바른지 확인
- Private Key에 `\n`이 포함되어 있는지 확인
- Firebase Database Rules 확인

### 빌드 실패
```bash
# 로컬에서 빌드 테스트
npm run build
```

## 📱 PWA 설치

배포 후 사용자는:
1. 모바일 브라우저에서 사이트 접속
2. "홈 화면에 추가" 또는 "설치" 버튼 클릭
3. 앱처럼 사용 가능

## 🔐 보안 체크리스트

- [ ] JWT_SECRET을 강력한 랜덤 문자열로 변경
- [ ] Firebase Private Key 안전하게 보관
- [ ] 환경 변수에 민감 정보 저장 (코드에 하드코딩 금지)
- [ ] HTTPS 사용 (Vercel/Render 자동 제공)
- [ ] Firebase Database Rules 설정
- [ ] CORS 설정 확인

## 💰 비용

**모두 무료!**
- Vercel: 무료 플랜 (충분함)
- Render: 무료 플랜 (750시간/월)
- Firebase: Spark 플랜 (무료, 제한적)

## 📊 모니터링

### Vercel
- 대시보드에서 배포 로그 확인
- Analytics 활성화 가능

### Render
- 대시보드에서 서버 로그 확인
- 메트릭 모니터링

### Firebase
- Console에서 데이터베이스 사용량 확인
- 실시간 연결 수 모니터링

## 🚀 다음 단계

1. **도메인 연결** (선택사항)
   - Vercel에서 커스텀 도메인 설정
   - 예: care.yourdomain.com

2. **이메일 알림 설정**
   - Gmail App Password 생성
   - 백엔드 환경 변수에 추가

3. **분석 도구 추가**
   - Google Analytics
   - Sentry (에러 추적)

4. **성능 최적화**
   - 이미지 최적화
   - 코드 스플리팅
   - 캐싱 전략
