import os
# from pathlib import Path
from dotenv import load_dotenv
from datetime import date
from typing import List
import json
import openai

# Configure Groq API for roadmap generation
load_dotenv()
openai.api_key = os.getenv("GROQ_API_KEY_NAYAN")
openai.api_base = "https://api.groq.com/openai/v1"

from pydantic import BaseModel, Field

from models.ai_suggestion_model import AISuggestionModel
# 1. Define the desired JSON output structure using Pydantic
class StudyTopic(BaseModel):
    """A single topic in the study plan."""
    date: str = Field(description="The target date for the topic, formatted as YYYY-MM-DD.")
    topic: str = Field(description="The specific skills or concepts to be studied on this date.")
    skill: str = Field(description="The overarching skill this topic belongs to (e.g., Python, Docker, React.js).")
    priority: str = Field(description="The priority of the topic, which can be 'High', 'Medium', or 'Low'.")

class StudyPlan(BaseModel):
    """A structured study plan with a list of topics and their scheduled dates."""
    plan: List[StudyTopic] = Field(description="The list of study topics.")


def create_study_plan(duration, user_id) -> dict:
    """
    Generates a structured study plan based on resume analysis and a duration.

    Args:
        resume_analysis: Text analysis of a resume, highlighting strengths and weaknesses.
        duration: The total duration for the study plan (e.g., "3 months", "6 weeks").

    Returns:
        A dictionary containing the structured study plan in JSON format.
    """
    # 2. Initialize the Google Gemini model
    # The .with_structured_output method instructs the LLM to return data
    # that conforms to the StudyPlan Pydantic model.
    # current_dir = Path(__file__).parent.parent
    # prompts_dir = os.path.join(current_dir, "prompts")

