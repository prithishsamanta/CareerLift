from flask import Blueprint, request, jsonify
import json
import logging
from datetime import datetime

from utils.groq_llama_parser import parse_resume, parse_job_description
from utils.pdf_extractor import extract_text_from_pdf
from models.user_model import UserModel
from models.resume_model import ResumeModel
from models.job_description_model import JobDescriptionModel
from models.ai_suggestion_model import AISuggestionModel
from models.workplace_model import WorkplaceModel
from models.goals_model import GoalsModel, TaskCompletionModel

def create_suggestions_from_analysis(user_id: int, analysis_data: dict, resume_id: int, job_description_id: int):
    """Create AI suggestions from analysis data"""
    try:
        # Create skill improvement suggestions
        if 'skillsToImprove' in analysis_data and analysis_data['skillsToImprove']:
            for skill in analysis_data['skillsToImprove']:
                title = f"Improve {skill.get('name', 'Unknown Skill')}"
                content = f"Current Level: {skill.get('current', 0)}% | Target Level: {skill.get('target', 100)}%\n\nSuggestion: {skill.get('suggestion', 'No specific suggestion provided')}"
                priority = skill.get('urgency', 'medium').lower()
                
                AISuggestionModel.create_suggestion(
                    user_id=user_id,
                    resume_id=resume_id,
                    job_description_id=job_description_id,
                    suggestion_type='skills_to_improve',
                    title=title,
                    content=content,
                    priority=priority
                )
        
        # Create strength suggestions
        if 'strengths' in analysis_data and analysis_data['strengths']:
            for i, strength in enumerate(analysis_data['strengths']):
                title = f"Strength: {strength}"
                content = f"You have strong skills in {strength}. Consider highlighting this in your resume and interviews."
                
                AISuggestionModel.create_suggestion(
                    user_id=user_id,
                    resume_id=resume_id,
                    job_description_id=job_description_id,
                    suggestion_type='strengths',
                    title=title,
                    content=content,
                    priority='low'
                )
        
        # Create recommendation suggestions
        if 'recommendations' in analysis_data and analysis_data['recommendations']:
            for i, recommendation in enumerate(analysis_data['recommendations']):
                title = f"Career Recommendation {i+1}"
                content = recommendation
                
                AISuggestionModel.create_suggestion(
                    user_id=user_id,
                    resume_id=resume_id,
                    job_description_id=job_description_id,
                    suggestion_type='recommendations',
                    title=title,
                    content=content,
                    priority='medium'
                )
        
        # Create general suggestions
        if 'suggestions' in analysis_data and analysis_data['suggestions']:
            for i, suggestion in enumerate(analysis_data['suggestions']):
                title = f"Learning Suggestion {i+1}"
                content = suggestion
                
                AISuggestionModel.create_suggestion(
                    user_id=user_id,
                    resume_id=resume_id,
                    job_description_id=job_description_id,
                    suggestion_type='suggestions',
                    title=title,
                    content=content,
                    priority='low'
                )
        
        # Create summary suggestion
        if 'summary' in analysis_data and analysis_data['summary']:
            AISuggestionModel.create_suggestion(
                user_id=user_id,
                resume_id=resume_id,
                job_description_id=job_description_id,
                suggestion_type='summary',
                title='Analysis Summary',
                content=analysis_data['summary'],
                priority='high'
            )
        
        # Create conclusion suggestion
        if 'conclusion' in analysis_data and analysis_data['conclusion']:
            AISuggestionModel.create_suggestion(
                user_id=user_id,
                resume_id=resume_id,
                job_description_id=job_description_id,
                suggestion_type='conclusion',
                title='Career Conclusion',
                content=analysis_data['conclusion'],
                priority='medium'
            )
            
    except Exception as e:
        logger.error(f"Error creating suggestions from analysis: {e}")
        raise e

from ai_modules.agents.roadmap_agent import create_study_plan

