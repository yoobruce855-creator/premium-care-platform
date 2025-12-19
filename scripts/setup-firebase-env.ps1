# Premium Care Platform - Firebase Environment Setup Helper
# This script helps extract Firebase credentials from service account JSON

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Firebase Environment Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Find Firebase service account key
Write-Host "Searching for Firebase service account key..." -ForegroundColor Yellow
$firebaseKeyPath = Get-ChildItem -Path "$env:USERPROFILE\Downloads" -Filter "*premium-care*.json" -ErrorAction SilentlyContinue | 
Sort-Object LastWriteTime -Descending | 
Select-Object -First 1

if (-not $firebaseKeyPath) {
    Write-Host "✗ Firebase service account key not found in Downloads folder" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download the service account key:" -ForegroundColor Yellow
    Write-Host "  1. Go to https://console.firebase.google.com/project/premium-care-platform/settings/serviceaccounts/adminsdk" -ForegroundColor White
    Write-Host "  2. Click 'Generate new private key'" -ForegroundColor White
    Write-Host "  3. Save the JSON file to your Downloads folder" -ForegroundColor White
    Write-Host "  4. Run this script again" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✓ Found: $($firebaseKeyPath.Name)" -ForegroundColor Green
Write-Host ""

# Parse JSON
try {
    $keyContent = Get-Content $firebaseKeyPath.FullName | ConvertFrom-Json
}
catch {
    Write-Host "✗ Failed to parse JSON file: $_" -ForegroundColor Red
    exit 1
}

# Extract values
$projectId = $keyContent.project_id
$clientEmail = $keyContent.client_email
$privateKey = $keyContent.private_key
$databaseUrl = "https://$projectId-default-rtdb.asia-southeast1.firebasedatabase.app"

# Display environment variables for Render
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Environment Variables for Render" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Copy and paste these into Render's Environment section:" -ForegroundColor Yellow
Write-Host ""

Write-Host "FIREBASE_PROJECT_ID" -ForegroundColor Green
Write-Host $projectId
Write-Host ""

Write-Host "FIREBASE_DATABASE_URL" -ForegroundColor Green
Write-Host $databaseUrl
Write-Host ""

Write-Host "FIREBASE_CLIENT_EMAIL" -ForegroundColor Green
Write-Host $clientEmail
Write-Host ""

Write-Host "FIREBASE_PRIVATE_KEY" -ForegroundColor Green
Write-Host "⚠ IMPORTANT: Copy the ENTIRE value below, including quotes!" -ForegroundColor Yellow
Write-Host $privateKey
Write-Host ""

# Save to file for reference
$envFile = "backend/.env.firebase"
$envContent = @"
# Firebase Configuration
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

FIREBASE_PROJECT_ID=$projectId
FIREBASE_DATABASE_URL=$databaseUrl
FIREBASE_CLIENT_EMAIL=$clientEmail
FIREBASE_PRIVATE_KEY=$privateKey
"@

$envContent | Out-File -FilePath $envFile -Encoding UTF8
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ Saved to: $envFile" -ForegroundColor Green
Write-Host ""
Write-Host "⚠ WARNING: This file contains sensitive credentials!" -ForegroundColor Yellow
Write-Host "  - Do NOT commit to Git" -ForegroundColor Yellow
Write-Host "  - Delete after deployment" -ForegroundColor Yellow
Write-Host "  - Use only for reference" -ForegroundColor Yellow
Write-Host ""

# Additional environment variables
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Additional Required Variables" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "NODE_ENV" -ForegroundColor Green
Write-Host "production"
Write-Host ""

Write-Host "PORT" -ForegroundColor Green
Write-Host "10000"
Write-Host ""

Write-Host "JWT_SECRET" -ForegroundColor Green
$jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object { [char]$_ })
Write-Host $jwtSecret
Write-Host ""

Write-Host "FRONTEND_URL" -ForegroundColor Green
Write-Host "https://premium-care-platform.vercel.app"
Write-Host "⚠ Update this after Vercel deployment with actual URL" -ForegroundColor Yellow
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Copy all environment variables to Render" -ForegroundColor White
Write-Host "  2. Deploy backend to Render" -ForegroundColor White
Write-Host "  3. Update FRONTEND_URL after Vercel deployment" -ForegroundColor White
Write-Host ""
