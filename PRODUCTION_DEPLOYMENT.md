# 🚀 Premium Care Platform - 프로덕션 배포 가이드 (상용화 버전)

## 📋 개요

이 가이드는 **실제 상용 서비스**로 사용 가능한 완벽한 버전을 배포하는 과정입니다.

**포함 기능:**
- ✅ Firebase Realtime Database (실제 데이터 저장)
- ✅ Stripe 결제 시스템 (구독 관리)
- ✅ 프로덕션 보안 설정
- ✅ 자동 배포 파이프라인

---

## 1단계: Firebase 프로젝트 생성 🔥

### 1-1. Firebase Console 접속
1. https://console.firebase.google.com 접속
2. "프로젝트 추가" 클릭

### 1-2. 프로젝트 설정
```
프로젝트 이름: premium-care-platform
Google Analytics: 사용 (권장)
```

### 1-3. Realtime Database 활성화
1. 좌측 메뉴 → **"Realtime Database"** 클릭
2. **"데이터베이스 만들기"** 클릭
3. 위치 선택: **"asia-southeast1"** (싱가포르 - 한국과 가까움)
4. 보안 규칙: **"잠금 모드로 시작"** 선택 (나중에 수정)

### 1-4. 서비스 계정 키 생성
1. 프로젝트 설정 (⚙️) → **"서비스 계정"** 탭
2. **"새 비공개 키 생성"** 클릭
3. JSON 파일 다운로드 → **안전한 곳에 보관!**

### 1-5. Database Rules 설정
Firebase Console → Realtime Database → Rules:

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

**"게시"** 클릭하여 저장

### 1-6. Authentication 활성화
1. 좌측 메뉴 → **"Authentication"** 클릭
2. **"시작하기"** 클릭
3. 로그인 방법 → **"이메일/비밀번호"** 사용 설정

---

## 2단계: Stripe 계정 설정 💳

### 2-1. Stripe 계정 생성
1. https://dashboard.stripe.com/register 접속
2. 계정 생성 (이메일 인증 필요)

### 2-2. API 키 확인
1. Stripe Dashboard → **"개발자"** → **"API 키"**
2. 다음 키 복사:
   - **게시 가능 키** (Publishable key): `pk_test_...`
   - **비밀 키** (Secret key): `sk_test_...`

> **참고**: 처음에는 테스트 모드로 시작합니다. 실제 결제는 나중에 활성화할 수 있습니다.

### 2-3. 구독 상품 생성

#### Basic 플랜
1. Stripe Dashboard → **"상품"** → **"상품 추가"**
2. 설정:
   ```
   이름: Premium Care - Basic
   설명: 기본 건강 모니터링 서비스
   가격: ₩99,000 / 월 (또는 $99 / 월)
   청구 주기: 월간 반복
   ```
3. 생성 후 **가격 ID** 복사 (예: `price_xxxxx`)

#### Premium 플랜
```
이름: Premium Care - Premium
설명: AI 분석 포함 프리미엄 서비스
가격: ₩199,000 / 월
청구 주기: 월간 반복
```

#### Enterprise 플랜
```
이름: Premium Care - Enterprise
설명: 기업용 무제한 서비스
가격: ₩499,000 / 월
청구 주기: 월간 반복
```

### 2-4. Webhook 엔드포인트 설정 (나중에)
배포 후 백엔드 URL을 받으면 설정합니다.

---

## 3단계: 백엔드 배포 (Render) 🖥️

### 3-1. Render 접속
1. https://dashboard.render.com 접속
2. GitHub 계정으로 로그인

### 3-2. New Web Service 생성
1. **"New +"** → **"Web Service"** 클릭
2. GitHub 저장소 연결: `premium-care-platform`
3. **"Connect"** 클릭

### 3-3. 서비스 설정

| 설정 | 값 |
|------|-----|
| Name | `premium-care-backend` |
| Region | `Oregon (US West)` |
| Branch | `main` |
| Root Directory | `backend` |
| Runtime | `Node` |
| Build Command | `npm install` |
| Start Command | `node server.js` |
| Instance Type | `Free` |

