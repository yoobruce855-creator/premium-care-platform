# 🚀 Premium Care Platform - GitHub & 웹 배포 가이드

## 📋 배포 개요

이 가이드는 Premium Care Platform을 GitHub에 푸시하고 웹에서 실행되도록 배포하는 전체 과정을 안내합니다.

**배포 플랫폼:**
- ✅ **GitHub**: 소스 코드 저장소 (이미 연결됨)
- ✅ **Vercel**: 프론트엔드 호스팅 (무료)
- ✅ **Render**: 백엔드 호스팅 (무료)

---

## 1단계: GitHub에 코드 푸시 ⬆️

### 현재 상태
```
✅ Git 저장소 초기화됨
✅ GitHub 원격 저장소 연결됨 (origin/main)
📝 수정된 파일: payment-service.js, payment-routes.js
📝 새 파일: QUICK_START.md, start-all.bat
```

### 실행할 명령어

```bash
cd C:\Users\yoost\.gemini\antigravity\scratch\premium-care-platform

# 모든 변경사항 스테이징
git add .

# 커밋
git commit -m "feat: Add demo mode support and deployment configuration"

# GitHub에 푸시
git push origin main
```

---

## 2단계: 백엔드 배포 (Render) 🖥️

### 2-1. Render 계정 생성
1. https://render.com 접속
2. "Get Started for Free" 클릭
3. GitHub 계정으로 로그인

### 2-2. 새 Web Service 생성
1. Render 대시보드에서 **"New +"** 클릭
2. **"Web Service"** 선택
3. GitHub 저장소 연결:
   - "Connect a repository" 클릭
   - `premium-care-platform` 저장소 선택

### 2-3. 서비스 설정

| 설정 항목 | 값 |
|----------|-----|
| **Name** | `premium-care-backend` |
| **Region** | `Oregon (US West)` |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | `Free` |

### 2-4. 환경 변수 설정

**Environment Variables** 섹션에서 다음 변수 추가:

```
NODE_ENV=production
PORT=10000
JWT_SECRET=7c0eb85751643e31b282ffb2f31f304483fe4215b38b3c43cfc219e4cf0c8ae474cb00f75f07eea02ab35feb175d7dfab4d6705a49051f1b65857ab92dfebe41
FRONTEND_URL=https://임시값-나중에-업데이트.vercel.app
```

> **참고**: Firebase와 Stripe 환경 변수는 선택사항입니다. 없어도 데모 모드로 작동합니다.

### 2-5. 배포 시작
1. **"Create Web Service"** 클릭
2. 배포 로그 확인 (약 2-3분 소요)
3. 배포 완료 후 **URL 복사** (예: `https://premium-care-backend.onrender.com`)

### 2-6. 배포 확인

브라우저나 PowerShell에서 확인:
```powershell
Invoke-WebRequest -Uri https://premium-care-backend.onrender.com/health
```

**예상 응답:**
```json
{"status":"ok","timestamp":"...","firebase":"demo mode","version":"1.0.0"}
```

---

## 3단계: 프론트엔드 배포 (Vercel) 🌐

### 3-1. Vercel 계정 생성
1. https://vercel.com 접속
2. "Start Deploying" 클릭
3. GitHub 계정으로 로그인

### 3-2. 새 프로젝트 생성
1. Vercel 대시보드에서 **"Add New..."** → **"Project"** 클릭
2. **"Import Git Repository"** 섹션에서:
   - `premium-care-platform` 저장소 선택
   - **"Import"** 클릭

### 3-3. 프로젝트 설정

| 설정 항목 | 값 |
|----------|-----|
| **Framework Preset** | `Vite` |
| **Root Directory** | `./` (기본값) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### 3-4. 환경 변수 설정

**Environment Variables** 섹션에서 다음 변수 추가:

```
VITE_API_URL=https://premium-care-backend.onrender.com/api
VITE_WS_URL=wss://premium-care-backend.onrender.com
```

> **중요**: `premium-care-backend.onrender.com`을 2단계에서 복사한 실제 Render URL로 변경하세요!

