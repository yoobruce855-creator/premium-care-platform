# 🚀 Premium Care Platform - 배포 상태 확인 스크립트

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Premium Care Platform - 배포 상태 확인" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# 배포 URL 설정 (실제 URL로 변경 필요)
$BACKEND_URL = Read-Host "백엔드 URL을 입력하세요 (예: https://premium-care-backend.onrender.com)"
$FRONTEND_URL = Read-Host "프론트엔드 URL을 입력하세요 (예: https://premium-care-platform.vercel.app)"

Write-Host ""
Write-Host "==================================================" -ForegroundColor Yellow
Write-Host "  1. 백엔드 Health Check" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Yellow

try {
    $healthResponse = Invoke-WebRequest -Uri "$BACKEND_URL/health" -Method GET -UseBasicParsing
    $healthData = $healthResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ 백엔드 상태: " -NoNewline -ForegroundColor Green
    Write-Host $healthData.status
    
    Write-Host "✅ Firebase 연결: " -NoNewline -ForegroundColor Green
    Write-Host $healthData.firebase
    
    Write-Host "✅ 버전: " -NoNewline -ForegroundColor Green
    Write-Host $healthData.version
    
    if ($healthData.firebase -eq "connected") {
        Write-Host "🎉 Firebase 연결 성공!" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  Firebase 연결 실패 - 환경 변수를 확인하세요" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ 백엔드 연결 실패: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Render 배포 상태를 확인하세요" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Yellow
Write-Host "  2. 백엔드 API 정보" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Yellow

try {
    $apiResponse = Invoke-WebRequest -Uri "$BACKEND_URL/api" -Method GET -UseBasicParsing
    $apiData = $apiResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ API 이름: " -NoNewline -ForegroundColor Green
    Write-Host $apiData.name
    
    Write-Host "✅ 버전: " -NoNewline -ForegroundColor Green
    Write-Host $apiData.version
    
    Write-Host "✅ 사용 가능한 엔드포인트:" -ForegroundColor Green
    $apiData.endpoints | ForEach-Object {
        Write-Host "   - $_" -ForegroundColor Cyan
    }
}
catch {
    Write-Host "❌ API 정보 조회 실패: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Yellow
Write-Host "  3. 프론트엔드 상태" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Yellow

try {
    $frontendResponse = Invoke-WebRequest -Uri $FRONTEND_URL -Method GET -UseBasicParsing
    
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ 프론트엔드 접속 성공 (Status: 200)" -ForegroundColor Green
        Write-Host "✅ 페이지 크기: $($frontendResponse.Content.Length) bytes" -ForegroundColor Green
    }
}
catch {
    Write-Host "❌ 프론트엔드 연결 실패: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Vercel 배포 상태를 확인하세요" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Yellow
Write-Host "  4. CORS 설정 확인" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Yellow

try {
    $headers = @{
        "Origin" = $FRONTEND_URL
    }
    $corsResponse = Invoke-WebRequest -Uri "$BACKEND_URL/api" -Method GET -Headers $headers -UseBasicParsing
    
    $corsHeader = $corsResponse.Headers["Access-Control-Allow-Origin"]
    
    if ($corsHeader) {
        Write-Host "✅ CORS 헤더: " -NoNewline -ForegroundColor Green
        Write-Host $corsHeader
        
        if ($corsHeader -eq $FRONTEND_URL -or $corsHeader -eq "*") {
            Write-Host "🎉 CORS 설정 정상!" -ForegroundColor Green
        }
        else {
            Write-Host "⚠️  CORS 설정 불일치 - FRONTEND_URL 환경 변수를 확인하세요" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "⚠️  CORS 헤더 없음" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "⚠️  CORS 확인 실패: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  배포 상태 요약" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 백엔드 URL: $BACKEND_URL" -ForegroundColor White
Write-Host "📍 프론트엔드 URL: $FRONTEND_URL" -ForegroundColor White
Write-Host ""
Write-Host "다음 단계:" -ForegroundColor Yellow
Write-Host "1. 브라우저에서 프론트엔드 URL 접속" -ForegroundColor White
Write-Host "2. 회원가입 및 로그인 테스트" -ForegroundColor White
Write-Host "3. 대시보드에서 실시간 데이터 확인" -ForegroundColor White
Write-Host "4. F12 → Network → WS 탭에서 WebSocket 연결 확인" -ForegroundColor White
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