def create_suggestions_from_analysis(user_id: int, analysis_data: dict, resume_id: int, job_description_id: int):
    """Create AI suggestions from analysis data"""
    try:
        # Create skill improvement suggestions
        if 'skillsToImprove' in analysis_data and analysis_data['skillsToImprove']:
            for skill in analysis_data['skillsToImprove']:
                title = f"Improve {skill.get('name', 'Unknown Skill')}"
                content = f"Current Level: {skill.get('current', 0)}% | Target Level: {skill.get('target', 100)}%\n\nSuggestion: {skill.get('suggestion', 'No specific suggestion provided')}"
                priority = skill.get('urgency', 'medium').lower()
                
                AISuggestionModel.create_suggestion(
                    user_id=user_id,
                    resume_id=resume_id,
                    job_description_id=job_description_id,
                    suggestion_type='skills_to_improve',
                    title=title,
                    content=content,
                    priority=priority
                )
        
        # Create strength suggestions
        if 'strengths' in analysis_data and analysis_data['strengths']:
            for i, strength in enumerate(analysis_data['strengths']):
                title = f"Strength: {strength}"
                content = f"You have strong skills in {strength}. Consider highlighting this in your resume and interviews."
                
                AISuggestionModel.create_suggestion(
                    user_id=user_id,
                    resume_id=resume_id,
                    job_description_id=job_description_id,
                    suggestion_type='strengths',
                    title=title,
                    content=content,
                    priority='low'
                )
        
        # Create recommendation suggestions
        if 'recommendations' in analysis_data and analysis_data['recommendations']:
            for i, recommendation in enumerate(analysis_data['recommendations']):
                title = f"Career Recommendation {i+1}"
                content = recommendation
                
                AISuggestionModel.create_suggestion(
                    user_id=user_id,
                    resume_id=resume_id,
                    job_description_id=job_description_id,
                    suggestion_type='recommendations',
                    title=title,
                    content=content,
                    priority='medium'
                )
        
        # Create general suggestions
        if 'suggestions' in analysis_data and analysis_data['suggestions']:
            for i, suggestion in enumerate(analysis_data['suggestions']):
                title = f"Learning Suggestion {i+1}"
                content = suggestion
                
                AISuggestionModel.create_suggestion(
                    user_id=user_id,
                    resume_id=resume_id,
                    job_description_id=job_description_id,
                    suggestion_type='suggestions',
                    title=title,
                    content=content,
                    priority='low'
                )
        
        # Create summary suggestion
        if 'summary' in analysis_data and analysis_data['summary']:
            AISuggestionModel.create_suggestion(
                user_id=user_id,
                resume_id=resume_id,
                job_description_id=job_description_id,
                suggestion_type='summary',
                title='Analysis Summary',
                content=analysis_data['summary'],
                priority='high'
            )
        
        # Create conclusion suggestion
        if 'conclusion' in analysis_data and analysis_data['conclusion']:
            AISuggestionModel.create_suggestion(
                user_id=user_id,
                resume_id=resume_id,
                job_description_id=job_description_id,
                suggestion_type='conclusion',
                title='Career Conclusion',
                content=analysis_data['conclusion'],
                priority='medium'
            )
            
    except Exception as e:
        logger.error(f"Error creating suggestions from analysis: {e}")
        raise e

from ai_modules.agents.career_gap_agent import run_gap_analysis

logger = logging.getLogger(__name__)

# Create Blueprint for API routes
api_bp = Blueprint('api', __name__)

#  Health check
@api_bp.route('/health', methods=['GET'])
def api_health():
    return jsonify({
        'status': 'success',
        'message': 'API is working correctly'
    })

#   User Registration
@api_bp.route('/auth/register', methods=['POST'])
def register_user():
    """
    Register a new user
    """
    try:
        if not request.is_json:
            return jsonify({
                'status': 'error',
                'message': 'Request must contain JSON data'
            }), 400
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'firstName', 'lastName']
        for field in required_fields:
            if field not in data or not data[field].strip():
                return jsonify({
                    'status': 'error',
                    'message': f'{field} is required'
                }), 400
        
        # Validate email format
        email = data['email'].strip().lower()
        if '@' not in email or '.' not in email:
            return jsonify({
                'status': 'error',
                'message': 'Please enter a valid email address'
            }), 400
        
        # Validate password length
        password = data['password']
        if len(password) < 6:
            return jsonify({
                'status': 'error',
                'message': 'Password must be at least 6 characters long'
            }), 400
        
        # Create user
        user = UserModel.create_user(
            email=email,
            password=password,
            first_name=data['firstName'].strip(),
            last_name=data['lastName'].strip()
        )
        
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'User with this email already exists'
            }), 409
        
        # Create session
        session_token = UserModel.create_session(user['id'])
        if not session_token:
            return jsonify({
                'status': 'error',
                'message': 'Failed to create user session'
            }), 500
        
        return jsonify({
            'status': 'success',
            'message': 'User registered successfully',
            'user': {
                'id': user['id'],
                'email': user['email'],
                'firstName': user['first_name'],
                'lastName': user['last_name']
            },
            'sessionToken': session_token
        }), 201
        
    except Exception as e:
        logger.error(f"User registration error: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Registration failed: {str(e)}'
        }), 500

#   User Login
@api_bp.route('/auth/login', methods=['POST'])
def login_user():
    """
    Authenticate user and create session
    """
    try:
        if not request.is_json:
            return jsonify({
                'status': 'error',
                'message': 'Request must contain JSON data'
            }), 400
        
        data = request.get_json()
        
        # Validate required fields
        if 'email' not in data or 'password' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Email and password are required'
            }), 400
        
        email = data['email'].strip().lower()
        password = data['password']
        
        # Authenticate user
        user = UserModel.authenticate_user(email, password)
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Invalid email or password'
            }), 401
        
        # Create session
        session_token = UserModel.create_session(user['id'])
        if not session_token:
            return jsonify({
                'status': 'error',
                'message': 'Failed to create user session'
            }), 500
        
        return jsonify({
            'status': 'success',
            'message': 'Login successful',
            'user': {
                'id': user['id'],
                'email': user['email'],
                'firstName': user['first_name'],
                'lastName': user['last_name']
            },
            'sessionToken': session_token
        }), 200
        
    except Exception as e:
        logger.error(f"User login error: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Login failed: {str(e)}'
        }), 500

