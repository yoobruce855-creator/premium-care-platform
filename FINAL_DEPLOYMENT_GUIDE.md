# 🚀 Premium Care Platform - 최종 배포 가이드

## ✅ 완료된 작업

### 1. GitHub 저장소
- ✅ 코드 푸시 완료
- 📍 URL: `https://github.com/yoobruce855-creator/premium-care-platform`
- 🔄 브랜치: `main`

### 2. Firebase 설정
- ✅ 프로젝트 생성: `premium-care-platform`
- ✅ Realtime Database 생성
- 📍 Database URL: `https://premium-care-platform-default-rtdb.asia-southeast1.firebasedatabase.app`
- 📍 위치: `asia-southeast1` (싱가포르)
- ✅ 서비스 계정 키 다운로드 완료

---

## 📋 다음 단계: 배포 실행

### 단계 1: Firebase 서비스 계정 키 확인

**다운로드 폴더에서 JSON 파일 찾기:**
```
파일 위치: C:\Users\yoost\Downloads\
파일 이름: premium-care-platform-firebase-adminsdk-xxxxx-xxxxxxxxxx.json
```

**JSON 파일 열기 후 다음 값 확인:**
- `project_id`
- `private_key`
- `client_email`

---

### 단계 2: Render 백엔드 배포

#### 2-1. Render 접속
1. https://dashboard.render.com 접속
2. "Sign in with GitHub" 클릭

#### 2-2. 새 Web Service 생성
1. **"New +"** 클릭 → **"Web Service"** 선택
2. GitHub 저장소 연결: `premium-care-platform`
3. **"Connect"** 클릭

#### 2-3. 서비스 설정
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

#### 2-4. 환경 변수 설정 (중요!)

**기본 설정:**
```
NODE_ENV=production
PORT=10000
JWT_SECRET=7c0eb85751643e31b282ffb2f31f304483fe4215b38b3c43cfc219e4cf0c8ae474cb00f75f07eea02ab35feb175d7dfab4d6705a49051f1b65857ab92dfebe41
```

**Firebase 설정 (JSON 파일에서 복사):**
```
FIREBASE_PROJECT_ID=premium-care-platform
FIREBASE_DATABASE_URL=https://premium-care-platform-default-rtdb.asia-southeast1.firebasedatabase.app
FIREBASE_CLIENT_EMAIL=(JSON 파일의 client_email 값)
FIREBASE_PRIVATE_KEY=(JSON 파일의 private_key 값 - 따옴표 포함 전체 복사)
```

**CORS 설정 (임시):**
```
FRONTEND_URL=https://임시값.vercel.app
```

**Stripe 설정 (선택사항 - 없으면 데모 모드):**
```
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_BASIC_PRICE_ID=price_xxxxx
STRIPE_PREMIUM_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx
```

#### 2-5. 배포 시작
1. **"Create Web Service"** 클릭
2. 배포 로그 확인 (2-3분)
3. 배포 완료 후 URL 복사
   - 예: `https://premium-care-backend.onrender.com`

#### 2-6. 배포 확인
```powershell
Invoke-WebRequest -Uri https://premium-care-backend.onrender.com/health
```

**예상 응답:**
```json
{"status":"ok","firebase":"connected","version":"1.0.0"}
```

---

### 단계 3: Vercel 프론트엔드 배포

#### 3-1. Vercel 접속
1. https://vercel.com 접속
2. "Sign in with GitHub" 클릭

#### 3-2. 프로젝트 Import
1. **"Add New..."** → **"Project"** 클릭
2. `premium-care-platform` 저장소 선택
3. **"Import"** 클릭

#### 3-3. 프로젝트 설정
```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
```

#### 3-4. 환경 변수 설정
```
VITE_API_URL=https://premium-care-backend.onrender.com/api
VITE_WS_URL=wss://premium-care-backend.onrender.com
```

> **중요**: `premium-care-backend.onrender.com`을 실제 Render URL로 변경!

#### 3-5. 배포
1. **"Deploy"** 클릭
2. 빌드 로그 확인 (1-2분)
3. 배포 완료 후 URL 복사
   - 예: `https://premium-care-platform.vercel.app`

