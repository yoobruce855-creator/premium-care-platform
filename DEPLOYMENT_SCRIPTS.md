# 🚀 빠른 배포 스크립트 모음

## PowerShell 스크립트

### 1. Firebase 서비스 계정 키 찾기

```powershell
# 다운로드 폴더에서 가장 최근 Firebase JSON 파일 찾기
Get-ChildItem -Path $env:USERPROFILE\Downloads -Filter "*premium-care*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | Select-Object FullName, LastWriteTime
```

### 2. JWT Secret 생성

```powershell
# 64자 랜덤 문자열 생성
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

### 3. 백엔드 Health Check

```powershell
# Render 백엔드 상태 확인
$backendUrl = "https://premium-care-backend.onrender.com"
Invoke-WebRequest -Uri "$backendUrl/health" | Select-Object StatusCode, @{Name="Content";Expression={$_.Content | ConvertFrom-Json}}
```

### 4. API 엔드포인트 테스트

```powershell
# API 정보 확인
$backendUrl = "https://premium-care-backend.onrender.com"
Invoke-WebRequest -Uri "$backendUrl/api" | Select-Object StatusCode, @{Name="Content";Expression={$_.Content | ConvertFrom-Json}}
```

### 5. 전체 배포 상태 확인

```powershell
# 배포 상태 종합 확인 스크립트
$backendUrl = "https://premium-care-backend.onrender.com"
$frontendUrl = "https://premium-care-platform.vercel.app"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Premium Care Platform 배포 상태" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 백엔드 확인
Write-Host "🖥️  백엔드 상태 확인..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/health" -UseBasicParsing
    $health = $response.Content | ConvertFrom-Json
    Write-Host "✅ 백엔드: 정상" -ForegroundColor Green
    Write-Host "   - Status: $($health.status)" -ForegroundColor White
    Write-Host "   - Firebase: $($health.firebase)" -ForegroundColor White
    Write-Host "   - Version: $($health.version)" -ForegroundColor White
} catch {
    Write-Host "❌ 백엔드: 오류" -ForegroundColor Red
    Write-Host "   - Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 프론트엔드 확인
Write-Host "🌐 프론트엔드 상태 확인..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $frontendUrl -UseBasicParsing
    Write-Host "✅ 프론트엔드: 정상 (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ 프론트엔드: 오류" -ForegroundColor Red
    Write-Host "   - Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
```

## 배포 순서 체크리스트 스크립트

```powershell
# 배포 진행 상황 체크리스트
function Show-DeploymentChecklist {
    $checklist = @(
        @{Step=1; Task="Firebase 프로젝트 생성"; Done=$false},
        @{Step=2; Task="Realtime Database 생성"; Done=$false},
        @{Step=3; Task="서비스 계정 키 다운로드"; Done=$false},
        @{Step=4; Task="Render 백엔드 배포"; Done=$false},
        @{Step=5; Task="Render 환경 변수 설정"; Done=$false},
        @{Step=6; Task="Vercel 환경 변수 설정"; Done=$false},
        @{Step=7; Task="Vercel 재배포"; Done=$false},
        @{Step=8; Task="Firebase Database Rules 설정"; Done=$false},
        @{Step=9; Task="Firebase Authentication 활성화"; Done=$false},
        @{Step=10; Task="배포 테스트"; Done=$false}
    )
    
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host "배포 체크리스트" -ForegroundColor Cyan
    Write-Host "==================================" -ForegroundColor Cyan
    
    foreach ($item in $checklist) {
        $checkbox = if ($item.Done) { "[✓]" } else { "[ ]" }
        $color = if ($item.Done) { "Green" } else { "Yellow" }
        Write-Host "$checkbox Step $($item.Step): $($item.Task)" -ForegroundColor $color
    }
    
    Write-Host "==================================" -ForegroundColor Cyan
}

Show-DeploymentChecklist
```

## 환경 변수 검증 스크립트

```powershell
# Render 환경 변수 체크리스트
function Show-RenderEnvChecklist {
    $required = @(
        "NODE_ENV",
        "PORT",
        "JWT_SECRET",
        "FIREBASE_PROJECT_ID",
        "FIREBASE_DATABASE_URL",
        "FIREBASE_CLIENT_EMAIL",
        "FIREBASE_PRIVATE_KEY",
        "FRONTEND_URL"
    )
    
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host "Render 환경 변수 체크리스트" -ForegroundColor Cyan
    Write-Host "==================================" -ForegroundColor Cyan
    
    foreach ($var in $required) {
        Write-Host "[ ] $var" -ForegroundColor Yellow
    }
    
    Write-Host "==================================" -ForegroundColor Cyan
}

# Vercel 환경 변수 체크리스트
function Show-VercelEnvChecklist {
    $required = @(
        "VITE_API_URL",
        "VITE_WS_URL"
    )
    
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host "Vercel 환경 변수 체크리스트" -ForegroundColor Cyan
    Write-Host "==================================" -ForegroundColor Cyan
    
    foreach ($var in $required) {
        Write-Host "[ ] $var" -ForegroundColor Yellow
    }
    
    Write-Host "==================================" -ForegroundColor Cyan
}

Show-RenderEnvChecklist
Write-Host ""
Show-VercelEnvChecklist
```

## 빠른 테스트 스크립트

```powershell
# 배포 후 빠른 테스트
function Test-Deployment {
    param(
        [string]$BackendUrl = "https://premium-care-backend.onrender.com",
        [string]$FrontendUrl = "https://premium-care-platform.vercel.app"
    )
    
    Write-Host "🧪 배포 테스트 시작..." -ForegroundColor Cyan
    Write-Host ""
    
    # Test 1: Backend Health
    Write-Host "Test 1: Backend Health Check" -ForegroundColor Yellow
    try {
        $health = Invoke-RestMethod -Uri "$BackendUrl/health"
        if ($health.status -eq "ok" -and $health.firebase -eq "connected") {
            Write-Host "✅ PASS: Backend is healthy and Firebase is connected" -ForegroundColor Green
        } else {
            Write-Host "⚠️  WARNING: Backend is up but Firebase status is: $($health.firebase)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ FAIL: Backend health check failed" -ForegroundColor Red
    }
    
    Write-Host ""
    
    # Test 2: API Endpoint
    Write-Host "Test 2: API Endpoint" -ForegroundColor Yellow
    try {
        $api = Invoke-RestMethod -Uri "$BackendUrl/api"
        if ($api.name -eq "Premium Care Platform API") {
            Write-Host "✅ PASS: API endpoint is responding" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ FAIL: API endpoint check failed" -ForegroundColor Red
    }
    
    Write-Host ""
    
    # Test 3: Frontend
    Write-Host "Test 3: Frontend Accessibility" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri $FrontendUrl -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ PASS: Frontend is accessible" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ FAIL: Frontend accessibility check failed" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "🎉 테스트 완료!" -ForegroundColor Cyan
}

Test-Deployment
```

## 사용 방법

### 스크립트 실행
1. PowerShell 열기
2. 원하는 스크립트 복사
3. PowerShell에 붙여넣기
4. Enter 키 실행

### 전체 배포 상태 확인
```powershell
# 위의 "전체 배포 상태 확인" 스크립트 복사 후 실행
```

### 배포 테스트
```powershell
# 위의 "빠른 테스트 스크립트" 복사 후 실행
# 또는 커스텀 URL로 테스트:
Test-Deployment -BackendUrl "https://your-backend.onrender.com" -FrontendUrl "https://your-frontend.vercel.app"
```

## 문제 해결 스크립트

### CORS 에러 디버깅
```powershell
# CORS 설정 확인
$backendUrl = "https://premium-care-backend.onrender.com"
$headers = @{
    "Origin" = "https://premium-care-platform.vercel.app"
}

try {
    $response = Invoke-WebRequest -Uri "$backendUrl/health" -Headers $headers -Method Options -UseBasicParsing
    Write-Host "CORS Headers:" -ForegroundColor Yellow
    $response.Headers | Format-Table
} catch {
    Write-Host "CORS Error: $($_.Exception.Message)" -ForegroundColor Red
}
```

### Firebase 연결 확인
```powershell
# Firebase 연결 상태만 확인
$backendUrl = "https://premium-care-backend.onrender.com"
$health = Invoke-RestMethod -Uri "$backendUrl/health"

if ($health.firebase -eq "connected") {
    Write-Host "✅ Firebase: Connected" -ForegroundColor Green
} elseif ($health.firebase -eq "demo mode") {
    Write-Host "⚠️  Firebase: Demo Mode (환경 변수 확인 필요)" -ForegroundColor Yellow
} else {
    Write-Host "❌ Firebase: Unknown Status" -ForegroundColor Red
}
```