### 3-4. 환경 변수 설정 (중요!)

**Environment** 섹션에서 다음 변수 추가:

#### 기본 설정
```
NODE_ENV=production
PORT=10000
```

#### JWT Secret (보안)
```
JWT_SECRET=7c0eb85751643e31b282ffb2f31f304483fe4215b38b3c43cfc219e4cf0c8ae474cb00f75f07eea02ab35feb175d7dfab4d6705a49051f1b65857ab92dfebe41
```

#### Firebase 설정 (다운로드한 JSON 파일에서 복사)
```
FIREBASE_PROJECT_ID=premium-care-platform-xxxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@premium-care-platform-xxxxx.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://premium-care-platform-xxxxx-default-rtdb.asia-southeast1.firebasedatabase.app
```

**FIREBASE_PRIVATE_KEY** (특별 처리 필요):
1. JSON 파일에서 `private_key` 값 복사
2. 따옴표 포함해서 전체 복사
3. 예: `"-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n"`

#### Stripe 설정
```
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=(나중에 추가)
STRIPE_BASIC_PRICE_ID=price_xxxxx
STRIPE_PREMIUM_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx
```

#### CORS 설정 (임시)
```
FRONTEND_URL=https://임시값.vercel.app
```

### 3-5. 배포 시작
1. **"Create Web Service"** 클릭
2. 배포 로그 확인 (2-3분 소요)
3. 배포 완료 후 URL 복사
   - 예: `https://premium-care-backend.onrender.com`

### 3-6. 배포 확인
```powershell
Invoke-WebRequest -Uri https://premium-care-backend.onrender.com/health
```

**예상 응답:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-19T...",
  "firebase": "connected",
  "version": "1.0.0"
}
```

✅ `"firebase": "connected"` 확인!

---

## 4단계: Stripe Webhook 설정 🔗

### 4-1. Webhook 엔드포인트 추가
1. Stripe Dashboard → **"개발자"** → **"Webhook"**
2. **"엔드포인트 추가"** 클릭
3. 엔드포인트 URL 입력:
   ```
   https://premium-care-backend.onrender.com/api/payments/webhook
   ```

### 4-2. 이벤트 선택
다음 이벤트 선택:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### 4-3. Webhook 서명 비밀 복사
1. 생성된 Webhook 클릭
2. **"서명 비밀"** 복사 (예: `whsec_xxxxx`)
3. Render 환경 변수에 추가:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```
4. Render 서비스 자동 재배포됨

---

## 5단계: 프론트엔드 배포 (Vercel) 🌐

### 5-1. Vercel 접속
1. https://vercel.com 접속
2. GitHub 계정으로 로그인

### 5-2. 프로젝트 Import
1. **"Add New..."** → **"Project"** 클릭
2. `premium-care-platform` 저장소 선택
3. **"Import"** 클릭

### 5-3. 프로젝트 설정

| 설정 | 값 |
|------|-----|
| Framework Preset | `Vite` |
| Root Directory | `./` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### 5-4. 환경 변수 설정

**Environment Variables** 섹션:

```
VITE_API_URL=https://premium-care-backend.onrender.com/api
VITE_WS_URL=wss://premium-care-backend.onrender.com
```

> **중요**: `premium-care-backend.onrender.com`을 실제 Render URL로 변경!

### 5-5. 배포
1. **"Deploy"** 클릭
2. 빌드 로그 확인 (1-2분)
3. 배포 완료 후 **"Visit"** 클릭
4. URL 복사 (예: `https://premium-care-platform.vercel.app`)

---

## 6단계: CORS 업데이트 🔄

### 6-1. Render 환경 변수 업데이트
1. Render Dashboard → `premium-care-backend` 서비스
2. **"Environment"** 탭
3. `FRONTEND_URL` 값 변경:
   ```
   FRONTEND_URL=https://premium-care-platform.vercel.app
   ```
4. **"Save Changes"** → 자동 재배포