---

### 단계 4: CORS 업데이트

#### 4-1. Render 환경 변수 업데이트
1. Render Dashboard → `premium-care-backend` 서비스
2. **"Environment"** 탭
3. `FRONTEND_URL` 값 변경:
   ```
   FRONTEND_URL=https://premium-care-platform.vercel.app
   ```
4. **"Save Changes"** → 자동 재배포

---

### 단계 5: Firebase Database Rules 설정

#### 5-1. Firebase Console 접속
1. https://console.firebase.google.com/project/premium-care-platform/database/premium-care-platform-default-rtdb/rules
2. 다음 규칙으로 변경:

```json
{
  "rules": {
    "patients": {
      "$patientId": {
        ".read": "auth != null",
        ".write": "auth != null",
        "vitals": {
          ".indexOn": ["timestamp"]
        },
        "alerts": {
          ".indexOn": ["timestamp", "severity"]
        }
      }
    },
    "users": {
      "$userId": {
        ".read": "auth.uid === $userId",
        ".write": "auth.uid === $userId"
      }
    }
  }
}
```

3. **"게시"** 클릭

#### 5-2. Firebase Authentication 활성화
1. Firebase Console → Authentication
2. **"시작하기"** 클릭
3. 로그인 방법 → **"이메일/비밀번호"** 사용 설정

---

## 🧪 최종 테스트

### 1. 백엔드 Health Check
```powershell
Invoke-WebRequest -Uri https://[your-backend].onrender.com/health
```

### 2. 프론트엔드 접속
브라우저에서: `https://[your-app].vercel.app`

### 3. 기능 테스트
- [ ] 회원가입
- [ ] 로그인
- [ ] 대시보드 생체 신호 표시
- [ ] 3초마다 실시간 업데이트
- [ ] WebSocket 연결 (F12 → Network → WS)
- [ ] Firebase에 데이터 저장 확인

---

## 📊 배포 완료 체크리스트

- [ ] Render 백엔드 배포 완료
- [ ] Vercel 프론트엔드 배포 완료
- [ ] Firebase Database Rules 설정
- [ ] Firebase Authentication 활성화
- [ ] CORS 설정 업데이트
- [ ] Health endpoint 응답 확인
- [ ] 프론트엔드 로딩 확인
- [ ] WebSocket 연결 확인
- [ ] 실시간 데이터 업데이트 확인
- [ ] Firebase 데이터 저장 확인

---

## 🎉 배포 완료 후

**배포된 URL:**
- 🌐 프론트엔드: `https://[your-app].vercel.app`
- 🖥️ 백엔드: `https://[your-backend].onrender.com`
- 🔥 Firebase: `https://premium-care-platform-default-rtdb.asia-southeast1.firebasedatabase.app`

**다음 단계 (선택사항):**
1. Stripe 계정 생성 및 구독 상품 설정
2. 커스텀 도메인 연결
3. Google Analytics 추가
4. 모니터링 설정

---

## 🔧 문제 해결

### Firebase 연결 실패
- JSON 파일의 `private_key` 값 전체 복사 (따옴표 포함)
- `\n` 문자가 포함되어 있는지 확인

### Render 배포 실패
- 빌드 로그 확인
- `backend` 폴더가 Root Directory로 설정되었는지 확인

### Vercel 배포 실패
- 빌드 로그 확인
- 환경 변수가 올바르게 설정되었는지 확인

### CORS 에러
- Render의 `FRONTEND_URL`이 정확한 Vercel URL인지 확인
- `https://` 포함, 마지막 `/` 제외

---

## 📞 빠른 배포 명령어

### 로컬 빌드 테스트
```powershell
# 프론트엔드
npm run build

# 백엔드
cd backend
npm install
npm start
```

### Firebase 서비스 계정 키 찾기
```powershell
Get-ChildItem -Path $env:USERPROFILE\Downloads -Filter "*premium-care*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
```

---

**🎊 모든 준비가 완료되었습니다! 위 단계를 따라 배포를 진행하세요!**
