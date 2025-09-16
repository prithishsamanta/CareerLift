# AWS App Runner Deployment Guide

This guide will help you deploy your Hackathon TiDB application to AWS App Runner.

## Prerequisites

1. **AWS CLI** installed and configured

   ```bash
   aws configure
   ```

2. **Docker** installed and running

3. **AWS Account** with appropriate permissions for:
   - ECR (Elastic Container Registry)
   - App Runner
   - IAM

## Architecture Overview

The deployment uses a single Docker container that serves both:

- **Frontend**: React app served by Nginx on port 80
- **Backend**: Flask API running on port 5001 (internal)
- **Nginx**: Proxies `/api/*` requests to the Flask backend

## Deployment Steps

### Step 1: Create ECR Repository

```bash
aws ecr create-repository --repository-name hackathon-tidb-app --region us-east-1
```

### Step 2: Build and Push Docker Image

**For Windows (PowerShell):**

```powershell
.\deploy-aws.ps1
```

**For Linux/Mac:**

```bash
./deploy-aws.sh
```

**Manual deployment:**

```bash
# Build the image
docker build -t hackathon-tidb-app:latest .

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/hackathon-tidb-app"

# Tag and push
docker tag hackathon-tidb-app:latest ${ECR_URI}:latest
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${ECR_URI}
docker push ${ECR_URI}:latest
```

### Step 3: Create App Runner Service

1. Go to [AWS App Runner Console](https://console.aws.amazon.com/apprunner/)
2. Click "Create service"
3. Choose "Container registry" as source
4. Select ECR and choose your repository
5. Use the image URI from Step 2
6. Configure the service:

#### Service Configuration

- **Service name**: `hackathon-tidb-app`
- **Virtual CPU**: 1 vCPU
- **Virtual memory**: 2 GB
- **Port**: 80
- **Environment**: Production

#### Environment Variables

Set these in the App Runner console:

```
FLASK_ENV=production
TIDB_HOST=gateway01.us-east-1.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=43npE9JtA4bEUeS.root
TIDB_PASSWORD=ql0Af5GGshl8yGmb
TIDB_DATABASE=test
TIDB_SSL_DISABLED=False
TIDB_MAX_CONNECTIONS=10
TIDB_CONNECT_TIMEOUT=10
TIDB_READ_TIMEOUT=30
TIDB_WRITE_TIMEOUT=30
GROQ_API_KEY=your_actual_groq_api_key
```

### Step 4: Deploy and Test

1. Click "Create & deploy"
2. Wait for the service to be in "Running" state
3. Access your application using the provided App Runner URL
4. Test both frontend and API endpoints

## Configuration Files

### Dockerfile

- Multi-stage build for production
- Combines frontend (React + Nginx) and backend (Flask)
- Optimized for AWS App Runner

### apprunner.yaml

- App Runner configuration
- Environment variables
- Runtime settings

### .dockerignore

- Excludes unnecessary files from Docker build context
- Reduces image size and build time

## Environment Variables

### Required Variables

- `TIDB_HOST`: Your TiDB Cloud host
- `TIDB_USER`: Database username
- `TIDB_PASSWORD`: Database password
- `TIDB_DATABASE`: Database name
- `GROQ_API_KEY`: Your Groq API key

### Optional Variables

- `TIDB_PORT`: Database port (default: 4000)
- `TIDB_SSL_DISABLED`: SSL setting (default: False)
- `TIDB_MAX_CONNECTIONS`: Connection pool size (default: 10)

## Monitoring and Logs

1. **CloudWatch Logs**: View application logs
2. **App Runner Metrics**: Monitor performance
3. **Health Checks**: Automatic health monitoring

## Troubleshooting

### Common Issues

1. **Build Failures**

   - Check Docker is running
   - Verify all dependencies are in requirements.txt
   - Check .dockerignore excludes unnecessary files

2. **Runtime Errors**

   - Verify environment variables are set correctly
   - Check CloudWatch logs for detailed error messages
   - Ensure TiDB connection details are correct

3. **API Not Working**
   - Verify Nginx configuration in Dockerfile
   - Check that backend is running on port 5001
   - Test API endpoints directly

### Debug Commands

```bash
# Test Docker build locally
docker build -t test-app .
docker run -p 80:80 test-app

# Check container logs
docker logs <container-id>

# Test API endpoints
curl http://localhost/api/health
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to git
2. **Database Credentials**: Use AWS Secrets Manager for production
3. **API Keys**: Store in environment variables, not in code
4. **HTTPS**: App Runner provides HTTPS by default

## Cost Optimization

1. **Auto Scaling**: Configure appropriate min/max instances
2. **Resource Allocation**: Start with 1 vCPU, 2GB RAM
3. **Monitoring**: Use CloudWatch to optimize resource usage

## Next Steps

1. Set up custom domain (optional)
2. Configure CI/CD pipeline
3. Set up monitoring and alerting
4. Implement database connection pooling
5. Add health check endpoints

## Support

For issues with:

- **AWS App Runner**: Check AWS documentation
- **TiDB**: Check TiDB Cloud documentation
- **Application**: Check CloudWatch logs