#   User Logout
@api_bp.route('/auth/logout', methods=['POST'])
def logout_user():
    """
    Logout user and invalidate session
    """
    try:
        # Get session token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'status': 'error',
                'message': 'Authorization token required'
            }), 401
        
        session_token = auth_header.split(' ')[1]
        
        # Delete session
        success = UserModel.delete_session(session_token)
        if not success:
            return jsonify({
                'status': 'error',
                'message': 'Invalid session token'
            }), 401
        
        return jsonify({
            'status': 'success',
            'message': 'Logout successful'
        }), 200
        
    except Exception as e:
        logger.error(f"User logout error: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Logout failed: {str(e)}'
        }), 500

#   Get Current User
@api_bp.route('/auth/me', methods=['GET'])
def get_current_user():
    """
    Get current user information from session
    """
    try:
        # Get session token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'status': 'error',
                'message': 'Authorization token required'
            }), 401
        
        session_token = auth_header.split(' ')[1]
        
        # Validate session and get user
        user = UserModel.validate_session(session_token)
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Invalid or expired session'
            }), 401
        
        return jsonify({
            'status': 'success',
            'user': {
                'id': user['id'],
                'email': user['email'],
                'firstName': user['first_name'],
                'lastName': user['last_name']
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Get current user error: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get user information: {str(e)}'
        }), 500

#   Resume upload and parsing endpoint
@api_bp.route('/resume/upload', methods=['POST'])
def upload_and_parse_resume():
    """
    Upload resume file and parse it using Groq/Llama
    Returns structured JSON with Skills, Education, Work Experience, Projects
    """
    try:
        # Check authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'status': 'error',
                'message': 'Authorization token required'
            }), 401
        
        session_token = auth_header.split(' ')[1]
        user = UserModel.validate_session(session_token)
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Invalid or expired session'
            }), 401
        
        # Check if file is present in request
        if 'resume' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'No resume file provided'
            }), 400
        
        file = request.files['resume']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({
                'status': 'error',
                'message': 'No file selected'
            }), 400
        
        # Check file type - only PDF allowed
        file_extension = '.' + file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        
        if file_extension != '.pdf':
            return jsonify({
                'status': 'error',
                'message': 'Only PDF files are supported. Please upload a PDF file.'
            }), 400
        
        # Extract text from PDF
        file_content = file.read()
        extracted_text = extract_text_from_pdf(file_content)
        
        if not extracted_text:
            return jsonify({
                'status': 'error',
                'message': 'Failed to extract text from the uploaded file'
            }), 400
        
        # Parse resume using Groq/Llama
        parsed_data = parse_resume(extracted_text)
        
        # Store resume in database
        resume = ResumeModel.create_resume(
            user_id=user['id'],
            filename=file.filename,
            original_text=extracted_text,
            parsed_data=parsed_data
        )
        
        if not resume:
            return jsonify({
                'status': 'error',
                'message': 'Failed to save resume to database'
            }), 500
        
        # Add metadata
        response_data = {
            'status': 'success',
            'message': 'Resume parsed and saved successfully',
            'resumeId': resume['id'],
            'filename': file.filename,
            'extracted_text_length': len(extracted_text),
            'parsed_data': parsed_data
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Resume upload/parse error: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to process resume: {str(e)}'
        }), 500


#   Job description parsing endpoint
@api_bp.route('/job-description/parse', methods=['POST'])
def parse_job_description_text():
    """
    Parse job description text using Groq/Llama
    Returns structured JSON with Technical Skills and Technical Synopsis
    """
    try:
        # Check authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'status': 'error',
                'message': 'Authorization token required'
            }), 401
        
        session_token = auth_header.split(' ')[1]
        user = UserModel.validate_session(session_token)
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Invalid or expired session'
            }), 401
        
        # Check if JSON data is present in request
        if not request.is_json:
            return jsonify({
                'status': 'error',
                'message': 'Request must contain JSON data'
            }), 400
        
        data = request.get_json()
        
        # Check if job_description is provided
        if 'job_description' not in data or not data['job_description'].strip():
            return jsonify({
                'status': 'error',
                'message': 'Job description text is required'
            }), 400
        
        job_description_text = data['job_description'].strip()
        title = data.get('title', '')
        company = data.get('company', '')
        
        # Parse job description using Groq/Llama
        parsed_data = parse_job_description(job_description_text)
        
        # Store job description in database
        job_description = JobDescriptionModel.create_job_description(
            user_id=user['id'],
            title=title,
            company=company,
            original_text=job_description_text,
            parsed_data=parsed_data
        )
        
        if not job_description:
            return jsonify({
                'status': 'error',
                'message': 'Failed to save job description to database'
            }), 500
        
        # Add metadata
        response_data = {
            'status': 'success',
            'message': 'Job description parsed and saved successfully',
            'jobDescriptionId': job_description['id'],
            'text_length': len(job_description_text),
            'parsed_data': parsed_data
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Job description parse error: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to process job description: {str(e)}'
        }), 500

