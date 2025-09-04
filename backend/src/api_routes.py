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
        if ent.label_ == "PERSON":
            print(ent.text)
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
    phone_number = re.search(r'(\+\d{1,2}[-\s\.]?\d{3}[-\s\.]?\d{3}[-\s\.]?\d{4})', text, re.DOTALL)
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

# Helper function
def find_text_between(full_text, start_keyword, end_keywords):
    # ... (your Python implementation of the function) ...
    pass

@api_bp.route('/status')
def status():
    return jsonify({'message': 'API is working correctly'})

@api_bp.route('/upload-resume', methods=['POST'])
def upload_resume():
    if 'resume' not in request.files:
        return jsonify({'message': 'No file uploaded'}), 400
    file = request.files['resume']

    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
    
    if file:
        filename = secure_filename(file.filename)
        # Assuming you've configured UPLOAD_FOLDER in app.py
        upload_folder = '../uploads' # Or get from app.config
        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)

        text = extract_text_from_pdf(filepath)
        cleaned_text = re.sub(r'[\r\n\t]+', ' ', text)
        contact_info = extract_contact_info(cleaned_text)
        skills = extract_section(cleaned_text, 'skills', ['experience', 'education'])
        experience = extract_section(cleaned_text, 'experience', ['education', 'extracurricular', 'skills', 'leadership'])

        return jsonify({
            'message': 'Resume uploaded successfully',
            'filename': filename,
            'contact': contact_info,
            'skills': skills, 
            'experience': experience 
        }), 200