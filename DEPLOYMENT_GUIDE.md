# 🚀 Premium Care Platform - 배포 완료 가이드

## 📌 개요

Premium Care Platform의 프로덕션 배포를 위한 **완전한 가이드**입니다.

## 🎯 배포 아키텍처

```
┌─────────────────┐      HTTPS/WSS      ┌──────────────────┐
│                 │ ◄─────────────────► │                  │
│  Vercel         │                     │  Render          │
│  (Frontend)     │                     │  (Backend)       │
│                 │                     │                  │
└─────────────────┘                     └──────────────────┘
                                               │
                                               │ Admin SDK
                                               ▼
                                        ┌──────────────────┐
                                        │                  │
                                        │  Firebase        │
                                        │  (Database)      │
                                        │                  │
                                        └──────────────────┘
```

## 📚 배포 문서 목록

배포를 위한 모든 문서가 준비되어 있습니다:

| 문서 | 설명 | 우선순위 |
|------|------|---------|
| **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** | 전체 배포 체크리스트 | ⭐⭐⭐ |
| **[FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md)** | Firebase 프로젝트 설정 | ⭐⭐⭐ |
| **[RENDER_ENV_TEMPLATE.md](./RENDER_ENV_TEMPLATE.md)** | Render 환경 변수 설정 | ⭐⭐⭐ |
| **[VERCEL_ENV_TEMPLATE.md](./VERCEL_ENV_TEMPLATE.md)** | Vercel 환경 변수 설정 | ⭐⭐⭐ |
| **[DEPLOYMENT_SCRIPTS.md](./DEPLOYMENT_SCRIPTS.md)** | PowerShell 테스트 스크립트 | ⭐⭐ |

## 🚀 빠른 시작 (5단계)

### 1️⃣ Firebase 설정
```
📖 FIREBASE_SETUP_GUIDE.md 참고
- Firebase 프로젝트 생성
- Realtime Database 생성
- 서비스 계정 키 다운로드
```

### 2️⃣ Render 백엔드 배포
```
📖 RENDER_ENV_TEMPLATE.md 참고
- GitHub 저장소 연결
- 환경 변수 설정
- 배포 시작
```

### 3️⃣ Vercel 환경 변수 설정
```
📖 VERCEL_ENV_TEMPLATE.md 참고
- VITE_API_URL 설정
- VITE_WS_URL 설정
- 재배포
```

### 4️⃣ Firebase 보안 설정
```
📖 FIREBASE_SETUP_GUIDE.md 참고
- Database Rules 설정
- Authentication 활성화
```

### 5️⃣ 배포 검증
```
📖 DEPLOYMENT_SCRIPTS.md 참고
- PowerShell 스크립트로 테스트
- 기능 테스트
```

## ✅ 배포 전 체크리스트

- [ ] GitHub에 코드 푸시 완료
- [ ] Firebase 프로젝트 생성
- [ ] 서비스 계정 키 다운로드
- [ ] Render 계정 생성
- [ ] Vercel 프로젝트 확인

## 🔗 배포 URL

배포 완료 후 다음 URL에서 접속 가능합니다:

- **프론트엔드**: https://premium-care-platform.vercel.app
- **백엔드**: https://premium-care-backend.onrender.com
- **Firebase**: https://premium-care-platform-default-rtdb.asia-southeast1.firebasedatabase.app

## 🧪 배포 테스트

PowerShell에서 빠른 테스트:

```powershell
# 백엔드 Health Check
Invoke-WebRequest -Uri https://premium-care-backend.onrender.com/health

# 전체 배포 상태 확인 (DEPLOYMENT_SCRIPTS.md 참고)
```

## 🔧 문제 해결

### Firebase 연결 실패
→ **[RENDER_ENV_TEMPLATE.md](./RENDER_ENV_TEMPLATE.md)** 참고

### CORS 에러
→ **[VERCEL_ENV_TEMPLATE.md](./VERCEL_ENV_TEMPLATE.md)** 참고

### WebSocket 연결 실패
→ **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** 참고

## 📞 지원

문제가 발생하면:
1. 해당 문서의 "문제 해결" 섹션 확인
2. Render/Vercel 로그 확인
3. Firebase Console 확인

## 🎉 배포 완료 후

- [ ] 사용자 테스트
- [ ] 모니터링 설정
- [ ] 백업 전략 수립
- [ ] 커스텀 도메인 연결 (선택)
- [ ] Stripe 결제 연동 (선택)

---

**모든 준비가 완료되었습니다! 배포를 시작하세요! 🚀**