#   Get user's resumes
@api_bp.route('/resumes', methods=['GET'])
def get_user_resumes():
    """
    Get all resumes for the authenticated user
    """
    try:
        # Check authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'status': 'error',
                'message': 'Authorization token required'
            }), 401
        
        session_token = auth_header.split(' ')[1]
        user = UserModel.validate_session(session_token)
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Invalid or expired session'
            }), 401
        
        # Get user's resumes
        resumes = ResumeModel.get_resumes_by_user(user['id'])
        
        return jsonify({
            'status': 'success',
            'resumes': resumes
        }), 200
        
    except Exception as e:
        logger.error(f"Get user resumes error: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get resumes: {str(e)}'
        }), 500

#   Get user's job descriptions
@api_bp.route('/job-descriptions', methods=['GET'])
def get_user_job_descriptions():
    """
    Get all job descriptions for the authenticated user
    """
    try:
        # Check authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'status': 'error',
                'message': 'Authorization token required'
            }), 401
        
        session_token = auth_header.split(' ')[1]
        user = UserModel.validate_session(session_token)
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Invalid or expired session'
            }), 401
        
        # Get user's job descriptions
        job_descriptions = JobDescriptionModel.get_job_descriptions_by_user(user['id'])
        
        return jsonify({
            'status': 'success',
            'jobDescriptions': job_descriptions
        }), 200
        
    except Exception as e:
        logger.error(f"Get user job descriptions error: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get job descriptions: {str(e)}'
        }), 500

#   Get AI suggestions
@api_bp.route('/ai-suggestions', methods=['GET'])
def get_ai_suggestions():
    """
    Get AI suggestions for the authenticated user
    """
    try:
        # Check authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'status': 'error',
                'message': 'Authorization token required'
            }), 401
        
        session_token = auth_header.split(' ')[1]
        user = UserModel.validate_session(session_token)
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Invalid or expired session'
            }), 401
        
        # Get query parameters
        suggestion_type = request.args.get('type')
        is_read = request.args.get('isRead')
        if is_read is not None:
            is_read = is_read.lower() == 'true'
        
        # Get user's AI suggestions
        suggestions = AISuggestionModel.get_suggestions_by_user(
            user_id=user['id'],
            suggestion_type=suggestion_type,
            is_read=is_read
        )
        
        # Get suggestion stats
        stats = AISuggestionModel.get_suggestion_stats(user['id'])
        
        return jsonify({
            'status': 'success',
            'suggestions': suggestions,
            'stats': stats
        }), 200
        
    except Exception as e:
        logger.error(f"Get AI suggestions error: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get AI suggestions: {str(e)}'
        }), 500

#   Create AI suggestion
@api_bp.route('/ai-suggestions', methods=['POST'])
def create_ai_suggestion():
    """
    Create a new AI suggestion
    """
    try:
        # Check authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'status': 'error',
                'message': 'Authorization token required'
            }), 401
        
        session_token = auth_header.split(' ')[1]
        user = UserModel.validate_session(session_token)
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Invalid or expired session'
            }), 401
        
        # Check if JSON data is present in request
        if not request.is_json:
            return jsonify({
                'status': 'error',
                'message': 'Request must contain JSON data'
            }), 400
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['suggestionType', 'title', 'content']
        for field in required_fields:
            if field not in data or not data[field].strip():
                return jsonify({
                    'status': 'error',
                    'message': f'{field} is required'
                }), 400
        
        # Create AI suggestion
        suggestion = AISuggestionModel.create_suggestion(
            user_id=user['id'],
            suggestion_type=data['suggestionType'],
            title=data['title'],
            content=data['content'],
            priority=data.get('priority', 'medium'),
            resume_id=data.get('resumeId'),
            job_description_id=data.get('jobDescriptionId')
        )
        
        if not suggestion:
            return jsonify({
                'status': 'error',
                'message': 'Failed to create AI suggestion'
            }), 500
        
        return jsonify({
            'status': 'success',
            'message': 'AI suggestion created successfully',
            'suggestion': suggestion
        }), 201
        
    except Exception as e:
        logger.error(f"Create AI suggestion error: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to create AI suggestion: {str(e)}'
        }), 500

