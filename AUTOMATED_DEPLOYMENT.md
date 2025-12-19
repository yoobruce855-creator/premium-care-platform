# 🚀 Premium Care Platform - 자동 배포 가이드

## 📋 배포 개요

이 가이드는 **브라우저를 통해 자동으로 배포 페이지를 열고** 단계별로 안내합니다.

---

## ⚡ 자동 배포 시작

### 준비물 확인
- [x] GitHub 계정
- [x] GitHub 저장소: `premium-care-platform`
- [ ] Firebase 서비스 계정 키 JSON 파일

---

## 🔥 Step 1: Firebase 서비스 계정 키 확인

### 1-1. 서비스 계정 키 찾기

**Downloads 폴더 확인:**
```
파일 이름: premium-care-platform-firebase-adminsdk-xxxxx.json
위치: C:\Users\yoost\Downloads\
```

**파일이 없는 경우:**
1. https://console.firebase.google.com/project/premium-care-platform/settings/serviceaccounts/adminsdk
2. "새 비공개 키 생성" 클릭
3. JSON 파일 다운로드

### 1-2. JSON 파일에서 필요한 값 추출

JSON 파일을 열고 다음 값을 복사하세요:

```json
{
  "project_id": "premium-care-platform",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@premium-care-platform.iam.gserviceaccount.com"
}
```

**중요**: `private_key`는 따옴표를 포함한 전체 값을 복사해야 합니다!

---

## 🖥️ Step 2: Render 백엔드 배포

### 2-1. Render 대시보드 열기
👉 브라우저에서 자동으로 열립니다: https://dashboard.render.com

### 2-2. 배포 설정

**New Web Service 생성:**
1. "New +" 클릭 → "Web Service" 선택
2. GitHub 저장소 연결: `premium-care-platform`
3. "Connect" 클릭

**서비스 설정:**
```
Name: premium-care-backend
Region: Oregon (US West)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: node server.js
Instance Type: Free
```

### 2-3. 환경 변수 설정

**Environment Variables 섹션에서 다음 변수 추가:**

```bash
# 기본 설정
NODE_ENV=production
PORT=10000

# JWT Secret
JWT_SECRET=7c0eb85751643e31b282ffb2f31f304483fe4215b38b3c43cfc219e4cf0c8ae474cb00f75f07eea02ab35feb175d7dfab4d6705a49051f1b65857ab92dfebe41

# Firebase (JSON 파일에서 복사)
FIREBASE_PROJECT_ID=premium-care-platform
FIREBASE_DATABASE_URL=https://premium-care-platform-default-rtdb.asia-southeast1.firebasedatabase.app
FIREBASE_CLIENT_EMAIL=[JSON 파일의 client_email]
FIREBASE_PRIVATE_KEY=[JSON 파일의 private_key - 따옴표 포함 전체]

# CORS (임시)
FRONTEND_URL=https://임시값.vercel.app
```

### 2-4. 배포 시작
1. "Create Web Service" 클릭
2. 배포 로그 확인 (2-3분)
3. 배포 완료 후 URL 복사
   - 예: `https://premium-care-backend-xxxx.onrender.com`

### 2-5. 배포 확인
브라우저에서 접속:
```
https://[your-backend-url]/health
```

**예상 응답:**
```json
{"status":"ok","firebase":"connected","version":"1.0.0"}
```

---

## 🌐 Step 3: Vercel 프론트엔드 배포

### 3-1. Vercel 대시보드 열기
👉 브라우저에서 자동으로 열립니다: https://vercel.com/new

### 3-2. 프로젝트 Import

1. "Import Git Repository" 섹션에서 `premium-care-platform` 선택
2. "Import" 클릭

### 3-3. 프로젝트 설정

**Configure Project:**
```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
```

### 3-4. 환경 변수 설정

**Environment Variables 섹션:**

```bash
VITE_API_URL=https://[render-backend-url]/api
VITE_WS_URL=wss://[render-backend-url]
```

**중요**: `[render-backend-url]`을 Step 2에서 받은 실제 Render URL로 변경!

예:
```bash
VITE_API_URL=https://premium-care-backend-xxxx.onrender.com/api
VITE_WS_URL=wss://premium-care-backend-xxxx.onrender.com
```

### 3-5. 배포
1. "Deploy" 클릭
2. 빌드 로그 확인 (1-2분)
3. 배포 완료 후 "Visit" 클릭
4. URL 복사
   - 예: `https://premium-care-platform-xxxx.vercel.app`

---

## 🔄 Step 4: CORS 업데이트

### 4-1. Render로 돌아가기
https://dashboard.render.com

### 4-2. 환경 변수 업데이트
1. `premium-care-backend` 서비스 클릭
2. "Environment" 탭
3. `FRONTEND_URL` 값을 실제 Vercel URL로 변경:
   ```
   FRONTEND_URL=https://premium-care-platform-xxxx.vercel.app
   ```
4. "Save Changes" 클릭 → 자동 재배포 (1-2분)

---

## ✅ Step 5: 배포 검증

### 5-1. 백엔드 확인
브라우저에서:
```
https://[backend-url]/health
```

### 5-2. 프론트엔드 확인
브라우저에서:
```
https://[frontend-url]
```

### 5-3. 기능 테스트
- [ ] 페이지 로딩
- [ ] 회원가입
- [ ] 로그인
- [ ] 대시보드 접속
- [ ] 생체 신호 데이터 표시
- [ ] 실시간 업데이트 (3초마다)

### 5-4. WebSocket 연결 확인
1. F12 → Network → WS 탭
2. 연결 상태 확인 (초록색)

---

## 🎉 배포 완료!

**배포된 URL:**
```
🌐 프론트엔드: https://premium-care-platform-xxxx.vercel.app
🖥️ 백엔드: https://premium-care-backend-xxxx.onrender.com
🔥 Firebase: https://premium-care-platform-default-rtdb.asia-southeast1.firebasedatabase.app
```

---

## 🔧 문제 해결

### Firebase 연결 실패
**증상**: `/health` 응답에서 `"firebase": "demo mode"`

**해결:**
1. `FIREBASE_PRIVATE_KEY` 전체 복사 확인 (따옴표 포함)
2. Render 로그에서 에러 확인
3. 환경 변수 재설정

### CORS 에러
**증상**: 브라우저 콘솔에 CORS 에러

**해결:**
1. `FRONTEND_URL`이 정확한 Vercel URL인지 확인
2. `https://` 포함, 마지막 `/` 제외
3. Render 서비스 재시작

### Render 무료 플랜 슬립
**증상**: 첫 요청 시 30초 대기

**해결:**
- 정상 동작 (무료 플랜 특성)
- 15분 동안 요청이 없으면 슬립 모드
- 첫 요청 시 자동으로 깨어남

---

## 💰 비용

**무료 티어:**
- Vercel: 무료
- Render: 무료 (750시간/월)
- Firebase: Spark 플랜 (무료)

**총 비용**: ₩0/월

---

**준비되셨나요? 브라우저가 자동으로 열립니다! 🚀**
