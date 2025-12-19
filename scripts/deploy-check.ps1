# Premium Care Platform - Pre-Deployment Check Script
# This script verifies that everything is ready for deployment

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Premium Care Platform" -ForegroundColor Cyan
Write-Host "  Pre-Deployment Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()

# Check 1: Firebase Service Account Key
Write-Host "Checking Firebase service account key..." -ForegroundColor Yellow
$firebaseKeyPath = Get-ChildItem -Path "$env:USERPROFILE\Downloads" -Filter "*premium-care*.json" -ErrorAction SilentlyContinue | 
    Sort-Object LastWriteTime -Descending | 
    Select-Object -First 1

if ($firebaseKeyPath) {
    Write-Host "  ✓ Found: $($firebaseKeyPath.Name)" -ForegroundColor Green
    
    # Validate JSON structure
    try {
        $keyContent = Get-Content $firebaseKeyPath.FullName | ConvertFrom-Json
        if ($keyContent.project_id -and $keyContent.private_key -and $keyContent.client_email) {
            Write-Host "  ✓ JSON structure valid" -ForegroundColor Green
        } else {
            $errors += "Firebase key JSON is missing required fields"
        }
    } catch {
        $errors += "Firebase key JSON is invalid: $_"
    }
} else {
    $errors += "Firebase service account key not found in Downloads folder"
    Write-Host "  ✗ Not found in Downloads folder" -ForegroundColor Red
}

# Check 2: Node.js and npm
Write-Host ""
Write-Host "Checking Node.js and npm..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "  ✓ Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "  ✓ npm: $npmVersion" -ForegroundColor Green
} catch {
    $errors += "Node.js or npm not found. Please install Node.js"
}

# Check 3: Project dependencies
Write-Host ""
Write-Host "Checking project dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "  ✓ Frontend dependencies installed" -ForegroundColor Green
} else {
    $warnings += "Frontend dependencies not installed. Run: npm install"
}

if (Test-Path "backend/node_modules") {
    Write-Host "  ✓ Backend dependencies installed" -ForegroundColor Green
} else {
    $warnings += "Backend dependencies not installed. Run: cd backend && npm install"
}

# Check 4: Configuration files
Write-Host ""
Write-Host "Checking configuration files..." -ForegroundColor Yellow

$configFiles = @(
    "vercel.json",
    "backend/render.yaml",
    "database.rules.json",
    "firebase.json"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        $errors += "Missing configuration file: $file"
    }
}

# Check 5: Frontend build test
Write-Host ""
Write-Host "Testing frontend build..." -ForegroundColor Yellow
try {
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Frontend builds successfully" -ForegroundColor Green
        
        # Check dist folder
        if (Test-Path "dist") {
            $distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
            Write-Host "  ✓ Build size: $([math]::Round($distSize, 2)) MB" -ForegroundColor Green
        }
    } else {
        $errors += "Frontend build failed"
        Write-Host "  ✗ Build failed" -ForegroundColor Red
    }
} catch {
    $errors += "Frontend build test failed: $_"
}

# Check 6: Backend environment template
Write-Host ""
Write-Host "Checking backend environment template..." -ForegroundColor Yellow
if (Test-Path "backend/.env.example") {
    Write-Host "  ✓ backend/.env.example exists" -ForegroundColor Green
} else {
    $warnings += "backend/.env.example not found"
}

# Check 7: Git repository
Write-Host ""
Write-Host "Checking Git repository..." -ForegroundColor Yellow
try {
    $gitRemote = git remote get-url origin 2>&1
    if ($gitRemote -match "github.com") {
        Write-Host "  ✓ Git remote: $gitRemote" -ForegroundColor Green
        
        # Check if there are uncommitted changes
        $gitStatus = git status --porcelain
        if ($gitStatus) {
            $warnings += "You have uncommitted changes. Consider committing before deployment"
        } else {
            Write-Host "  ✓ No uncommitted changes" -ForegroundColor Green
        }
    } else {
        $warnings += "Git remote is not GitHub"
    }
} catch {
    $warnings += "Not a Git repository or Git not installed"
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "✓ All checks passed! Ready for deployment." -ForegroundColor Green
    exit 0
} else {
    if ($errors.Count -gt 0) {
        Write-Host "Errors ($($errors.Count)):" -ForegroundColor Red
        foreach ($error in $errors) {
            Write-Host "  ✗ $error" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "Warnings ($($warnings.Count)):" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "  ⚠ $warning" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    if ($errors.Count -gt 0) {
        Write-Host "Please fix errors before deploying." -ForegroundColor Red
        exit 1
    } else {
        Write-Host "You can proceed with deployment, but review warnings." -ForegroundColor Yellow
        exit 0
    }
}
