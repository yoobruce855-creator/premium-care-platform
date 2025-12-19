# 🚀 Premium Care Platform 배포 체크리스트

## 📋 배포 전 준비사항

### Firebase 설정
- [ ] Firebase 프로젝트 생성 완료
- [ ] Realtime Database 생성 (asia-southeast1)
- [ ] 서비스 계정 키 JSON 파일 다운로드
- [ ] Database URL 확인 및 복사

### GitHub 저장소
- [ ] 코드가 GitHub에 푸시됨
- [ ] main 브랜치가 최신 상태

## 🖥️ Render 백엔드 배포

### 1. Render 계정 및 프로젝트 생성
- [ ] Render.com 접속 및 GitHub 연동
- [ ] New Web Service 생성
- [ ] 저장소 선택: `premium-care-platform`

### 2. 배포 설정
```
Name: premium-care-backend
Region: Oregon (US West)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: node server.js
```

### 3. 환경 변수 설정 (Render)
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `5000`
- [ ] `JWT_SECRET` = (자동 생성 또는 직접 입력)
- [ ] `FIREBASE_PROJECT_ID` = Firebase 프로젝트 ID
- [ ] `FIREBASE_DATABASE_URL` = Firebase Database URL
- [ ] `FIREBASE_CLIENT_EMAIL` = 서비스 계정 이메일
- [ ] `FIREBASE_PRIVATE_KEY` = 서비스 계정 Private Key (따옴표 포함)
- [ ] `FRONTEND_URL` = Vercel 프론트엔드 URL

### 4. 배포 및 확인
- [ ] "Create Web Service" 클릭
- [ ] 배포 로그 확인 (2-3분)
- [ ] 배포 완료 후 URL 복사
- [ ] Health check 테스트: `/health` 엔드포인트 확인

## 🌐 Vercel 프론트엔드 설정

### 1. 환경 변수 업데이트
URL: https://vercel.com/yoobruce855-creators-projects/premium-care-platform/settings/environment-variables

- [ ] `VITE_API_URL` = `https://[render-backend-url]/api`
- [ ] `VITE_WS_URL` = `wss://[render-backend-url]`
- [ ] Environment: Production, Preview, Development 모두 선택

### 2. 재배포
- [ ] Deployments 탭으로 이동
- [ ] 최신 배포의 메뉴에서 "Redeploy" 선택
- [ ] 배포 완료 대기 (1-2분)

## 🔥 Firebase 설정

### 1. Database Rules
- [ ] Firebase Console → Realtime Database → Rules
- [ ] 보안 규칙 업데이트 (인증된 사용자만 읽기/쓰기)
- [ ] 인덱스 설정 (timestamp, severity)
- [ ] "게시" 클릭

### 2. Authentication
- [ ] Firebase Console → Authentication
- [ ] "시작하기" 클릭
- [ ] 이메일/비밀번호 로그인 방법 활성화
- [ ] 저장

## ✅ 배포 검증

### 백엔드 테스트
```powershell
# Health check
Invoke-WebRequest -Uri https://[render-backend-url]/health

# API 정보
Invoke-WebRequest -Uri https://[render-backend-url]/api
```

**예상 응답:**
- Status: 200 OK
- Firebase: "connected"

### 프론트엔드 테스트
- [ ] 브라우저에서 Vercel URL 접속
- [ ] 페이지 정상 로드 확인
- [ ] 콘솔 에러 없음 확인

### 기능 테스트
- [ ] 회원가입 성공
- [ ] 로그인 성공
- [ ] 대시보드 접속
- [ ] 생체 신호 데이터 표시
- [ ] 실시간 업데이트 확인 (3초마다)
- [ ] WebSocket 연결 확인 (F12 → Network → WS)
- [ ] Firebase에 데이터 저장 확인

## 🎯 최종 확인

### URL 정리
- [ ] 프론트엔드 URL 기록: `https://premium-care-platform.vercel.app`
- [ ] 백엔드 URL 기록: `https://premium-care-backend.onrender.com`
- [ ] Firebase URL 기록: `https://[project-id]-default-rtdb.asia-southeast1.firebasedatabase.app`

### 문서 업데이트
- [ ] README.md에 배포 URL 추가
- [ ] 환경 변수 문서화
- [ ] 배포 가이드 최종 검토

## 🔧 문제 해결 체크리스트

### Firebase 연결 실패 시
- [ ] FIREBASE_PRIVATE_KEY 전체 복사 확인 (따옴표 포함)
- [ ] 줄바꿈 문자 `\n` 포함 확인
- [ ] Render 로그에서 에러 메시지 확인
- [ ] Firebase 프로젝트 ID 정확성 확인

### CORS 에러 시
- [ ] FRONTEND_URL이 정확한 Vercel URL인지 확인
- [ ] https:// 포함, 마지막 / 제외 확인
- [ ] 대소문자 정확히 일치 확인
- [ ] Render 서비스 재시작

### WebSocket 연결 실패 시
- [ ] VITE_WS_URL이 wss://로 시작하는지 확인
- [ ] Render 백엔드 정상 작동 확인
- [ ] 브라우저 콘솔 에러 메시지 확인
- [ ] 방화벽/네트워크 설정 확인

## 🎉 배포 완료!

모든 체크리스트 항목이 완료되면 배포가 성공적으로 완료된 것입니다.

**다음 단계:**
- [ ] 사용자 테스트 진행
- [ ] 모니터링 설정
- [ ] 백업 전략 수립
- [ ] 커스텀 도메인 연결 (선택사항)
- [ ] Stripe 결제 연동 (선택사항)