#   Mark AI suggestion as read
@api_bp.route('/ai-suggestions/<int:suggestion_id>/read', methods=['PUT'])
def mark_suggestion_as_read(suggestion_id):
    """
    Mark an AI suggestion as read
    """
    try:
        # Check authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'status': 'error',
                'message': 'Authorization token required'
            }), 401
        
        session_token = auth_header.split(' ')[1]
        user = UserModel.validate_session(session_token)
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Invalid or expired session'
            }), 401
        
        # Mark suggestion as read
        success = AISuggestionModel.mark_suggestion_as_read(suggestion_id, user['id'])
        
        if not success:
            return jsonify({
                'status': 'error',
                'message': 'Suggestion not found or already marked as read'
            }), 404
        
        return jsonify({
            'status': 'success',
            'message': 'Suggestion marked as read'
        }), 200
        
    except Exception as e:
        logger.error(f"Mark suggestion as read error: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to mark suggestion as read: {str(e)}'
        }), 500

#   Generate Analysis - Create workplace with latest resume and job description
@api_bp.route('/analysis/generate', methods=['POST'])
def generate_analysis():
    """
    Generate analysis by creating a workplace with latest resume and job description
    """
    try:
        # Check authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'status': 'error',
                'message': 'Authorization token required'
            }), 401
        
        session_token = auth_header.split(' ')[1]
        user = UserModel.validate_session(session_token)
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Invalid or expired session'
            }), 401
        
        # Get request data
        data = request.get_json() if request.is_json else {}
        workplace_name = data.get('name')
        workplace_description = data.get('description')
        
        # Get latest resume and job description for the user
        latest_data = WorkplaceModel.get_latest_resume_and_job_description(user['id'])
        
        if not latest_data['resume']:
            return jsonify({
                'status': 'error',
                'message': 'No resume found. Please upload a resume first.'
            }), 400
        
        if not latest_data['job_description']:
            return jsonify({
                'status': 'error',
                'message': 'No job description found. Please add a job description first.'
            }), 400
        
        # Check if we should update an existing workplace or create a new one
        workplace = None
        workplace_id = data.get('workplace_id')
        
        if workplace_id:
            # Update existing workplace
            workplace = WorkplaceModel.update_workplace(
                workplace_id,
                resume_id=latest_data['resume']['id'],
                job_description_id=latest_data['job_description']['id']
            )
            
            if not workplace:
                return jsonify({
                    'status': 'error',
                    'message': 'Failed to update workspace'
                }), 500
        else:
            # Create new workplace with the latest resume and job description
            workplace = WorkplaceModel.create_workplace(
                user_id=user['id'],
                resume_id=latest_data['resume']['id'],
                job_description_id=latest_data['job_description']['id'],
                name=workplace_name,
                description=workplace_description
            )
            
            if not workplace:
                return jsonify({
                    'status': 'error',
                    'message': 'Failed to create analysis session'
                }), 500
        
        # Prepare resume and job data for gap analysis
        try:
            resume_parsed_data = json.loads(latest_data['resume']['parsed_data']) if latest_data['resume']['parsed_data'] else {}
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse resume data: {e}")
            resume_parsed_data = {'error': 'Failed to parse resume data'}
            
        try:
            job_parsed_data = json.loads(latest_data['job_description']['parsed_data']) if latest_data['job_description']['parsed_data'] else {}
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse job description data: {e}")
            job_parsed_data = {'error': 'Failed to parse job description data'}
        
        # Run gap analysis using the agent
        gap_analysis_result = None
        try:
            logger.info(f"Starting gap analysis for user {user['id']}")
            logger.info(f"Resume data keys: {list(resume_parsed_data.keys()) if isinstance(resume_parsed_data, dict) else 'Not a dict'}")
            logger.info(f"Job data keys: {list(job_parsed_data.keys()) if isinstance(job_parsed_data, dict) else 'Not a dict'}")
            
            gap_analysis_result = run_gap_analysis(
                resume_data=resume_parsed_data,
                job_data=job_parsed_data,
                user_id=user['id']
            )
            logger.info(f"Gap analysis completed for user {user['id']}")
        except Exception as gap_error:
            logger.error(f"Gap analysis failed: {gap_error}")
            logger.error(f"Gap analysis error type: {type(gap_error)}")
            import traceback
            logger.error(f"Gap analysis traceback: {traceback.format_exc()}")
            # Continue without gap analysis if it fails
        
        # Update workplace with analysis data if available
        if gap_analysis_result and gap_analysis_result.get('status') == 'success':
            WorkplaceModel.update_workplace_analysis(workplace['id'], {
                'gap_analysis': gap_analysis_result['analysis'],
                'analysis_timestamp': datetime.now().isoformat()
            })
            
            # Create AI suggestions from the analysis data
            try:
                create_suggestions_from_analysis(
                    user_id=user['id'],
                    analysis_data=gap_analysis_result['analysis'],
                    resume_id=latest_data['resume']['id'],
                    job_description_id=latest_data['job_description']['id']
                )
                logger.info(f"Created AI suggestions for user {user['id']}")
            except Exception as suggestion_error:
                logger.error(f"Failed to create AI suggestions: {suggestion_error}")
                # Don't fail the entire request if suggestions fail
        
        # Return workplace data with resume and job description info
        response_data = {
            'status': 'success',
            'message': 'Analysis session created successfully',
            'workplace': workplace,
            'resume_data': {
                'id': latest_data['resume']['id'],
                'filename': latest_data['resume']['filename'],
                'parsed_data': resume_parsed_data
            },
            'job_description_data': {
                'id': latest_data['job_description']['id'],
                'title': latest_data['job_description']['title'],
                'company': latest_data['job_description']['company'],
                'parsed_data': job_parsed_data
            },
            'gap_analysis': gap_analysis_result
        }
        
        return jsonify(response_data), 201
        
    except Exception as e:
        logger.error(f"Generate analysis error: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to generate analysis: {str(e)}'
        }), 500

