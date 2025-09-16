# CareerLift

A comprehensive web application that helps users analyze their career gaps, create personalized learning roadmaps, and track their progress towards professional goals.

Link to the Project: https://w3qk3yvwxp.us-east-1.awsapprunner.com/

## Overview

This platform combines resume analysis, job description parsing, and AI-powered insights to provide users with actionable career development recommendations. Users can create workspaces, upload their resumes and job descriptions, receive detailed gap analysis, and follow structured learning plans.

## Features

### Core Functionality
- **Resume Analysis**: Upload and parse resume content to extract skills and experience
- **Job Description Processing**: Analyze job postings to identify required skills and qualifications
- **Gap Analysis**: Compare current skills against job requirements to identify areas for improvement
- **Learning Roadmaps**: Generate personalized study plans with daily tasks and milestones
- **Progress Tracking**: Monitor completion of learning tasks with calendar and list views
- **Workspace Management**: Organize multiple career development projects in separate workspaces

### User Interface
- **Modern Design**: Clean, responsive interface built with React and Material-UI
- **Interactive Calendar**: Visual task tracking with square calendar cells
- **Task Management**: Mark tasks as complete and view progress statistics
- **Workspace Cards**: Easy navigation between different career projects
- **Real-time Updates**: Immediate feedback on task completion and progress

## Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development
- **Material-UI**: Professional UI components and theming
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication

### Backend
- **Python 3.9+**: Core backend language
- **Flask**: Web framework for API development
- **TiDB**: Distributed SQL database for data storage
- **PyMySQL**: Database connectivity
- **JWT**: Authentication and session management

### AI Integration
- **Groq API**: Large language model integration for analysis
- **Custom Prompts**: Specialized prompts for career gap analysis
- **Data Parsing**: Intelligent extraction of skills and requirements

## Project Structure

```
├── backend/                 # Backend application
│   ├── src/
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── ai_modules/     # AI integration
│   │   ├── config/         # Configuration files
│   │   └── utils/          # Utility functions
│   ├── requirements.txt    # Python dependencies
│   └── run.py             # Application entry point
├── frontend/               # Frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── styles/         # CSS styles
│   ├── package.json        # Node.js dependencies
│   └── public/            # Static assets
└── README.md              # This file
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Python 3.9+
- TiDB database access
- Groq API key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp env.example .env
   # Edit .env with your database and API credentials
   ```

5. Initialize the database:
   ```bash
   python src/config/init_database.py
   ```

6. Start the backend server:
   ```bash
   python run.py
   ```

The backend will be available at `http://localhost:5001`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

## Usage Guide

### Creating a Workspace
1. Sign up or log in to your account
2. Click "Create New Workspace" on the home page
3. Enter a workspace name and description
4. The workspace will appear in your dashboard

### Uploading Documents
1. Select a workspace from your dashboard
2. Upload your resume (PDF format)
3. Add a job description (text or PDF)
4. The system will automatically parse and analyze the content

### Viewing Analysis
1. After document upload, navigate to the Analysis page
2. Review the gap analysis results
3. See recommended skills to improve
4. View your strengths and areas for development

### Following Learning Plans
1. Go to the Tracker page after analysis
2. View your personalized learning roadmap
3. Use the calendar to see daily tasks
4. Mark tasks as complete to track progress
5. Monitor your overall progress in the sidebar

### Managing Workspaces
- **View**: Click on any workspace card to open it
- **Delete**: Use the three-dots menu on workspace cards to delete them
- **Organize**: Create separate workspaces for different career goals

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Workspaces
- `GET /api/workplaces` - Get user workspaces
- `POST /api/workplaces` - Create new workspace
- `GET /api/workplaces/{id}` - Get specific workspace
- `PUT /api/workplaces/{id}` - Update workspace
- `DELETE /api/workplaces/{id}` - Delete workspace

### Documents
- `POST /api/resume/upload` - Upload resume
- `POST /api/job-description/parse` - Parse job description

### Analysis
- `POST /api/analysis/generate` - Generate career gap analysis
- `POST /api/create-roadmap` - Create learning roadmap

### Goals and Tasks
- `POST /api/goals` - Create learning goals
- `GET /api/goals/workplace/{id}` - Get workspace goals
- `POST /api/task-completions` - Mark task completion

## Database Schema

### Core Tables
- **users**: User account information
- **workplaces**: Career development workspaces
- **resumes**: Uploaded resume documents
- **job_descriptions**: Job posting data
- **goals**: Learning goals and roadmaps
- **task_completions**: Task completion tracking

## Development

### Adding New Features
1. Create database models in `backend/src/models/`
2. Add API routes in `backend/src/routes/api_routes.py`
3. Update frontend services in `frontend/src/services/api.ts`
4. Create UI components in `frontend/src/components/`
5. Add pages in `frontend/src/pages/`

### Code Style
- Follow PEP 8 for Python code
- Use TypeScript strict mode for frontend
- Maintain consistent naming conventions
- Add proper error handling and logging

## Troubleshooting

### Common Issues
- **Database Connection**: Ensure TiDB is running and credentials are correct
- **API Errors**: Check backend logs for detailed error messages
- **Frontend Build**: Clear node_modules and reinstall if build fails
- **Authentication**: Verify JWT tokens are being handled correctly

### Logs
- Backend logs: Check console output when running `python run.py`
- Frontend logs: Use browser developer tools console
- Database logs: Check TiDB server logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is developed for educational and hackathon purposes.

## Support

For questions or issues, please check the troubleshooting section or create an issue in the repository.
