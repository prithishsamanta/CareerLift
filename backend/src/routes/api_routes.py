from flask import Blueprint, request, jsonify
import logging

from utils.groq_llama_parser import parse_resume, parse_job_description
from utils.pdf_extractor import extract_text_from_pdf

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

# ✅ Resume upload and parsing endpoint
@api_bp.route('/resume/upload', methods=['POST'])
def upload_and_parse_resume():
    """
    Upload resume file and parse it using Groq/Llama
    Returns structured JSON with Skills, Education, Work Experience, Projects
    """
    try:
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
        
        # Add metadata
        response_data = {
            'status': 'success',
            'message': 'Resume parsed successfully',
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
        
        # Parse job description using Groq/Llama
        parsed_data = parse_job_description(job_description_text)
        
        # Add metadata
        response_data = {
            'status': 'success',
            'message': 'Job description parsed successfully',
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