#   Get user's workplaces
@api_bp.route('/workplaces', methods=['GET'])
def get_user_workplaces():
    """
    Get all workplaces (analysis sessions) for the authenticated user
    """
    try:
        # Check authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'status': 'error',
                'message': 'Authorization token required'
            }), 401
        
        session_token = auth_header.split(' ')[1]
        user = UserModel.validate_session(session_token)
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Invalid or expired session'
            }), 401
        
        # Get user's workplaces
        workplaces = WorkplaceModel.get_workplaces_by_user(user['id'])
        
        return jsonify({
            'status': 'success',
            'workplaces': workplaces
        }), 200
        
    except Exception as e:
        logger.error(f"Get user workplaces error: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get workplaces: {str(e)}'
        }), 500

#   Create a new workplace
@api_bp.route('/workplaces', methods=['POST'])
def create_workplace():
    """
    Create a new workplace (workspace) for the authenticated user
    """
    try:
        # Check authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'status': 'error',
                'message': 'Authorization token required'
            }), 401
        
        session_token = auth_header.split(' ')[1]
        user = UserModel.validate_session(session_token)
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Invalid or expired session'
            }), 401
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'Request data required'
            }), 400
        
        workplace_name = data.get('name', f'Analysis Session - {datetime.now().strftime("%Y-%m-%d %H:%M")}')
        workplace_description = data.get('description', f'Workspace for {workplace_name}')
        
        # Create workplace without resume and job description initially
        workplace = WorkplaceModel.create_workplace(
            user_id=user['id'],
            name=workplace_name,
            description=workplace_description
        )
        
        if not workplace:
            return jsonify({
                'status': 'error',
                'message': 'Failed to create workspace'
            }), 500
        
        return jsonify({
            'status': 'success',
            'workplace': workplace,
            'message': 'Workspace created successfully'
        }), 201
        
    except Exception as e:
        logger.error(f"Create workplace error: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to create workspace: {str(e)}'
        }), 500

#   Update workplace with resume and job description
@api_bp.route('/workplaces/<int:workplace_id>', methods=['PUT'])
def update_workplace(workplace_id):
    """
    Update an existing workplace with resume and job description data
    """
    try:
        # Check authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'status': 'error',
                'message': 'Authorization token required'
            }), 401
        
        session_token = auth_header.split(' ')[1]
        user = UserModel.validate_session(session_token)
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Invalid or expired session'
            }), 401
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'Request data required'
            }), 400
        
        # Verify workplace belongs to user
        workplace = WorkplaceModel.get_workplace_by_id(workplace_id)
        if not workplace or workplace['user_id'] != user['id']:
            return jsonify({
                'status': 'error',
                'message': 'Workplace not found or access denied'
            }), 404
        
        # Update workplace with new data
        update_data = {}
        if 'resume_id' in data:
            update_data['resume_id'] = data['resume_id']
        if 'job_description_id' in data:
            update_data['job_description_id'] = data['job_description_id']
        if 'name' in data:
            update_data['name'] = data['name']
        if 'description' in data:
            update_data['description'] = data['description']
        
        if update_data:
            updated_workplace = WorkplaceModel.update_workplace(workplace_id, **update_data)
            if not updated_workplace:
                return jsonify({
                    'status': 'error',
                    'message': 'Failed to update workspace'
                }), 500
        
        return jsonify({
            'status': 'success',
            'workplace': updated_workplace if update_data else workplace,
            'message': 'Workspace updated successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Update workplace error: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to update workspace: {str(e)}'
        }), 500

#   Get specific workplace with full data
@api_bp.route('/workplaces/<int:workplace_id>', methods=['GET'])
def get_workplace(workplace_id):
    """
    Get a specific workplace with full resume and job description data
    """
    try:
        # Check authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'status': 'error',
                'message': 'Authorization token required'
            }), 401
        
        session_token = auth_header.split(' ')[1]
        user = UserModel.validate_session(session_token)
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Invalid or expired session'
            }), 401
        
        # Get workplace with full data
        workplace = WorkplaceModel.get_workplace_by_id(workplace_id)
        
        if not workplace:
            return jsonify({
                'status': 'error',
                'message': 'Workplace not found'
            }), 404
        
        # Verify user owns this workplace
        if workplace['user_id'] != user['id']:
            return jsonify({
                'status': 'error',
                'message': 'Access denied'
            }), 403
        
        return jsonify({
            'status': 'success',
            'workplace': workplace
        }), 200
        
    except Exception as e:
        logger.error(f"Get workplace error: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get workplace: {str(e)}'
        }), 500

