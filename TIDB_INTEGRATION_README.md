# TiDB Cloud Integration for Resume Tracker

This document explains how TiDB Cloud has been integrated into your Resume Tracker application for the TiDB Hackathon.

## 🎯 Integration Overview

Your Resume Tracker application now uses TiDB Cloud as the primary database to store:
- **User authentication data** (registration, login, sessions)
- **Resume information** (uploaded files, parsed data, skills, education, work experience)
- **Job descriptions** (parsed job postings, technical skills, company information)
- **AI suggestions** (AI-generated recommendations, career advice, skill gaps)

## 🏗️ Architecture

### Backend (Flask + TiDB Cloud)
- **Database Layer**: TiDB Cloud with PyMySQL connector
- **Authentication**: Session-based auth with bcrypt password hashing
- **API Endpoints**: RESTful API with proper error handling
- **Data Models**: Structured models for users, resumes, job descriptions, and AI suggestions

### Frontend (React + TypeScript)
- **Authentication Context**: Centralized auth state management
- **API Service**: Type-safe API client for backend communication
- **Protected Routes**: Route protection based on authentication status
- **Real-time Updates**: Live data synchronization with TiDB Cloud

## 📊 Database Schema

### Core Tables

1. **`users`** - User accounts and authentication
   - Stores encrypted passwords, profile information
   - Session management with expiration

2. **`resumes`** - Resume data and parsed information
   - JSON fields for skills, education, work experience, projects
   - Links to user accounts

3. **`job_descriptions`** - Job posting analysis
   - Technical skills extraction
   - Company and position metadata

4. **`ai_suggestions`** - AI-generated recommendations
   - Categorized suggestions (skill gaps, career advice, etc.)
   - Priority levels and read status

5. **`job_applications`** - Application tracking
   - Status tracking (applied, interview, rejected, etc.)
   - Notes and metadata

6. **`user_sessions`** - Session management
   - Secure session tokens with expiration

## 🚀 Key Features

### 1. Secure Authentication
- **Password Hashing**: bcrypt for secure password storage
- **Session Management**: Token-based sessions with expiration
- **User Registration**: Complete signup flow with validation

### 2. Resume Management
- **File Upload**: PDF resume upload and text extraction
- **AI Parsing**: Groq/Llama integration for structured data extraction
- **Data Storage**: All parsed data stored in TiDB Cloud
- **Retrieval**: User-specific resume data access

### 3. Job Description Analysis
- **Text Processing**: Job description parsing and analysis
- **Skill Extraction**: Technical skills identification
- **Company Tracking**: Organization and position metadata

### 4. AI Suggestions System
- **Recommendation Engine**: AI-generated career advice
- **Categorization**: Different types of suggestions (skill gaps, career advice, etc.)
- **Priority Management**: High/medium/low priority suggestions
- **Read Status**: Track which suggestions have been viewed

## 🔧 Setup Instructions

### 1. Environment Configuration
```bash
# Copy environment template
cp backend/env.example backend/.env

# Update with your TiDB Cloud credentials
TIDB_HOST=gateway01.us-west-2.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=your_username
TIDB_PASSWORD=your_password
TIDB_DATABASE=resume_tracker
```

### 2. Database Initialization
```bash
cd backend/src
python config/init_database.py
```

### 3. Install Dependencies
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### 4. Start Application
```bash
# Backend (Terminal 1)
cd backend
python run.py

# Frontend (Terminal 2)
cd frontend
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Resume Management
- `POST /api/resume/upload` - Upload and parse resume
- `GET /api/resumes` - Get user's resumes

### Job Descriptions
- `POST /api/job-description/parse` - Parse job description
- `GET /api/job-descriptions` - Get user's job descriptions

### AI Suggestions
- `GET /api/ai-suggestions` - Get AI suggestions
- `POST /api/ai-suggestions` - Create AI suggestion
- `PUT /api/ai-suggestions/{id}/read` - Mark as read

## 🔒 Security Features

- **Password Security**: bcrypt hashing with salt
- **Session Security**: Secure token generation and validation
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Proper cross-origin settings
- **Input Validation**: Server-side validation for all inputs

## 📈 Performance Optimizations

- **Connection Pooling**: Efficient database connection management
- **JSON Storage**: Optimized storage for structured data
- **Indexing**: Database indexes for fast queries
- **Error Handling**: Comprehensive error handling and logging

## 🧪 Testing the Integration

1. **Register a new user** - Test user creation and storage
2. **Upload a resume** - Test file upload and AI parsing
3. **Parse a job description** - Test job analysis functionality
4. **View AI suggestions** - Test recommendation system
5. **Check TiDB Cloud console** - Verify data is being stored

## 🔍 Monitoring and Debugging

### Database Monitoring
- Check TiDB Cloud console for connection status
- Monitor query performance and execution times
- Review database logs for any issues

### Application Logging
- Backend logs include detailed error information
- Database connection status logging
- API request/response logging

## 🚀 Next Steps

### Potential Enhancements
1. **Real-time Notifications**: WebSocket integration for live updates
2. **Advanced Analytics**: User behavior tracking and insights
3. **Data Export**: Export user data in various formats
4. **Mobile App**: React Native mobile application
5. **Advanced AI**: More sophisticated recommendation algorithms

### Production Considerations
1. **Environment Variables**: Use proper environment management
2. **Database Backups**: Implement regular backup strategies
3. **Monitoring**: Set up application performance monitoring
4. **Scaling**: Consider horizontal scaling for high traffic
5. **Security**: Implement additional security measures

## 📞 Support

For issues with the TiDB Cloud integration:
1. Check the setup guide: `backend/TIDB_SETUP_GUIDE.md`
2. Verify your TiDB Cloud cluster configuration
3. Review application logs for error details
4. Ensure all environment variables are correctly set

## 🏆 Hackathon Benefits

This integration demonstrates:
- **Cloud Database Usage**: Effective use of TiDB Cloud for data persistence
- **Scalable Architecture**: Proper separation of concerns and modular design
- **Security Best Practices**: Secure authentication and data handling
- **AI Integration**: Seamless integration of AI services with database storage
- **User Experience**: Smooth user experience with real-time data updates

The application now provides a complete, production-ready solution for resume tracking with persistent data storage in TiDB Cloud!