---

## 7단계: 최종 테스트 ✅

### 7-1. 회원가입 & 로그인
1. Vercel URL 접속
2. 새 계정 생성
3. 로그인 성공 확인

### 7-2. 실시간 데이터 확인
1. 대시보드에서 생체 신호 확인
2. 3초마다 업데이트되는지 확인
3. Firebase Console에서 데이터 저장 확인

### 7-3. 구독 테스트
1. 설정 → 구독 페이지 이동
2. Basic 플랜 선택
3. Stripe 테스트 카드 사용:
   ```
   카드 번호: 4242 4242 4242 4242
   만료일: 12/34
   CVC: 123
   우편번호: 12345
   ```
4. 결제 성공 확인
5. Stripe Dashboard에서 구독 확인

### 7-4. WebSocket 연결
1. 브라우저 개발자 도구 (F12)
2. Network → WS 탭
3. 연결 상태 확인 (초록색)

### 7-5. 모바일 테스트
1. 모바일 기기에서 접속
2. PWA 설치
3. 푸시 알림 권한 허용

---

## 🎉 배포 완료!

**상용 서비스 URL:**
- 🌐 프론트엔드: `https://premium-care-platform.vercel.app`
- 🖥️ 백엔드: `https://premium-care-backend.onrender.com`
- 🔥 Firebase: 실시간 데이터 저장
- 💳 Stripe: 결제 시스템 활성화

---

## 📊 운영 모니터링

### Firebase Console
- 실시간 데이터베이스 사용량
- 동시 연결 수
- 읽기/쓰기 작업 수

### Stripe Dashboard
- 구독 현황
- 결제 내역
- 고객 관리

### Render Dashboard
- 서버 로그
- CPU/메모리 사용량
- 요청 수

### Vercel Dashboard
- 배포 로그
- Analytics (선택사항)
- 성능 메트릭

---

## 🔐 보안 체크리스트

- [x] JWT_SECRET 강력한 랜덤 문자열
- [x] Firebase Private Key 안전하게 보관
- [x] Stripe Secret Key 환경 변수에만 저장
- [x] HTTPS 사용 (Vercel/Render 자동)
- [x] Firebase Database Rules 설정
- [x] CORS 설정 완료
- [ ] 정기 보안 업데이트
- [ ] 로그 모니터링 설정

---

## 💰 비용 안내

### 무료 티어 (시작 단계)
- Vercel: 무료
- Render: 무료 (750시간/월)
- Firebase: Spark 플랜 (무료, 제한적)
- Stripe: 거래 수수료만 (2.9% + ₩300)

### 유료 업그레이드 시점
- **Render**: 트래픽 증가 시 ($7/월~)
- **Firebase**: 동시 연결 100+ ($25/월~)
- **Vercel**: 팀 기능 필요 시 ($20/월~)

---

## 🚀 다음 단계

1. **커스텀 도메인 연결**
   - 예: `care.yourdomain.com`
   - Vercel에서 도메인 설정

2. **이메일 알림 설정**
   - Gmail App Password 생성
   - 환경 변수 추가

3. **분석 도구**
   - Google Analytics
   - Sentry (에러 추적)

4. **성능 최적화**
   - CDN 캐싱
   - 이미지 최적화
   - 코드 스플리팅

5. **실제 결제 활성화**
   - Stripe 테스트 모드 → 라이브 모드 전환
   - 사업자 등록 필요

---

## 📞 문제 해결

### Firebase 연결 실패
- Private Key 형식 확인 (`\n` 포함)
- Database URL 정확한지 확인
- Database Rules 설정 확인

### Stripe 결제 실패
- API 키 확인 (test vs live)
- Webhook 엔드포인트 확인
- 가격 ID 정확한지 확인

### WebSocket 연결 끊김
- Render 무료 플랜은 15분 후 슬립
- 첫 요청 시 30초 대기
- 유료 플랜 고려

---

**축하합니다! 실제 상용 서비스가 완성되었습니다! 🎊**
