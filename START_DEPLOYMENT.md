# 🎯 Premium Care Platform - 빠른 배포 가이드

## 🚀 배포 준비 완료!

모든 배포 문서와 설정이 준비되었습니다. 이제 실제 배포를 시작할 수 있습니다.

## 📚 배포 문서

### 시작하기 (처음 배포하는 경우)
1. **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - 5단계 빠른 시작 가이드 ⭐ 추천
2. **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - 체크리스트 형식

### 상세 가이드
3. **[FINAL_DEPLOYMENT_GUIDE.md](./FINAL_DEPLOYMENT_GUIDE.md)** - 단계별 상세 가이드
4. **[PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)** - 프로덕션 배포 (Stripe 포함)

### 설정 가이드
5. **[FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md)** - Firebase 설정
6. **[RENDER_ENV_TEMPLATE.md](./RENDER_ENV_TEMPLATE.md)** - Render 환경 변수
7. **[VERCEL_ENV_TEMPLATE.md](./VERCEL_ENV_TEMPLATE.md)** - Vercel 환경 변수

### 테스트
8. **[DEPLOYMENT_SCRIPTS.md](./DEPLOYMENT_SCRIPTS.md)** - PowerShell 테스트 스크립트

## ⚡ 빠른 시작 (5단계)

### 1️⃣ Firebase 설정 (15분)
```
1. https://console.firebase.google.com 접속
2. 프로젝트 생성: premium-care-platform
3. Realtime Database 생성 (asia-southeast1)
4. 서비스 계정 키 다운로드
5. Database Rules 설정
6. Authentication 활성화
```
📖 상세: [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md)

### 2️⃣ Render 백엔드 배포 (10분)
```
1. https://dashboard.render.com 접속
2. New Web Service 생성
3. GitHub 저장소 연결
4. Root Directory: backend
5. 환경 변수 설정 (Firebase 정보 포함)
6. 배포 시작
```
📖 상세: [RENDER_ENV_TEMPLATE.md](./RENDER_ENV_TEMPLATE.md)

### 3️⃣ Vercel 프론트엔드 배포 (5분)
```
1. https://vercel.com 접속
2. 프로젝트 Import
3. 환경 변수 설정:
   - VITE_API_URL=https://[render-url]/api
   - VITE_WS_URL=wss://[render-url]
4. 배포
```
📖 상세: [VERCEL_ENV_TEMPLATE.md](./VERCEL_ENV_TEMPLATE.md)

### 4️⃣ CORS 업데이트 (2분)
```
1. Render → Environment 탭
2. FRONTEND_URL을 Vercel URL로 변경
3. 저장 → 자동 재배포
```

### 5️⃣ 배포 확인 (10분)
```powershell
# PowerShell에서 실행
.\verify-deployment.ps1
```

## ✅ 배포 전 체크리스트

- [ ] GitHub에 코드 푸시 완료
- [ ] Firebase 프로젝트 생성
- [ ] 서비스 계정 키 다운로드
- [ ] Render 계정 생성
- [ ] Vercel 계정 생성

## 🎯 배포 완료 후

배포가 완료되면 다음 URL에서 접속 가능합니다:

```
🌐 프론트엔드: https://premium-care-platform.vercel.app
🖥️ 백엔드: https://premium-care-backend.onrender.com
🔥 Firebase: https://premium-care-platform-default-rtdb.asia-southeast1.firebasedatabase.app
```

## 🔧 문제 해결

### Firebase 연결 실패
→ [RENDER_ENV_TEMPLATE.md](./RENDER_ENV_TEMPLATE.md) 참고

### CORS 에러
→ [VERCEL_ENV_TEMPLATE.md](./VERCEL_ENV_TEMPLATE.md) 참고

### WebSocket 연결 실패
→ [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) 참고

## 📞 도움말

문제가 발생하면:
1. 해당 문서의 "문제 해결" 섹션 확인
2. Render/Vercel 로그 확인
3. Firebase Console 확인

## 💰 예상 비용

**무료 티어로 시작 가능:**
- Vercel: 무료
- Render: 무료 (750시간/월)
- Firebase: Spark 플랜 (무료)

**총 비용**: ₩0/월

---

**준비가 되셨나요? [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)를 열고 시작하세요! 🚀**
