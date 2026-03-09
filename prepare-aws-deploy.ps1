# PowerShell script to prepare AWS deployment package

Write-Host "Preparing AWS Elastic Beanstalk deployment package..." -ForegroundColor Green

# Step 1: Build the TypeScript code
Write-Host "`n1. Building TypeScript code..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Please fix TypeScript errors first." -ForegroundColor Red
    exit 1
}

# Step 2: Create deployment directory
Write-Host "`n2. Creating deployment directory..." -ForegroundColor Yellow
$deployDir = "aws-deploy"
if (Test-Path $deployDir) {
    Remove-Item -Recurse -Force $deployDir
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

# Step 3: Copy necessary files
Write-Host "`n3. Copying files..." -ForegroundColor Yellow

# Copy built JavaScript files
Copy-Item -Recurse dist $deployDir/

# Copy public folder
Copy-Item -Recurse public $deployDir/

# Copy configuration files
Copy-Item package.json $deployDir/
Copy-Item package-lock.json $deployDir/ -ErrorAction SilentlyContinue
Copy-Item Procfile $deployDir/
Copy-Item .ebignore $deployDir/ -ErrorAction SilentlyContinue

# Copy AWS platform configuration
if (Test-Path .platform) {
    Copy-Item -Recurse .platform $deployDir/
}

# Copy Elastic Beanstalk configuration
if (Test-Path .elasticbeanstalk) {
    Copy-Item -Recurse .elasticbeanstalk $deployDir/
}

# Copy .env.example (user will need to set environment variables in AWS console)
Copy-Item .env.example $deployDir/ -ErrorAction SilentlyContinue

# Step 4: Create ZIP file
Write-Host "`n4. Creating ZIP file..." -ForegroundColor Yellow
$zipFile = "aws-deployment.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile
}

# Create ZIP using PowerShell
Compress-Archive -Path "$deployDir/*" -DestinationPath $zipFile

Write-Host "`n✅ Deployment package created: $zipFile" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Go to AWS Elastic Beanstalk Console" -ForegroundColor White
Write-Host "2. Select your environment: medical-consultation-ap-env" -ForegroundColor White
Write-Host "3. Click 'Upload and deploy'" -ForegroundColor White
Write-Host "4. Upload the file: $zipFile" -ForegroundColor White
Write-Host "5. Add environment variables in Configuration → Software:" -ForegroundColor White
Write-Host "   - PORT = 8080" -ForegroundColor White
Write-Host "   - NODE_ENV = production" -ForegroundColor White
Write-Host "   - EMAIL_USER = your-email@gmail.com" -ForegroundColor White
Write-Host "   - EMAIL_PASS = your-app-password" -ForegroundColor White
Write-Host "6. Wait for deployment to complete" -ForegroundColor White
Write-Host "7. Test your URL!" -ForegroundColor White

# Cleanup
Write-Host "`nCleaning up temporary files..." -ForegroundColor Yellow
Remove-Item -Recurse -Force $deployDir

Write-Host "`n✨ Done! Your deployment package is ready." -ForegroundColor Green