### 3-5. 배포 시작
1. **"Deploy"** 클릭
2. 빌드 로그 확인 (약 1-2분 소요)
3. 배포 완료 후 **"Visit"** 클릭하여 사이트 확인
4. **URL 복사** (예: `https://premium-care-platform.vercel.app`)

---

## 4단계: CORS 설정 업데이트 🔄

프론트엔드 URL을 백엔드에 알려줘야 합니다.

### 4-1. Render 대시보드로 돌아가기
1. Render 대시보드 → `premium-care-backend` 서비스 클릭
2. **"Environment"** 탭 클릭

### 4-2. FRONTEND_URL 업데이트
1. `FRONTEND_URL` 변수 찾기
2. 값을 3단계에서 복사한 Vercel URL로 변경
   ```
   FRONTEND_URL=https://premium-care-platform.vercel.app
   ```
3. **"Save Changes"** 클릭
4. 자동으로 재배포됨 (약 1분 소요)

---

## 5단계: 최종 확인 ✅

### 5-1. 프론트엔드 접속
1. Vercel URL 열기: `https://premium-care-platform.vercel.app`
2. 로그인 페이지 또는 대시보드가 표시되는지 확인

### 5-2. 기능 테스트
- ✅ 페이지 로딩
- ✅ 대시보드 표시
- ✅ 실시간 생체 신호 업데이트 (3초마다)
- ✅ 네비게이션 작동
- ✅ 브라우저 콘솔에 에러 없음

### 5-3. WebSocket 연결 확인
1. 브라우저 개발자 도구 열기 (F12)
2. **Network** 탭 → **WS** 필터
3. WebSocket 연결 확인 (초록색 상태)

### 5-4. 모바일 테스트
1. 모바일 기기에서 URL 접속
2. 반응형 디자인 확인
3. PWA 설치 옵션 확인

---

## 🎉 배포 완료!

축하합니다! Premium Care Platform이 이제 웹에서 실행됩니다.

**배포된 URL:**
- 🌐 **프론트엔드**: `https://[your-app].vercel.app`
- 🖥️ **백엔드**: `https://[your-backend].onrender.com`

---

## 📱 사용자에게 공유하기

배포된 URL을 친구나 가족에게 공유하세요:
```
우리 부모님 건강 모니터링 서비스
https://[your-app].vercel.app

모바일에서 "홈 화면에 추가"를 통해 앱처럼 사용할 수 있습니다!
```

---

## 🔧 문제 해결

### 백엔드 연결 실패
- Render 서비스가 실행 중인지 확인
- 무료 플랜은 15분 비활성 후 슬립 모드 (첫 요청 시 30초 소요)
- Health 엔드포인트 확인: `https://[backend-url]/health`

### CORS 에러
- Render의 `FRONTEND_URL`이 정확한 Vercel URL인지 확인
- `https://` 포함, 마지막 `/` 제외

### WebSocket 연결 실패
- `VITE_WS_URL`이 `wss://`로 시작하는지 확인 (HTTPS용)
- Render 무료 플랜은 WebSocket 지원

### 빌드 실패
- 로컬에서 `npm run build` 테스트
- 빌드 로그에서 에러 메시지 확인

---

## 🚀 다음 단계 (선택사항)

### 커스텀 도메인 연결
Vercel에서 자신의 도메인 연결 가능:
- 예: `care.yourdomain.com`

### Firebase 연결
실제 데이터 저장을 위해 Firebase 설정:
1. Firebase 프로젝트 생성
2. Render 환경 변수에 Firebase 인증 정보 추가
3. 재배포

### 모니터링 설정
- Vercel Analytics 활성화
- Render 로그 모니터링
- Sentry 에러 추적 추가

---

## 💰 비용

**완전 무료!**
- ✅ Vercel: 무료 플랜 (개인 프로젝트에 충분)
- ✅ Render: 무료 플랜 (750시간/월)
- ✅ GitHub: 무료 (공개 저장소)

---

## 📞 도움이 필요하신가요?

각 플랫폼의 공식 문서:
- [Vercel 문서](https://vercel.com/docs)
- [Render 문서](https://render.com/docs)
- [Firebase 문서](https://firebase.google.com/docs)
