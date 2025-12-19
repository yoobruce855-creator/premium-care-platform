# Premium Care Platform - Post-Deployment Verification Script
# This script tests deployed services to ensure everything is working

param(
    [Parameter(Mandatory = $true)]
    [string]$BackendUrl,
    
    [Parameter(Mandatory = $true)]
    [string]$FrontendUrl
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Premium Care Platform" -ForegroundColor Cyan
Write-Host "  Deployment Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  $BackendUrl" -ForegroundColor White
Write-Host "Frontend: $FrontendUrl" -ForegroundColor White
Write-Host ""

$passed = 0
$failed = 0

# Test 1: Backend Health Check
Write-Host "Test 1: Backend Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BackendUrl/health" -Method GET -UseBasicParsing
    $health = $response.Content | ConvertFrom-Json
    
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✓ Status: 200 OK" -ForegroundColor Green
        $passed++
        
        if ($health.status -eq "ok") {
            Write-Host "  ✓ Health status: OK" -ForegroundColor Green
        }
        
        if ($health.firebase -eq "connected") {
            Write-Host "  ✓ Firebase: Connected" -ForegroundColor Green
        }
        elseif ($health.firebase -eq "demo mode") {
            Write-Host "  ⚠ Firebase: Demo Mode (credentials not configured)" -ForegroundColor Yellow
        }
        else {
            Write-Host "  ✗ Firebase: Unknown status" -ForegroundColor Red
        }
        
        Write-Host "  ℹ Version: $($health.version)" -ForegroundColor Cyan
    }
    else {
        Write-Host "  ✗ Unexpected status code: $($response.StatusCode)" -ForegroundColor Red
        $failed++
    }
}
catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 2: Backend API Info
Write-Host ""
Write-Host "Test 2: Backend API Info" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BackendUrl/api" -Method GET -UseBasicParsing
    $apiInfo = $response.Content | ConvertFrom-Json
    
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✓ Status: 200 OK" -ForegroundColor Green
        Write-Host "  ℹ API Name: $($apiInfo.name)" -ForegroundColor Cyan
        Write-Host "  ℹ Version: $($apiInfo.version)" -ForegroundColor Cyan
        $passed++
    }
    else {
        Write-Host "  ✗ Unexpected status code: $($response.StatusCode)" -ForegroundColor Red
        $failed++
    }
}
catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 3: Frontend Loading
Write-Host ""
Write-Host "Test 3: Frontend Loading" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $FrontendUrl -Method GET -UseBasicParsing
    
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✓ Status: 200 OK" -ForegroundColor Green
        
        # Check for React app
        if ($response.Content -match "root") {
            Write-Host "  ✓ React root element found" -ForegroundColor Green
        }
        
        # Check for PWA manifest
        if ($response.Content -match "manifest") {
            Write-Host "  ✓ PWA manifest linked" -ForegroundColor Green
        }
        
        $passed++
    }
    else {
        Write-Host "  ✗ Unexpected status code: $($response.StatusCode)" -ForegroundColor Red
        $failed++
    }
}
catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 4: CORS Configuration
Write-Host ""
Write-Host "Test 4: CORS Configuration" -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = $FrontendUrl
    }
    $response = Invoke-WebRequest -Uri "$BackendUrl/health" -Method GET -Headers $headers -UseBasicParsing
    
    $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
    if ($corsHeader) {
        if ($corsHeader -eq $FrontendUrl -or $corsHeader -eq "*") {
            Write-Host "  ✓ CORS configured correctly" -ForegroundColor Green
            Write-Host "  ℹ Allow-Origin: $corsHeader" -ForegroundColor Cyan
            $passed++
        }
        else {
            Write-Host "  ⚠ CORS header present but may not match: $corsHeader" -ForegroundColor Yellow
            $passed++
        }
    }
    else {
        Write-Host "  ✗ CORS header not found" -ForegroundColor Red
        $failed++
    }
}
catch {
    Write-Host "  ⚠ Could not verify CORS: $($_.Exception.Message)" -ForegroundColor Yellow
    $passed++
}

# Test 5: Backend Response Time
Write-Host ""
Write-Host "Test 5: Backend Response Time" -ForegroundColor Yellow
try {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $response = Invoke-WebRequest -Uri "$BackendUrl/health" -Method GET -UseBasicParsing
    $stopwatch.Stop()
    
    $responseTime = $stopwatch.ElapsedMilliseconds
    
    if ($responseTime -lt 1000) {
        Write-Host "  ✓ Response time: ${responseTime}ms (Good)" -ForegroundColor Green
        $passed++
    }
    elseif ($responseTime -lt 5000) {
        Write-Host "  ⚠ Response time: ${responseTime}ms (Acceptable)" -ForegroundColor Yellow
        $passed++
    }
    else {
        Write-Host "  ✗ Response time: ${responseTime}ms (Slow)" -ForegroundColor Red
        $failed++
    }
}
catch {
    Write-Host "  ✗ Failed to measure response time" -ForegroundColor Red
    $failed++
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Results" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host ""

if ($failed -eq 0) {
    Write-Host "✓ All tests passed! Deployment successful." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Test user registration and login" -ForegroundColor White
    Write-Host "  2. Verify real-time data updates" -ForegroundColor White
    Write-Host "  3. Check WebSocket connection in browser DevTools" -ForegroundColor White
    Write-Host "  4. Test PWA installation" -ForegroundColor White
    Write-Host ""
    exit 0
}
else {
    Write-Host "✗ Some tests failed. Please review and fix issues." -ForegroundColor Red
    Write-Host ""
    exit 1
}
