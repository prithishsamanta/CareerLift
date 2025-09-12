# TiDB Cloud Integration Setup Guide

This guide will help you set up TiDB Cloud integration for your Resume Tracker application.

## Prerequisites

1. TiDB Cloud account and cluster access
2. Python 3.8+ installed
3. Node.js and npm installed (for frontend)

## Step 1: Get TiDB Cloud Connection Details

1. Go to your TiDB Cloud cluster: https://tidbcloud.com/clusters/10936281911847544357/overview?orgId=1372813089209277918&projectId=1372813089454595766

2. Click on "Connect" to get your connection details:
   - Host: `gateway01.us-west-2.prod.aws.tidbcloud.com`
   - Port: `4000`
   - Username: Your cluster username
   - Password: Your cluster password
   - Database: `resume_tracker` (or create a new one)

## Step 2: Environment Configuration

1. Copy the environment template:
   ```bash
   cp backend/env.example backend/.env
   ```

2. Update `backend/.env` with your TiDB Cloud details:
   ```env
   TIDB_HOST=gateway01.us-west-2.prod.aws.tidbcloud.com
   TIDB_PORT=4000
   TIDB_USER=your_actual_username
   TIDB_PASSWORD=your_actual_password
   TIDB_DATABASE=resume_tracker
   TIDB_SSL_DISABLED=False
   GROQ_API_KEY=your_groq_api_key_here
   ```

## Step 3: Install Dependencies

1. Install Python dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

## Step 4: Initialize Database

1. Run the database initialization script:
   ```bash
   cd backend/src
   python config/init_database.py
   ```

   This will create all necessary tables:
   - `users` - User authentication and profiles
   - `resumes` - Resume data and parsed information
   - `job_descriptions` - Job posting data and analysis
   - `ai_suggestions` - AI-generated recommendations
   - `job_applications` - Application tracking
   - `user_sessions` - Session management

## Step 5: Start the Application

1. Start the backend server:
   ```bash
   cd backend
   python run.py
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

## Step 6: Test the Integration

1. Open your browser to `http://localhost:3000`
2. Try registering a new user
3. Upload a resume and parse a job description
4. Check that data is being stored in TiDB Cloud

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### Resume Management
- `POST /api/resume/upload` - Upload and parse resume
- `GET /api/resumes` - Get user's resumes

### Job Descriptions
- `POST /api/job-description/parse` - Parse job description
- `GET /api/job-descriptions` - Get user's job descriptions

### AI Suggestions
- `GET /api/ai-suggestions` - Get AI suggestions
- `POST /api/ai-suggestions` - Create AI suggestion
- `PUT /api/ai-suggestions/{id}/read` - Mark suggestion as read

## Database Schema

The application uses the following main tables:

### Users Table
- Stores user authentication data
- Password hashing with bcrypt
- Session management

### Resumes Table
- Stores uploaded resume files and parsed data
- JSON fields for skills, education, work experience, projects
- Linked to users via foreign key

### Job Descriptions Table
- Stores job posting data and analysis
- Technical skills extraction
- Company and position information

### AI Suggestions Table
- Stores AI-generated recommendations
- Categorized by type (skill_gap, career_advice, etc.)
- Priority levels and read status

## Troubleshooting

### Connection Issues
- Verify your TiDB Cloud credentials
- Check if your IP is whitelisted in TiDB Cloud
- Ensure the database exists

### Database Errors
- Run the initialization script again
- Check database permissions
- Verify table creation

### API Errors
- Check authentication tokens
- Verify request format
- Check server logs for detailed errors

## Security Notes

- Never commit `.env` files to version control
- Use strong passwords for database access
- Implement proper CORS settings for production
- Consider using environment-specific configurations

## Next Steps

1. Set up proper error handling and logging
2. Implement data validation and sanitization
3. Add rate limiting for API endpoints
4. Set up monitoring and alerting
5. Implement backup strategies for TiDB Cloud
