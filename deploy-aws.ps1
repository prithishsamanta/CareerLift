# AWS App Runner Deployment Script for Windows PowerShell
# Make sure you have AWS CLI configured and Docker installed

param(
    [string]$AWSRegion = "us-east-1",
    [string]$ECRRepository = "careerlift",
    [string]$AppName = "careerlift"
)

Write-Host "Starting AWS App Runner deployment..." -ForegroundColor Green

# Check if AWS CLI is configured
try {
    $null = aws sts get-caller-identity 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "AWS CLI not configured"
    }
} catch {
    Write-Host "AWS CLI not configured. Please run 'aws configure' first." -ForegroundColor Red
    exit 1
}

# Check if Docker is running
try {
    $null = docker info 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not running"
    }
} catch {
    Write-Host "Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Get AWS account ID
try {
    $AWSAccountID = aws sts get-caller-identity --query Account --output text
    $ECRURI = "$AWSAccountID.dkr.ecr.$AWSRegion.amazonaws.com/$ECRRepository"
} catch {
    Write-Host "Failed to get AWS account ID" -ForegroundColor Red
    exit 1
}

# Create ECR repository if it doesn't exist
Write-Host "Checking if ECR repository exists..." -ForegroundColor Yellow
try {
    $null = aws ecr describe-repositories --repository-names $ECRRepository --region $AWSRegion 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ECR repository doesn't exist. Creating it..." -ForegroundColor Yellow
        aws ecr create-repository --repository-name $ECRRepository --region $AWSRegion
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Failed to create ECR repository" -ForegroundColor Red
            exit 1
        }
        Write-Host "ECR repository created successfully!" -ForegroundColor Green
    } else {
        Write-Host "ECR repository already exists." -ForegroundColor Green
    }
} catch {
    Write-Host "Failed to check/create ECR repository" -ForegroundColor Red
    exit 1
}

Write-Host "Building Docker image..." -ForegroundColor Yellow
docker build -t $ECRRepository`:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed" -ForegroundColor Red
    exit 1
}

Write-Host "Tagging image for ECR..." -ForegroundColor Yellow
docker tag $ECRRepository`:latest $ECRURI`:latest

Write-Host "Logging into ECR..." -ForegroundColor Yellow
$loginCommand = "aws ecr get-login-password --region $AWSRegion | docker login --username AWS --password-stdin $ECRURI"
Invoke-Expression $loginCommand

if ($LASTEXITCODE -ne 0) {
    Write-Host "ECR login failed" -ForegroundColor Red
    exit 1
}

Write-Host "Pushing image to ECR..." -ForegroundColor Yellow
docker push $ECRURI`:latest

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker push failed" -ForegroundColor Red
    exit 1
}

Write-Host "Image pushed successfully!" -ForegroundColor Green
Write-Host "ECR URI: $ECRURI`:latest" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to AWS App Runner console" -ForegroundColor White
Write-Host "2. Create a new service" -ForegroundColor White
Write-Host "3. Choose 'Container registry' as source" -ForegroundColor White
Write-Host "4. Select ECR and use URI: $ECRURI`:latest" -ForegroundColor White
Write-Host "5. Configure environment variables as needed" -ForegroundColor White
Write-Host "6. Deploy!" -ForegroundColor White