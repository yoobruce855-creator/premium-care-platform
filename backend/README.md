# Premium Care Platform Backend

프리미엄 돌봄 플랫폼의 프로덕션 백엔드 서버입니다.

## 기능

- ✅ 사용자 인증 (JWT)
- ✅ 환자 관리
- ✅ 실시간 생체 신호 모니터링
- ✅ WebSocket 실시간 통신
- ✅ 응급 알림 시스템
- ✅ 이메일 알림
- ✅ Firebase 실시간 데이터베이스 연동
- ✅ 다중 센서 지원 (시뮬레이터, 스마트폰, 하드웨어)

## 설치

```bash
cd backend
npm install
```

## 환경 설정

`.env.example`을 `.env`로 복사하고 설정값을 입력하세요:

```bash
cp .env.example .env
```

### 필수 설정

```env
PORT=5000
JWT_SECRET=your-secret-key
```

### Firebase 설정 (선택사항)

Firebase를 사용하려면 다음 값을 설정하세요:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-email@project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### 이메일 알림 설정 (선택사항)

Gmail을 사용한 이메일 알림:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## 실행

### 개발 모드
```bash
npm run dev
```

### 프로덕션 모드
```bash
npm start
```

## API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보

### 환자 관리
- `GET /api/patients` - 환자 목록
- `POST /api/patients` - 환자 등록
- `GET /api/patients/:id` - 환자 상세
- `PUT /api/patients/:id` - 환자 정보 수정
- `DELETE /api/patients/:id` - 환자 삭제

### 생체 신호
- `GET /api/vitals/:patientId` - 생체 신호 조회
- `GET /api/vitals/:patientId/latest` - 최신 생체 신호
- `POST /api/vitals/:patientId` - 생체 신호 입력

### 알림
- `GET /api/alerts/:patientId` - 알림 목록
- `POST /api/alerts/:patientId` - 알림 생성
- `PUT /api/alerts/:patientId/:alertId/acknowledge` - 알림 확인

## WebSocket 연결

```javascript
const ws = new WebSocket('ws://localhost:5000');

// 환자 데이터 구독
ws.send(JSON.stringify({
  type: 'subscribe',
  payload: {
    patientId: 'patient_123',
    mode: 'simulator' // or 'smartphone', 'hardware'
  }
}));

// 스마트폰 센서 데이터 전송
ws.send(JSON.stringify({
  type: 'smartphone_sensor',
  payload: {
    patientId: 'patient_123',
    sensorType: 'accelerometer',
    data: { x: 0.1, y: 0.2, z: 9.8 }
  }
}));

// 수동 체크인
ws.send(JSON.stringify({
  type: 'manual_checkin',
  payload: {
    patientId: 'patient_123',
    status: 'ok',
    note: '괜찮습니다'
  }
}));
```

## 데모 모드

Firebase 설정 없이도 데모 모드로 실행 가능합니다:

**데모 계정:**
- 이메일: `demo@example.com`
- 비밀번호: `demo123`

## 센서 지원

### 1. 시뮬레이터 (기본)
현실적인 생체 신호 시뮬레이션

### 2. 스마트폰 센서
- 가속도계 (낙상 감지)
- 자이로스코프
- 마이크 (소리 감지)
- 카메라 (모션 감지)

### 3. 하드웨어 센서 (향후)
- mmWave 레이더
- ESP32 기반 센서
- 기타 IoT 센서

## 프로덕션 배포

### Docker 사용
```bash
docker build -t premium-care-backend .
docker run -p 5000:5000 --env-file .env premium-care-backend
```

### 클라우드 배포
- Firebase Functions
- AWS EC2
- Google Cloud Run
- Heroku

## 라이선스

MIT
