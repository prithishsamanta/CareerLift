from pathlib import Path
import os
import json
import requests

def get_prompt_template():
    """Load the gap analysis prompt template"""
    prompt_path = Path("src/langchain/prompts/gap_analysis_prompt.txt")
    if prompt_path.exists():
        return prompt_path.read_text()
    else:
        # Fallback prompt if file not found
        return """IMPORTANT: Respond ONLY with valid JSON. No additional text.

Analyze the resume and job data and return this JSON structure:

{
  "summary": "Brief overview of the candidate's fit for the job",
  "skillsToImprove": [
    {
      "name": "Skill Name",
      "current": 40,
      "target": 80,
      "urgency": "High",
      "suggestion": "Specific improvement suggestion"
    }
  ],
  "strengths": ["Skill 1", "Skill 2"],
  "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2"],
  "suggestions": ["General advice 1", "General advice 2"],
  "conclusion": "Final assessment paragraph"
}

Resume Data:
{resume}

Job Description:
{job}

Remember: Respond ONLY with the JSON object above, filled with your analysis."""

def run_gap_analysis(resume_data: dict, job_data: dict, llm=None):
    """Run gap analysis using direct Groq API call"""
    print(f"Starting gap analysis...")
    print(f"Resume data type: {type(resume_data)}")
    print(f"Job data type: {type(job_data)}")
    
    try:
        # Get Groq API key
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set")
        
        # Convert data to readable format for the LLM
        print(f"Converting resume data to text...")
        try:
            resume_text = json.dumps(resume_data, indent=2) if isinstance(resume_data, dict) else str(resume_data)
            print(f"Resume text length: {len(resume_text)}")
        except Exception as e:
            print(f"Error converting resume data: {e}")
            resume_text = str(resume_data)
            
        print(f"Converting job data to text...")
        try:
            job_text = json.dumps(job_data, indent=2) if isinstance(job_data, dict) else str(job_data)
            print(f"Job text length: {len(job_text)}")
        except Exception as e:
            print(f"Error converting job data: {e}")
            job_text = str(job_data)
        
        # Get the prompt template and format it
        prompt_template = get_prompt_template()
        # Use replace instead of format to avoid conflicts with JSON braces in the template
        formatted_prompt = prompt_template.replace("{resume}", resume_text).replace("{job}", job_text)
        
        print(f"Sending prompt to Groq API...")
        print(f"Formatted prompt length: {len(formatted_prompt)}")
        
        # Make direct API call to Groq
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        # Try different models in order of preference
        models_to_try = [
            "llama-3.1-70b-versatile",
            "llama3-70b-8192",
            "llama-3.1-8b-instant",
            "mixtral-8x7b-32768"
        ]
        
        for model_name in models_to_try:
            payload = {
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a JSON API. You must ONLY return valid JSON objects. Never return any text outside of JSON format. Your response must be parseable by json.loads() in Python."
                    },
                    {
                        "role": "user",
                        "content": formatted_prompt
                    }
                ],
                "model": model_name,
                "temperature": 0.1,
                "max_tokens": 2000,
                "stream": False
            }
            
            print(f"Trying model: {model_name}")
            
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                print(f"Success with model: {model_name}")
                break
            else:
                print(f"Model {model_name} failed with status {response.status_code}: {response.text}")
                if model_name == models_to_try[-1]:  # Last model
                    raise Exception(f"All models failed. Last error: {response.status_code} - {response.text}")
        
        response_data = response.json()
        llm_output = response_data["choices"][0]["message"]["content"]
        
        print(f"LLM Raw Response:")
        print(repr(llm_output))  # Use repr to see exact characters including newlines
        print("="*50)
        print(llm_output)
        print("="*50)
        
        # Try to parse as JSON
        try:
            # Clean the response aggressively
            cleaned_output = llm_output.strip()
            print(f"After initial strip: {repr(cleaned_output[:100])}")
            
            # Remove common markdown patterns
            if cleaned_output.startswith('```json'):
                cleaned_output = cleaned_output[7:]
                print("Removed ```json prefix")
            elif cleaned_output.startswith('```'):
                cleaned_output = cleaned_output[3:]
                print("Removed ``` prefix")
            
            if cleaned_output.endswith('```'):
                cleaned_output = cleaned_output[:-3]
                print("Removed ``` suffix")
            
            # Remove any leading/trailing whitespace
            cleaned_output = cleaned_output.strip()
            
            # Look for JSON object boundaries more aggressively
            start_idx = cleaned_output.find('{')
            end_idx = cleaned_output.rfind('}')
            print(f"JSON boundaries: start={start_idx}, end={end_idx}")
            
            if start_idx != -1 and end_idx != -1 and start_idx < end_idx:
                json_str = cleaned_output[start_idx:end_idx+1]
                print(f"Extracted JSON: {repr(json_str[:200])}")
                
                # Try to parse the JSON
                parsed_result = json.loads(json_str)
                print(f"Successfully parsed JSON response")
                
                # Check if the result is wrapped in an "analysis" key
                if "analysis" in parsed_result and isinstance(parsed_result["analysis"], dict):
                    print("Extracting nested analysis object")
                    return parsed_result["analysis"]
                else:
                    return parsed_result
            else:
                # If no braces found, maybe the response is just JSON without extra text
                try:
                    parsed_result = json.loads(cleaned_output)
                    print(f"Successfully parsed direct JSON response")
                    
                    # Check if the result is wrapped in an "analysis" key
                    if "analysis" in parsed_result and isinstance(parsed_result["analysis"], dict):
                        print("Extracting nested analysis object from direct parse")
                        return parsed_result["analysis"]
                    else:
                        return parsed_result
                except:
                    print(f"No valid JSON found in response")
                    print(f"Full response: {repr(llm_output[:500])}")
                    raise json.JSONDecodeError("No valid JSON object found", cleaned_output, 0)
            
        except json.JSONDecodeError as json_error:
            print(f"Failed to parse JSON: {json_error}")
            # Extract key information from the raw text if possible
            lines = llm_output.split('\n')
            raw_text = llm_output[:800] if len(llm_output) > 800 else llm_output
            
            return {
                "summary": "LLM provided text analysis instead of JSON format. See recommendations for full details.",
                "skillsToImprove": [
                    {
                        "name": "JSON Format Compliance",
                        "current": 0,
                        "target": 100,
                        "urgency": "High",
                        "suggestion": "The AI model needs better prompting for JSON responses."
                    }
                ],
                "strengths": ["Technical Analysis", "Detailed Feedback"],
                "recommendations": [raw_text],
                "suggestions": ["Check the raw analysis in the recommendations section above."],
                "conclusion": "The analysis was generated but not in the expected JSON format."
            }
        
    except Exception as e:
        print(f"Error in gap analysis: {e}")
        return {
            "summary": f"Analysis failed due to technical error: {str(e)}",
            "skillsToImprove": [],
            "strengths": [],
            "recommendations": ["Please try again or contact support."],
            "suggestions": ["Technical issue occurred during analysis."],
            "conclusion": "Unable to complete analysis due to system error."
        }