@api_bp.route('/workplaces/<int:workplace_id>', methods=['DELETE'])
def delete_workplace(workplace_id):
    """
    Delete a workplace and all associated data
    """
    try:
        # Check authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'status': 'error',
                'message': 'Authorization token required'
            }), 401
        
        session_token = auth_header.split(' ')[1]
        user = UserModel.validate_session(session_token)
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Invalid or expired session'
            }), 401
        
        # Get workplace to verify ownership
        workplace = WorkplaceModel.get_workplace_by_id(workplace_id)
        
        if not workplace:
            return jsonify({
                'status': 'error',
                'message': 'Workplace not found'
            }), 404
        
        # Verify user owns this workplace
        if workplace['user_id'] != user['id']:
            return jsonify({
                'status': 'error',
                'message': 'Access denied'
            }), 403
        
        # Delete the workplace (this will cascade delete related data)
        success = WorkplaceModel.delete_workplace(workplace_id)
        
        if not success:
            return jsonify({
                'status': 'error',
                'message': 'Failed to delete workplace'
            }), 500
        
        return jsonify({
            'status': 'success',
            'message': 'Workplace deleted successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Delete workplace error: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to delete workplace: {str(e)}'
        }), 500

@api_bp.route("/ai/skill-gap", methods=["POST"])
def skill_gap_analysis():
    data = request.json
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({
            'status': 'error',
            'message': 'Authorization token required'
        }), 401
        
    session_token = auth_header.split(' ')[1]
    user = UserModel.validate_session(session_token)
    if not user:
        return jsonify({
            'status': 'error',
            'message': 'Invalid or expired session'
        }), 401

    resume = data.get("resume")
    job = data.get("job")

    if not resume or not job:
        return jsonify({"error": "Missing resume or job data"}), 400

    try:
        result = run_gap_analysis(resume, job, user['id'])
        print(result)
        
        return jsonify({"analysis": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/create-roadmap', methods=['POST'])
def create_roadmap():
    try:
        # Get input data from request
        data = request.get_json()

        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'status': 'error',
                'message': 'Authorization token required'
            }), 401
            
        session_token = auth_header.split(' ')[1]
        user = UserModel.validate_session(session_token)
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Invalid or expired session'
            }), 401
        
        duration = data.get('duration', 14)
        
        logger.info(f"🚀 Creating roadmap for user {user['id']} with duration {duration}")
        
        # Try to create AI-powered study plan
        try:
            # Attempt to import and use AI roadmap generation
            from ai_modules.agents.roadmap_agent import create_study_plan
            logger.info("📦 Successfully imported roadmap agent")
            study_plan = create_study_plan(duration, user['id'])
            logger.info(f"✅ AI-powered study plan created successfully: {type(study_plan)}")
            logger.info(f"📊 Study plan keys: {list(study_plan.keys()) if isinstance(study_plan, dict) else 'Not a dict'}")
        except ImportError as e:
            logger.error(f"AI roadmap module not available: {e}")
            return jsonify({
                'status': 'error',
                'message': 'AI roadmap generation is currently unavailable',
                'error': str(e)
            }), 503
        except Exception as e:
            logger.error(f"AI roadmap generation failed: {e}")
            return jsonify({
                'status': 'error',
                'message': 'Failed to generate AI-powered study plan',
                'error': str(e)
            }), 500
        
        return jsonify({
            'status': 'success',
            'data': study_plan
        }), 200
        
    except Exception as e:
        logger.error(f"Error creating roadmap: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to create roadmap',
            'error': str(e)
        }), 500

# Goals API endpoints

@api_bp.route('/goals', methods=['POST'])
def create_goal():
    """
    Create or update a goal for a workplace
    """
    try:
        # Check authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'status': 'error',
                'message': 'Authorization token required'
            }), 401
        
        session_token = auth_header.split(' ')[1]
        user = UserModel.validate_session(session_token)
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Invalid or expired session'
            }), 401
        
        # Check if JSON data is present in request
        if not request.is_json:
            return jsonify({
                'status': 'error',
                'message': 'Request must contain JSON data'
            }), 400
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['workplace_id', 'goal_data']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'{field} is required'
                }), 400
        
        # Create or update goal
        goal = GoalsModel.create_goal(
            user_id=user['id'],
            workplace_id=data['workplace_id'],
            goal_data=data['goal_data'],
            duration_days=data.get('duration_days', 14)
        )
        
        if not goal:
            return jsonify({
                'status': 'error',
                'message': 'Failed to create/update goal'
            }), 500
        
        return jsonify({
            'status': 'success',
            'message': 'Goal saved successfully',
            'goal': goal
        }), 201
        
    except Exception as e:
        logger.error(f"Create goal error: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to create goal: {str(e)}'
        }), 500

