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
3. "work_experience": Array of work experience objects with keys: "position", "company", "duration", "responsibilities"
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
            model="llama3-70b-8192",
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
