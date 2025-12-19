# Render 환경 변수 설정 가이드

## 📝 환경 변수 목록

Render Dashboard에서 다음 환경 변수를 설정하세요.

### 1. 기본 서버 설정

| Key | Value | 설명 |
|-----|-------|------|
| `NODE_ENV` | `production` | 프로덕션 환경 설정 |
| `PORT` | `5000` | 서버 포트 (Render가 자동 할당) |

### 2. JWT 인증

| Key | Value | 설명 |
|-----|-------|------|
| `JWT_SECRET` | (자동 생성 또는 직접 입력) | JWT 토큰 서명용 시크릿 키 |

**생성 방법:**
```powershell
# PowerShell에서 랜덤 시크릿 생성
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

### 3. Firebase 설정

Firebase Console에서 서비스 계정 키를 다운로드한 후, JSON 파일에서 다음 값을 복사하세요.

| Key | Value 예시 | JSON 파일 위치 |
|-----|-----------|---------------|
| `FIREBASE_PROJECT_ID` | `premium-care-platform` | `project_id` |
| `FIREBASE_DATABASE_URL` | `https://premium-care-platform-default-rtdb.asia-southeast1.firebasedatabase.app` | Firebase Console에서 확인 |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-xxxxx@premium-care-platform.iam.gserviceaccount.com` | `client_email` |
| `FIREBASE_PRIVATE_KEY` | `"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg..."` | `private_key` (전체 복사) |

#### ⚠️ FIREBASE_PRIVATE_KEY 설정 주의사항

**중요:** `private_key` 값을 **전체** 복사해야 합니다 (따옴표 포함).

**올바른 형식:**
```
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

**잘못된 형식:**
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----
```

### 4. CORS 설정

| Key | Value | 설명 |
|-----|-------|------|
| `FRONTEND_URL` | `https://premium-care-platform.vercel.app` | Vercel 프론트엔드 URL |

**주의사항:**
- `https://` 포함
- 마지막 `/` 제외
- 정확한 Vercel URL 사용

## 🔍 설정 확인 방법

### 1. Render Dashboard에서 확인
1. Render Dashboard → 서비스 선택
2. **Environment** 탭 클릭
3. 모든 환경 변수가 설정되었는지 확인

### 2. 배포 로그 확인
배포 시 다음 메시지가 표시되어야 합니다:
```
✅ Firebase Admin SDK initialized successfully
📊 Project: premium-care-platform
🔗 Database: https://premium-care-platform-default-rtdb.asia-southeast1.firebasedatabase.app
```

### 3. Health Check 테스트
```powershell
Invoke-WebRequest -Uri https://[your-backend].onrender.com/health
```

**성공 응답:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-19T08:46:00.000Z",
  "firebase": "connected",
  "version": "1.0.0"
}
```

**실패 응답:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-19T08:46:00.000Z",
  "firebase": "demo mode",
  "version": "1.0.0"
}
```

## 🚨 문제 해결

### Firebase 연결 실패

**증상:** `firebase: "demo mode"` 응답

**해결 방법:**
1. Render 로그 확인:
   - Dashboard → Logs 탭
   - Firebase 관련 에러 메시지 확인

2. 일반적인 원인:
   - `FIREBASE_PRIVATE_KEY`가 올바르게 복사되지 않음
   - 따옴표가 누락됨
   - `\n` 문자가 실제 줄바꿈으로 변환됨
   - 환경 변수 이름 오타

3. 수정 후:
   - Environment 탭에서 변수 수정
   - "Save Changes" 클릭
   - 자동 재배포 대기

### JWT_SECRET 생성

**PowerShell:**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**온라인 생성기:**
- https://randomkeygen.com/
- "Fort Knox Passwords" 섹션 사용

## 📋 환경 변수 복사용 템플릿

```
NODE_ENV=production
PORT=5000
JWT_SECRET=[여기에-JWT-시크릿-입력]
FIREBASE_PROJECT_ID=premium-care-platform
FIREBASE_DATABASE_URL=https://premium-care-platform-default-rtdb.asia-southeast1.firebasedatabase.app
FIREBASE_CLIENT_EMAIL=[여기에-서비스-계정-이메일-입력]
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[여기에-Private-Key-입력]\n-----END PRIVATE KEY-----\n"
FRONTEND_URL=https://premium-care-platform.vercel.app
```

## ✅ 최종 체크리스트

- [ ] 모든 환경 변수 설정 완료
- [ ] FIREBASE_PRIVATE_KEY 전체 복사 확인 (따옴표 포함)
- [ ] FRONTEND_URL에 https:// 포함 확인
- [ ] 배포 로그에서 Firebase 연결 성공 확인
- [ ] Health endpoint 테스트 성공
- [ ] firebase: "connected" 응답 확인
