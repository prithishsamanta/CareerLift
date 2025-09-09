import openai
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Groq API
openai.api_key = os.getenv("GROQ_API_KEY", "YOUR_GROQ_API_KEY")
openai.api_base = "https://api.groq.com/openai/v1"

def parse_resume(resume_text: str):
    """
    Parse resume text and extract structured information using Groq/Llama
    Returns: JSON with Skills, Education, Work Experience, and Projects
    """
    prompt = f"""
Extract structured information from the following resume and return it as a valid JSON object with these exact keys:

1. "skills": Array of technical skills (programming languages, frameworks, tools, etc.)
2. "education": Array of education objects with keys: "degree", "institution", "year", "details"
3. "work_experience": Array of work experience objects with keys: "position", "company", "duration", "description"
4. "projects": Array of project objects with keys: "name", "description", "technologies", "duration"

Important:
- Return ONLY valid JSON, no extra text or formatting
- If a section is not found, return an empty array []
- Keep descriptions concise but informative
- Extract years/durations when available

Resume Text:
\"\"\"
{resume_text}
\"\"\"

JSON Response:"""

    try:
        response = openai.ChatCompletion.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=2000
        )
        
        result = response['choices'][0]['message']['content'].strip()
        
        # Try to parse as JSON to validate
        try:
            parsed_json = json.loads(result)
            return parsed_json
        except json.JSONDecodeError:
            # If JSON parsing fails, return a structured error
            return {
                "skills": [],
                "education": [],
                "work_experience": [],
                "projects": [],
                "error": "Failed to parse resume - invalid JSON response from AI"
            }
            
    except Exception as e:
        return {
            "skills": [],
            "education": [],
            "work_experience": [],
            "projects": [],
            "error": f"API call failed: {str(e)}"
        }


def parse_job_description(job_description_text: str):
    """
    Parse job description text and extract structured information using Groq/Llama
    Returns: JSON with Technical Skills and Technical Synopsis
    """
    prompt = f"""
Extract structured information from the following job description and return it as a valid JSON object with these exact keys:

1. "technical_skills": Array of technical skills required for the job (programming languages, frameworks, tools, technologies, databases, etc.)
2. "technical_synopsis": A concise technical summary of the job role (2-3 sentences describing the main technical responsibilities and requirements)

Important:
- Return ONLY valid JSON, no extra text or formatting
- Focus on technical aspects only
- If technical skills are not found, return an empty array []
- Keep the synopsis concise but informative
- Extract specific technologies, programming languages, frameworks mentioned

Job Description Text:
\"\"\"
{job_description_text}
\"\"\"

JSON Response:"""

    try:
        response = openai.ChatCompletion.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=1000
        )
        
        result = response['choices'][0]['message']['content'].strip()
        
        # Try to parse as JSON to validate
        try:
            parsed_json = json.loads(result)
            return parsed_json
        except json.JSONDecodeError:
            # If JSON parsing fails, return a structured error
            return {
                "technical_skills": [],
                "technical_synopsis": "",
                "error": "Failed to parse job description - invalid JSON response from AI"
            }
            
    except Exception as e:
        return {
            "technical_skills": [],
            "technical_synopsis": "",
            "error": f"API call failed: {str(e)}"
        }