# AWS Elastic Beanstalk Deployment Script
# Run this script to deploy your app to AWS

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AWS Elastic Beanstalk Deployment" -ForegroundColor Cyan
Write-Host "Medical Consultation App" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if AWS CLI is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $awsVersion = aws --version 2>&1
    Write-Host "✓ AWS CLI installed: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ AWS CLI not found!" -ForegroundColor Red
    Write-Host "Please install AWS CLI from: https://awscli.amazonaws.com/AWSCLIV2.msi" -ForegroundColor Yellow
    exit 1
}

# Check if EB CLI is installed
try {
    $ebVersion = eb --version 2>&1
    Write-Host "✓ EB CLI installed: $ebVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ EB CLI not found!" -ForegroundColor Red
    Write-Host "Installing EB CLI..." -ForegroundColor Yellow
    pip install awsebcli --upgrade --user
    Write-Host "✓ EB CLI installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Options" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. Initialize EB (first time only)" -ForegroundColor White
Write-Host "2. Create new environment" -ForegroundColor White
Write-Host "3. Deploy to existing environment" -ForegroundColor White
Write-Host "4. Set environment variables" -ForegroundColor White
Write-Host "5. Open app in browser" -ForegroundColor White
Write-Host "6. View logs" -ForegroundColor White
Write-Host "7. Check status" -ForegroundColor White
Write-Host "8. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Select an option (1-8)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Initializing Elastic Beanstalk..." -ForegroundColor Yellow
        Write-Host "Follow the prompts:" -ForegroundColor Cyan
        Write-Host "  - Region: us-east-1" -ForegroundColor White
        Write-Host "  - Application: medical-consultation-app" -ForegroundColor White
        Write-Host "  - Platform: Node.js 18" -ForegroundColor White
        Write-Host "  - CodeCommit: No" -ForegroundColor White
        Write-Host "  - SSH: Yes (recommended)" -ForegroundColor White
        Write-Host ""
        eb init
    }
    "2" {
        Write-Host ""
        Write-Host "Creating new environment..." -ForegroundColor Yellow
        Write-Host "This will take 5-10 minutes..." -ForegroundColor Cyan
        Write-Host ""
        eb create medical-app-env --instance-type t3.micro
    }
    "3" {
        Write-Host ""
        Write-Host "Deploying to AWS..." -ForegroundColor Yellow
        
        # Commit any changes
        Write-Host "Committing changes to git..." -ForegroundColor Cyan
        git add .
        git commit -m "Deploy to AWS EB" -ErrorAction SilentlyContinue
        
        # Deploy
        Write-Host "Deploying application..." -ForegroundColor Cyan
        eb deploy
        
        Write-Host ""
        Write-Host "✓ Deployment complete!" -ForegroundColor Green
        Write-Host "Run option 5 to open your app in browser" -ForegroundColor Yellow
    }
    "4" {
        Write-Host ""
        Write-Host "Setting environment variables..." -ForegroundColor Yellow
        Write-Host ""
        
        $emailUser = Read-Host "Enter your Gmail address"
        $emailPass = Read-Host "Enter your Gmail App Password" -AsSecureString
        $emailPassPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($emailPass))
        
        Write-Host ""
        Write-Host "Setting environment variables on AWS..." -ForegroundColor Cyan
        eb setenv EMAIL_USER=$emailUser EMAIL_PASS=$emailPassPlain NODE_ENV=production PORT=8080
        
        Write-Host ""
        Write-Host "✓ Environment variables set!" -ForegroundColor Green
    }
    "5" {
        Write-Host ""
        Write-Host "Opening app in browser..." -ForegroundColor Yellow
        eb open
    }
    "6" {
        Write-Host ""
        Write-Host "Fetching logs..." -ForegroundColor Yellow
        eb logs
    }
    "7" {
        Write-Host ""
        Write-Host "Checking status..." -ForegroundColor Yellow
        eb status
        Write-Host ""
        eb health
    }
    "8" {
        Write-Host ""
        Write-Host "Goodbye!" -ForegroundColor Cyan
        exit 0
    }
    default {
        Write-Host ""
        Write-Host "Invalid option!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Done!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "  eb status    - Check environment status" -ForegroundColor White
Write-Host "  eb logs      - View application logs" -ForegroundColor White
Write-Host "  eb open      - Open app in browser" -ForegroundColor White
Write-Host "  eb deploy    - Deploy updates" -ForegroundColor White
Write-Host "  eb console   - Open AWS Console" -ForegroundColor White
Write-Host ""