#     sample_analysis = """{
#   "summary": "The candidate demonstrates a strong aptitude for backend development but needs to enhance their skills in modern cloud infrastructure and advanced database management to progress to a senior level.",
#   "skillsToImprove": [
#     {
#       "name": "Cloud Infrastructure Management (AWS)",
#       "current": 30,
#       "target": 75,
#       "urgency": "High",
#       "suggestion": "Complete the AWS Certified Solutions Architect - Associate certification and deploy a personal project using EC2, S3, and Lambda."
#     },
#     {
#       "name": "Advanced SQL Querying",
#       "current": 50,
#       "target": 85,
#       "urgency": "Medium",
#       "suggestion": "Practice complex queries involving window functions and common table expressions (CTEs) on platforms like LeetCode or HackerRank."
#     },
#     {
#       "name": "Containerization with Docker & Kubernetes",
#       "current": 25,
#       "target": 70,
#       "urgency": "High",
#       "suggestion": "Containerize an existing application with Docker and create a Kubernetes manifest to manage its deployment and scaling."
#     }
#   ],
#   "strengths": [
#     "Python Programming (Django)",
#     "REST API Design"
#   ],
#   "recommendations": [
#     "Focus on obtaining the AWS certification within the next quarter.",
#     "Incorporate Docker into your current development workflow immediately."
#   ],
#   "suggestions": [
#     "Join a study group for cloud certifications.",
#     "Contribute to open-source projects that utilize Kubernetes."
#   ],
#   "conclusion": "This candidate is a solid developer with significant potential. Addressing the outlined skill gaps in cloud and containerization will be critical for their career advancement and ability to contribute to scalable projects."
# }
# """

    print("🔍 User_id:", user_id)
    user_suggestions = AISuggestionModel.get_suggestions_by_user(user_id)

    print("📋 Raw user_suggestions:", user_suggestions)
    print(f"📊 Number of suggestions: {len(user_suggestions) if user_suggestions else 0}")

    # Limit suggestions to avoid token limit issues - prioritize high priority ones
    if user_suggestions and len(user_suggestions) > 20:
        print("⚠️ Too many suggestions, filtering to top 20...")
        # Sort by priority (high first) and take top 20
        priority_order = {'high': 0, 'medium': 1, 'low': 2}
        sorted_suggestions = sorted(user_suggestions, key=lambda x: priority_order.get(x.get('priority', 'low'), 2))
        user_suggestions = sorted_suggestions[:20]
        print(f"📊 Filtered to {len(user_suggestions)} suggestions")

    suggestions_text = "\n".join([f"- {s['title']}: {s['content']}" for s in user_suggestions]) if user_suggestions else "No specific suggestions provided."
    print("🔤 Formatted suggestions_text:")
    print(f"📏 Suggestions text length: {len(suggestions_text)}")
    if len(suggestions_text) > 1000:
        print(suggestions_text[:500] + "... (truncated)")
    else:
        print(suggestions_text)
    # Specify the desired duration
    study_duration = duration
    
    # Create the prompt for Groq API
    system_prompt = f"""
You are an expert career coach and technical planner. Your task is to create a
structured, realistic study plan based on an analysis of a person's resume.
The plan should break down the learning topics chronologically over the
specified duration. Today's date is {date.today().isoformat()}.

Return your response as a valid JSON object with this exact structure:
{{
  "plan": [
    {{
      "date": "YYYY-MM-DD",
      "topic": "The specific skills or concepts to be studied on this date",
      "skill": "The overarching skill this topic belongs to (e.g., Python, Docker, React.js)",
      "priority": "High/Medium/Low"
    }}
  ]
}}

Important:
- Return ONLY valid JSON, no extra text or formatting
- Make sure dates are consecutive and realistic
- Include all required fields for each topic
- Priority should be exactly "High", "Medium", or "Low"
"""

    user_prompt = f"""
Please create a study plan for me based on the following resume analysis.
I want to complete this plan in {study_duration}. Make sure that the plan follows consecutive days.

Resume Analysis:
"{suggestions_text}"

Along with the task, give me the skill for which the task is relevant, and a priority level (High, Medium, Low).
"""

    try:
        print("🚀 Making Groq API call...")
        print(f"📝 System prompt length: {len(system_prompt)}")
        print(f"📝 User prompt length: {len(user_prompt)}")
        total_length = len(system_prompt) + len(user_prompt)
        print(f"📝 Total prompt length: {total_length}")
        
        # Safety check - if still too long, truncate suggestions further
        if total_length > 15000:  # Conservative limit
            print("⚠️ Prompt still too long, using fallback minimal suggestions...")
            minimal_suggestions = "Focus on improving cloud infrastructure, advanced database skills, and modern development practices."
            user_prompt = f"""
Please create a study plan for me based on the following resume analysis.
I want to complete this plan in {study_duration}. Make sure that the plan follows consecutive days.

Resume Analysis:
"{minimal_suggestions}"

Along with the task, give me the skill for which the task is relevant, and a priority level (High, Medium, Low).
"""
            print(f"📝 Revised user prompt length: {len(user_prompt)}")
        
        # Make direct API call to Groq
        response = openai.ChatCompletion.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.5,
            max_tokens=3000
        )
        
        print("✅ Groq API call successful")
        result = response['choices'][0]['message']['content'].strip()
        print(f"📄 Raw Groq response length: {len(result)}")
        print(f"📄 Raw Groq response (first 200 chars): {result[:200]}...")
        
        # Try to parse as JSON to validate
        try:
            roadmap = json.loads(result)
            print(f"✅ JSON parsing successful, keys: {list(roadmap.keys())}")
            if 'plan' in roadmap:
                print(f"📊 Plan has {len(roadmap['plan'])} items")
            return roadmap
        except json.JSONDecodeError:
            # If JSON parsing fails, return a structured error
            return {
                "plan": [],
                "error": "Failed to generate study plan - invalid JSON response from AI"
            }
            
    except Exception as e:
        return {
            "plan": [],
            "error": f"API call failed: {str(e)}"
        }

if __name__ == "__main__":
    create_study_plan()



