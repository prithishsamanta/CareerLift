from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
import PyPDF2
import re
import spacy

api_bp = Blueprint('api', __name__)

nlp = spacy.load("en_core_web_sm")

def extract_name_with_nlp(text):
    """
    Extracts a person's name from text using spaCy's Named Entity Recognition.
    """
    doc = nlp(text)
    
    # Iterate through the named entities
    for ent in doc.ents:
        # If the entity is a person, return it
        if ent.label_ == "ORG" or ent.label_ == "PERSON":
            return ent.text.strip()
            
    return None

def extract_text_from_pdf(pdf_path):
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ''
        for page_num in range(len(reader.pages)):
            text += reader.pages[page_num].extract_text() or ''
    return text

def extract_contact_info(text):
    email = re.search(r'[\w\.-]+@[\w\.-]+', text)
    re_string = r"\+\d{1,2}\s*\(?\d{3}\)?\s*[-\s.]*\d{3}[-\s.]*\d{4}"
    phone_number = re.search(re_string, text)
    name = extract_name_with_nlp(text)
    
    return {
        'email': email.group(0) if email else None,
        'phone': phone_number.group(0) if phone_number else None,
        'name': name    
    }

def extract_section(text, start_keyword, end_keywords):
    text_lower = text.lower()
    start_index = text_lower.find(start_keyword.lower())
    
    if start_index == -1:
        return None

    section_content = text[start_index + len(start_keyword):].strip()
    end_index = -1
    
    # Find the earliest occurrence of any end keyword
    for end_keyword in end_keywords:
        current_end_index = section_content.lower().find(end_keyword.lower())
        if current_end_index != -1 and (end_index == -1 or current_end_index < end_index):
            end_index = current_end_index

    if end_index != -1:
        return section_content[:end_index].strip()
    
    return section_content

@api_bp.route('/status')
def status():
    return jsonify({'message': 'API is working correctly'})

@api_bp.route('/upload-resume', methods=['POST'])
def upload_resume():
    try:
        if 'resume' not in request.files:
            return jsonify({'message': 'No file uploaded'}), 400
        
        file = request.files['resume']

        if file.filename == '':
            return jsonify({'message': 'No selected file'}), 400
        
        # Validate file type
        if not file.filename.lower().endswith(('.pdf', '.doc', '.docx')):
            return jsonify({'message': 'Invalid file type. Please upload PDF, DOC, or DOCX files only.'}), 400
        
        filename = secure_filename(file.filename)
        
        # Create uploads directory if it doesn't exist
        upload_folder = '../uploads'
        os.makedirs(upload_folder, exist_ok=True)
        
        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)

        # Extract text based on file type
        if filename.lower().endswith('.pdf'):
            text = extract_text_from_pdf(filepath)
        else:
            # For now, only handle PDFs. You can extend this for DOC/DOCX later
            return jsonify({'message': 'Only PDF files are currently supported for parsing.'}), 400

        if not text or len(text.strip()) < 50:
            return jsonify({'message': 'Could not extract sufficient text from the resume. Please ensure the file is not corrupted and contains readable text.'}), 400

        cleaned_text = re.sub(r'[\r\n\t]+', ' ', text)
        contact_info = extract_contact_info(cleaned_text)
        education = extract_section(cleaned_text, 'education', ['extracurricular', 'skills', 'leadership', 'projects', 'experience'])
        skills = extract_section(cleaned_text, 'skills', ['experience', 'education', 'employment', 'projects', 'leadership'])
        experience = extract_section(cleaned_text, 'experience', ['education', 'extracurricular', 'skills', 'leadership', 'projects'])
        projects = extract_section(cleaned_text, 'projects', ['education', 'extracurricular', 'skills', 'leadership', 'experience'])

        # Clean up the uploaded file after processing (optional)
        # os.remove(filepath)

        return jsonify({
            'message': 'Resume uploaded and parsed successfully',
            'filename': filename,
            'contact': contact_info,
            'skills': skills, 
            'experience': experience,
            'education': education,
            'projects': projects,
            'raw_text_length': len(text)  # For debugging
        }), 200

    except Exception as e:
        print(f"Error processing resume: {str(e)}")
        return jsonify({'message': f'Error processing resume: {str(e)}'}), 500