@api_bp.route('/goals/workplace/<int:workplace_id>', methods=['GET'])
def get_goal_by_workplace(workplace_id):
    """
    Get the active goal for a specific workplace
    """
    try:
        # Check authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'status': 'error',
                'message': 'Authorization token required'
            }), 401
        
        session_token = auth_header.split(' ')[1]
        user = UserModel.validate_session(session_token)
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Invalid or expired session'
            }), 401
        
        # Get goal for workplace
        goal = GoalsModel.get_goal_by_workplace(user['id'], workplace_id)
        
        if goal:
            return jsonify({
                'status': 'success',
                'goal': goal
            }), 200
        else:
            return jsonify({
                'status': 'success',
                'goal': None,
                'message': 'No active goal found for this workplace'
            }), 200
        
    except Exception as e:
        logger.error(f"Get goal by workplace error: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get goal: {str(e)}'
        }), 500

@api_bp.route('/goals', methods=['GET'])
def get_user_goals():
    """
    Get all goals for the authenticated user
    """
    try:
        # Check authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'status': 'error',
                'message': 'Authorization token required'
            }), 401
        
        session_token = auth_header.split(' ')[1]
        user = UserModel.validate_session(session_token)
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Invalid or expired session'
            }), 401
        
        # Get all goals for user
        goals = GoalsModel.get_goals_by_user(user['id'])
        
        return jsonify({
            'status': 'success',
            'goals': goals
        }), 200
        
    except Exception as e:
        logger.error(f"Get user goals error: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get goals: {str(e)}'
        }), 500

@api_bp.route('/goals/<int:goal_id>', methods=['DELETE'])
def delete_goal(goal_id):
    """
    Delete a goal
    """
    try:
        # Check authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'status': 'error',
                'message': 'Authorization token required'
            }), 401
        
        session_token = auth_header.split(' ')[1]
        user = UserModel.validate_session(session_token)
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Invalid or expired session'
            }), 401
        
        # Delete goal
        success = GoalsModel.delete_goal(goal_id, user['id'])
        
        if success:
            return jsonify({
                'status': 'success',
                'message': 'Goal deleted successfully'
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': 'Goal not found or could not be deleted'
            }), 404
        
    except Exception as e:
        logger.error(f"Delete goal error: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to delete goal: {str(e)}'
        }), 500

# Task completion API endpoints

@api_bp.route('/task-completions', methods=['POST'])
def mark_task_completion():
    """
    Mark a task as completed or uncompleted
    """
    try:
        # Check authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'status': 'error',
                'message': 'Authorization token required'
            }), 401
        
        session_token = auth_header.split(' ')[1]
        user = UserModel.validate_session(session_token)
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Invalid or expired session'
            }), 401
        
        # Check if JSON data is present in request
        if not request.is_json:
            return jsonify({
                'status': 'error',
                'message': 'Request must contain JSON data'
            }), 400
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['workplace_id', 'task_id', 'task_date']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'{field} is required'
                }), 400
        
        # Mark task completion
        success = TaskCompletionModel.mark_task_completed(
            user_id=user['id'],
            workplace_id=data['workplace_id'],
            task_id=data['task_id'],
            task_date=datetime.strptime(data['task_date'], '%Y-%m-%d').date(),
            is_completed=data.get('is_completed', True)
        )
        
        if success:
            return jsonify({
                'status': 'success',
                'message': 'Task completion updated successfully'
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': 'Failed to update task completion'
            }), 500
        
    except Exception as e:
        logger.error(f"Mark task completion error: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to update task completion: {str(e)}'
        }), 500

@api_bp.route('/task-completions/workplace/<int:workplace_id>', methods=['GET'])
def get_task_completions(workplace_id):
    """
    Get task completion status for a workplace
    """
    try:
        # Check authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'status': 'error',
                'message': 'Authorization token required'
            }), 401
        
        session_token = auth_header.split(' ')[1]
        user = UserModel.validate_session(session_token)
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Invalid or expired session'
            }), 401
        
        # Get query parameters for date range
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        start_date_obj = None
        end_date_obj = None
        
        if start_date:
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
        if end_date:
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        # Get task completions
        completions = TaskCompletionModel.get_task_completions(
            user_id=user['id'],
            workplace_id=workplace_id,
            start_date=start_date_obj,
            end_date=end_date_obj
        )
        
        # Get completion stats
        stats = TaskCompletionModel.get_completion_stats(user['id'], workplace_id)
        
        return jsonify({
            'status': 'success',
            'completions': completions,
            'stats': stats
        }), 200
        
    except Exception as e:
        logger.error(f"Get task completions error: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get task completions: {str(e)}'
        }), 500