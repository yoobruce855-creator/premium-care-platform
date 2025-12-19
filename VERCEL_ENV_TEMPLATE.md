# Vercel 환경 변수 설정 가이드

## 📝 환경 변수 목록

Vercel Dashboard에서 다음 환경 변수를 설정하세요.

**설정 URL:**
https://vercel.com/yoobruce855-creators-projects/premium-care-platform/settings/environment-variables

## 🔧 필수 환경 변수

| Variable Name | Value 예시 | 설명 |
|---------------|-----------|------|
| `VITE_API_URL` | `https://premium-care-backend.onrender.com/api` | Render 백엔드 API URL |
| `VITE_WS_URL` | `wss://premium-care-backend.onrender.com` | Render 백엔드 WebSocket URL |

### 주의사항

1. **VITE_API_URL**
   - Render 백엔드 URL 뒤에 `/api` 추가
   - `https://` 사용 (http 아님)
   - 마지막 `/` 제외

2. **VITE_WS_URL**
   - `wss://` 사용 (ws 아님, 보안 WebSocket)
   - `/api` 없음
   - 마지막 `/` 제외

## 📋 설정 단계

### 1. Vercel Dashboard 접속
1. https://vercel.com 로그인
2. `premium-care-platform` 프로젝트 선택
3. **Settings** 탭 클릭
4. 좌측 메뉴에서 **Environment Variables** 선택

### 2. 환경 변수 추가

#### VITE_API_URL 추가
1. **Name**: `VITE_API_URL`
2. **Value**: `https://[your-render-backend].onrender.com/api`
3. **Environment**: 
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. **Add** 클릭

#### VITE_WS_URL 추가
1. **Name**: `VITE_WS_URL`
2. **Value**: `wss://[your-render-backend].onrender.com`
3. **Environment**: 
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. **Add** 클릭

### 3. 재배포

환경 변수를 추가한 후 **반드시 재배포**해야 합니다.

1. **Deployments** 탭으로 이동
2. 최신 배포 찾기
3. 우측 **•••** 메뉴 클릭
4. **Redeploy** 선택
5. **Redeploy** 확인

배포 완료까지 1-2분 소요됩니다.

## 🔍 설정 확인 방법

### 1. Vercel Dashboard에서 확인
- Settings → Environment Variables
- 두 변수가 모두 표시되는지 확인

### 2. 빌드 로그 확인
- Deployments → 최신 배포 클릭
- Building 로그에서 환경 변수 로드 확인

### 3. 브라우저에서 테스트

#### 개발자 도구 열기 (F12)
```javascript
// Console에서 확인
console.log(import.meta.env.VITE_API_URL);
console.log(import.meta.env.VITE_WS_URL);
```

**예상 출력:**
```
https://premium-care-backend.onrender.com/api
wss://premium-care-backend.onrender.com
```

### 4. Network 탭 확인
1. F12 → **Network** 탭
2. 페이지 새로고침
3. API 요청이 올바른 URL로 가는지 확인
4. **WS** 필터 클릭
5. WebSocket 연결 확인

## 🚨 문제 해결

### API 요청이 localhost로 가는 경우

**증상:**
- Network 탭에서 `http://localhost:5000/api` 요청 확인
- CORS 에러 발생

**원인:**
- 환경 변수가 설정되지 않음
- 재배포하지 않음

**해결:**
1. Environment Variables 설정 확인
2. 재배포 실행
3. 브라우저 캐시 삭제 (Ctrl + Shift + Delete)

### WebSocket 연결 실패

**증상:**
- Console에 WebSocket 연결 에러
- 실시간 데이터 업데이트 안 됨

**원인:**
- `VITE_WS_URL`이 `ws://`로 설정됨 (보안 연결 필요)
- Render 백엔드가 작동하지 않음

**해결:**
1. `VITE_WS_URL`이 `wss://`로 시작하는지 확인
2. Render 백엔드 상태 확인
3. 재배포 실행

### CORS 에러

**증상:**
```
Access to fetch at 'https://...' from origin 'https://premium-care-platform.vercel.app' 
has been blocked by CORS policy
```

**원인:**
- Render 백엔드의 `FRONTEND_URL` 설정 오류

**해결:**
1. Render Dashboard → Environment 탭
2. `FRONTEND_URL` 값 확인
3. 정확한 Vercel URL인지 확인 (https:// 포함, 마지막 / 제외)
4. 수정 후 Render 자동 재배포 대기

## 📋 환경별 설정

### Production (프로덕션)
```
VITE_API_URL=https://premium-care-backend.onrender.com/api
VITE_WS_URL=wss://premium-care-backend.onrender.com
```

### Preview (미리보기)
```
VITE_API_URL=https://premium-care-backend.onrender.com/api
VITE_WS_URL=wss://premium-care-backend.onrender.com
```

### Development (로컬 개발)
```
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
```

## ✅ 최종 체크리스트

- [ ] `VITE_API_URL` 설정 완료
- [ ] `VITE_WS_URL` 설정 완료
- [ ] 모든 환경 (Production, Preview, Development) 선택
- [ ] 재배포 완료
- [ ] 브라우저에서 환경 변수 확인
- [ ] API 요청이 올바른 URL로 전송됨
- [ ] WebSocket 연결 성공
- [ ] CORS 에러 없음

## 🔗 관련 링크

- Vercel 프로젝트: https://vercel.com/yoobruce855-creators-projects/premium-care-platform
- Environment Variables 설정: https://vercel.com/yoobruce855-creators-projects/premium-care-platform/settings/environment-variables
- Deployments: https://vercel.com/yoobruce855-creators-projects/premium-care-platform/deployments
