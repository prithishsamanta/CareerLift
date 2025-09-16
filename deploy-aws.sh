#!/bin/bash

# AWS App Runner Deployment Script
# Make sure you have AWS CLI configured and Docker installed

set -e

# Configuration
AWS_REGION="us-east-1"
ECR_REPOSITORY="hackathon-tidb-app"
APP_NAME="hackathon-tidb-app"

echo "🚀 Starting AWS App Runner deployment..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}"

echo "📦 Building Docker image..."
docker build -t ${ECR_REPOSITORY}:latest .

echo "🏷️ Tagging image for ECR..."
docker tag ${ECR_REPOSITORY}:latest ${ECR_URI}:latest

echo "🔐 Logging into ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_URI}

echo "📤 Pushing image to ECR..."
docker push ${ECR_URI}:latest

echo "✅ Image pushed successfully!"
echo "🔗 ECR URI: ${ECR_URI}:latest"
echo ""
echo "Next steps:"
echo "1. Go to AWS App Runner console"
echo "2. Create a new service"
echo "3. Choose 'Container registry' as source"
echo "4. Select ECR and use URI: ${ECR_URI}:latest"
echo "5. Configure environment variables as needed"
echo "6. Deploy!"
