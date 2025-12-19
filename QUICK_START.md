# 🚀 Premium Care Platform - Quick Start Guide

## 빠른 시작 (3단계)

### 1️⃣ 프로젝트 폴더로 이동
```bash
cd C:\Users\yoost\.gemini\antigravity\scratch\premium-care-platform
```

### 2️⃣ 통합 시작 스크립트 실행
```bash
start-all.bat
```

이 스크립트는 자동으로:
- ✅ 필요한 의존성 설치 확인
- ✅ 백엔드 서버 시작 (포트 5000)
- ✅ 프론트엔드 서버 시작 (포트 3000)
- ✅ 브라우저에서 애플리케이션 열기

### 3️⃣ 애플리케이션 사용
브라우저가 자동으로 열리면:
1. **회원가입** - 새 계정 생성
2. **로그인** - 생성한 계정으로 로그인
3. **대시보드** - 실시간 생체 신호 모니터링 확인

---

## 📋 수동 시작 (선택사항)

백엔드와 프론트엔드를 별도로 시작하려면:

### 백엔드 서버
```bash
cd backend
npm install
npm run dev
```
✅ 서버 실행: http://localhost:5000

### 프론트엔드 서버 (새 터미널)
```bash
npm install
npm run dev
```
✅ 애플리케이션: http://localhost:3000

---

## 🔧 문제 해결

### 포트가 이미 사용 중인 경우
```bash
# 포트 5000 사용 중인 프로세스 확인
netstat -ano | findstr :5000

# 포트 3000 사용 중인 프로세스 확인
netstat -ano | findstr :3000

# 프로세스 종료 (PID는 위 명령어 결과에서 확인)
taskkill /PID <PID> /F
```

### 의존성 설치 오류
```bash
# node_modules 삭제 후 재설치
rmdir /s /q node_modules
rmdir /s /q backend\node_modules
npm install
cd backend && npm install
```

### 브라우저에서 연결 오류
1. 백엔드 서버가 실행 중인지 확인: http://localhost:5000/health
2. 프론트엔드 서버가 실행 중인지 확인: http://localhost:3000
3. 브라우저 콘솔(F12)에서 에러 메시지 확인

---

## 🎯 주요 기능

### 실시간 모니터링
- 💓 **심박수** - 3초마다 업데이트
- 🫁 **호흡수** - 실시간 추적
- 🚶 **활동 상태** - 수면/휴식/활동 감지

### 응급 알림
- 🚨 **낙상 감지** - 즉시 알림
- ⚠️ **비정상 심박수** - 자동 경고
- 📱 **브라우저 알림** - 푸시 알림 지원

### 데이터 관리
- 📊 **히스토리** - 과거 데이터 조회
- 📈 **차트** - 시각화된 생체 신호
- 💾 **자동 저장** - Firebase 연동 (선택사항)

---

## 🔐 데모 모드 vs 프로덕션 모드

### 현재: 데모 모드 ✅
- Firebase 없이 실행 가능
- 시뮬레이터로 생체 신호 생성
- 메모리 기반 데이터 저장
- 개발 및 테스트에 적합

### 프로덕션 모드로 전환하려면:
1. Firebase 프로젝트 생성
2. `backend/.env` 파일에 Firebase 인증 정보 추가:
   ```
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY="your-private-key"
   FIREBASE_CLIENT_EMAIL=your-email@project.iam.gserviceaccount.com
   FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
   ```
3. 서버 재시작

자세한 내용은 `FIREBASE_SETUP_GUIDE.md` 참조

---

## 📱 PWA 설치

브라우저에서 애플리케이션을 앱처럼 설치:
1. Chrome/Edge: 주소창 오른쪽 "설치" 아이콘 클릭
2. 모바일: "홈 화면에 추가" 선택

---

## 🛑 서버 종료

터미널 창을 닫거나 `Ctrl+C` 입력

---

## 📚 추가 문서

- [API 문서](API_DOCUMENTATION.md)
- [Firebase 설정](FIREBASE_SETUP_GUIDE.md)
- [배포 가이드](DEPLOYMENT_GUIDE.md)
- [README](README.md)

---

## 💡 도움이 필요하신가요?

문제가 발생하면:
1. 백엔드 터미널에서 에러 메시지 확인
2. 프론트엔드 터미널에서 에러 메시지 확인
3. 브라우저 개발자 도구(F12) → Console 탭 확인
