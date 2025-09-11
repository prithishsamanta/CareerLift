from flask import Blueprint, request, jsonify
import logging

from utils.groq_llama_parser import parse_resume, parse_job_description
from utils.pdf_extractor import extract_text_from_pdf
from models.user_model import UserModel
from models.resume_model import ResumeModel
from models.job_description_model import JobDescriptionModel
from models.ai_suggestion_model import AISuggestionModel

logger = logging.getLogger(__name__)

# Create Blueprint for API routes
api_bp = Blueprint('api', __name__)

# ✅ Health check
@api_bp.route('/health', methods=['GET'])
def api_health():
    return jsonify({
        'status': 'success',
        'message': 'API is working correctly'
    })

# ✅ User Registration
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

# ✅ User Login
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

# ✅ User Logout
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

# ✅ Get Current User
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

# ✅ Resume upload and parsing endpoint
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


# ✅ Job description parsing endpoint
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

# ✅ Get user's resumes
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

# ✅ Get user's job descriptions
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

# ✅ Get AI suggestions
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

# ✅ Create AI suggestion
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

# ✅ Mark AI suggestion as read
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


