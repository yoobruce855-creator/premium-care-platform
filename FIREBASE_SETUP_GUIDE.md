# Firebase 설정 가이드

## 🔥 Firebase를 사용하는 이유

Firebase Realtime Database를 사용하면:
- ✅ **영구 데이터 저장**: 서버 재시작 후에도 데이터 유지
- ✅ **실시간 동기화**: 모든 클라이언트에 즉시 업데이트
- ✅ **확장성**: 사용자 증가에 따라 자동 확장
- ✅ **무료 시작**: 소규모 프로젝트는 무료
- ✅ **보안**: 강력한 인증 및 권한 관리

---

## 📋 1단계: Firebase 프로젝트 생성

### 1. Firebase Console 접속
1. 브라우저에서 [Firebase Console](https://console.firebase.google.com/) 접속
2. Google 계정으로 로그인

### 2. 새 프로젝트 만들기
1. **"프로젝트 추가"** 클릭
2. 프로젝트 이름 입력: `premium-care-platform` (또는 원하는 이름)
3. Google Analytics 설정 (선택사항, 나중에도 추가 가능)
4. **"프로젝트 만들기"** 클릭
5. 프로젝트 생성 완료 대기 (약 30초)

---

## 📋 2단계: Realtime Database 설정

### 1. Realtime Database 생성
1. 왼쪽 메뉴에서 **"빌드"** → **"Realtime Database"** 클릭
2. **"데이터베이스 만들기"** 클릭
3. 위치 선택: **"asia-southeast1"** (싱가포르 - 한국과 가장 가까움)
4. 보안 규칙: **"잠금 모드로 시작"** 선택
5. **"사용 설정"** 클릭

### 2. 데이터베이스 URL 복사
- 생성된 데이터베이스 URL을 복사하세요
- 형식: `https://premium-care-platform-xxxxx.firebaseio.com`
- 이 URL을 나중에 사용합니다

### 3. 보안 규칙 설정
**"규칙"** 탭으로 이동하여 다음 규칙을 입력:

```json
{
  "rules": {
    "patients": {
      "$patientId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "users": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId"
      }
    },
    "vitals": {
      "$patientId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "alerts": {
      "$patientId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

**"게시"** 버튼을 클릭하여 규칙 저장

---

## 📋 3단계: 서비스 계정 키 생성

### 1. 프로젝트 설정 열기
1. 왼쪽 상단의 **⚙️ (톱니바퀴)** 아이콘 클릭
2. **"프로젝트 설정"** 클릭

### 2. 서비스 계정 키 생성
1. **"서비스 계정"** 탭 클릭
2. **"새 비공개 키 생성"** 클릭
3. **"키 생성"** 확인
4. JSON 파일이 자동으로 다운로드됩니다
   - 파일명: `premium-care-platform-xxxxx-firebase-adminsdk-xxxxx.json`

### 3. JSON 파일 내용 확인
다운로드한 JSON 파일을 텍스트 에디터로 열면:

```json
{
  "type": "service_account",
  "project_id": "premium-care-platform-xxxxx",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@premium-care-platform-xxxxx.iam.gserviceaccount.com",
  "client_id": "xxxxx",
  ...
}
```

---

## 📋 4단계: 환경 변수 설정

### 1. backend/.env 파일 열기
`C:\Users\yoost\.gemini\antigravity\scratch\premium-care-platform\backend\.env` 파일을 편집

### 2. Firebase 정보 입력
다운로드한 JSON 파일에서 다음 값을 복사하여 입력:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=premium-care-platform-xxxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@premium-care-platform-xxxxx.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://premium-care-platform-xxxxx.firebaseio.com

# Private Key (중요: 줄바꿈을 \\n으로 변경)
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n"
```

### ⚠️ PRIVATE_KEY 설정 주의사항

**중요**: `private_key`는 여러 줄로 되어 있습니다. 환경 변수에 입력할 때:

1. **전체 키를 큰따옴표로 감싸기**
2. **줄바꿈은 그대로 `\n`으로 유지** (이미 JSON에 `\n`으로 되어 있음)
3. **앞뒤 공백 제거**

**올바른 예시**:
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASC...\n-----END PRIVATE KEY-----\n"
```

**잘못된 예시** (따옴표 없음):
```env
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQ...
```

---

## 📋 5단계: 서버 시작 및 테스트

### 1. 서버 시작
```bash
cd C:\Users\yoost\.gemini\antigravity\scratch\premium-care-platform\backend
node server.js
```

### 2. 성공 메시지 확인
다음과 같은 메시지가 표시되어야 합니다:
```
✅ Firebase initialized successfully
🚀 Server running on port 5000
📡 WebSocket server ready
🔥 Firebase initialized
```

### 3. 실패 시 확인사항
만약 에러가 발생하면:

**에러: "Firebase initialization error"**
- `.env` 파일의 Firebase 설정 확인
- `FIREBASE_PRIVATE_KEY`가 큰따옴표로 감싸져 있는지 확인
- `project_id`, `client_email`, `database_url`이 정확한지 확인

**에러: "EADDRINUSE: address already in use"**
- 포트 5000이 이미 사용 중
- 다른 서버 프로세스를 종료하거나
- `.env`에서 `PORT=5001`로 변경

---

## 📋 6단계: Firebase 데이터 확인

### 1. Firebase Console에서 데이터 확인
1. Firebase Console → Realtime Database
2. **"데이터"** 탭 클릭
3. 서버가 실행되면 자동으로 데이터 구조가 생성됩니다

### 2. 예상 데이터 구조
```
premium-care-platform-xxxxx/
├── patients/
│   └── patient-1/
│       ├── name: "어르신"
│       ├── age: 75
│       └── status: "normal"
├── vitals/
│   └── patient-1/
│       └── timestamp-1/
│           ├── heartRate: 72
│           └── respiratoryRate: 16
└── alerts/
    └── patient-1/
        └── alert-1/
            ├── type: "fall"
            └── timestamp: 1234567890
```

---

## 🎯 완료!

이제 Firebase가 설정되었습니다!

### ✅ 확인 사항
- [x] Firebase 프로젝트 생성
- [x] Realtime Database 생성
- [x] 서비스 계정 키 다운로드
- [x] 환경 변수 설정
- [x] 서버 시작 성공
- [x] Firebase 연결 확인

### 🚀 다음 단계
1. 프론트엔드 시작: `npm run dev`
2. 브라우저에서 접속: `http://localhost:3000`
3. 데모 로그인: `demo@example.com` / `demo123`
4. 실시간 데이터가 Firebase에 저장되는 것을 확인!

---

## 🔒 보안 주의사항

### ⚠️ 중요: 서비스 계정 키 보안

1. **절대 Git에 커밋하지 마세요**
   - `.env` 파일은 `.gitignore`에 포함되어 있습니다
   - JSON 키 파일도 절대 커밋하지 마세요

2. **키 파일 안전하게 보관**
   - 다운로드한 JSON 파일을 안전한 곳에 백업
   - 분실 시 Firebase Console에서 새 키 생성 가능

3. **프로덕션 배포 시**
   - 환경 변수는 호스팅 플랫폼의 환경 변수 설정 사용
   - Heroku, Vercel, AWS 등에서 안전하게 관리

---

## 📞 문제 해결

### Q: "Firebase initialization error" 발생
**A**: `.env` 파일의 `FIREBASE_PRIVATE_KEY`를 확인하세요. 큰따옴표로 감싸져 있어야 합니다.

### Q: 데이터가 저장되지 않음
**A**: Firebase Console → Realtime Database → 규칙 탭에서 보안 규칙을 확인하세요.

### Q: "Permission denied" 에러
**A**: 보안 규칙에서 `.write` 권한이 올바르게 설정되어 있는지 확인하세요.

### Q: 서버가 시작되지 않음
**A**: 
1. `backend/node_modules`가 설치되어 있는지 확인
2. `npm install` 실행
3. 포트 5000이 사용 중인지 확인

---

**이제 영구 데이터 저장소가 준비되었습니다! 🎉**
