import os
# from pathlib import Path
from dotenv import load_dotenv
from datetime import date
from typing import List
import json

from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

# Make sure your GOOGLE_API_KEY is set as an environment variable
# For example: os.environ["GOOGLE_API_KEY"] = "YOUR_API_KEY"

# os.environ["GOOGLE_API_KEY"] = os.getenv("API_KEY")
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


def create_study_plan() -> dict:
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

    sample_analysis = """{
  "summary": "The candidate demonstrates a strong aptitude for backend development but needs to enhance their skills in modern cloud infrastructure and advanced database management to progress to a senior level.",
  "skillsToImprove": [
    {
      "name": "Cloud Infrastructure Management (AWS)",
      "current": 30,
      "target": 75,
      "urgency": "High",
      "suggestion": "Complete the AWS Certified Solutions Architect - Associate certification and deploy a personal project using EC2, S3, and Lambda."
    },
    {
      "name": "Advanced SQL Querying",
      "current": 50,
      "target": 85,
      "urgency": "Medium",
      "suggestion": "Practice complex queries involving window functions and common table expressions (CTEs) on platforms like LeetCode or HackerRank."
    },
    {
      "name": "Containerization with Docker & Kubernetes",
      "current": 25,
      "target": 70,
      "urgency": "High",
      "suggestion": "Containerize an existing application with Docker and create a Kubernetes manifest to manage its deployment and scaling."
    }
  ],
  "strengths": [
    "Python Programming (Django)",
    "REST API Design"
  ],
  "recommendations": [
    "Focus on obtaining the AWS certification within the next quarter.",
    "Incorporate Docker into your current development workflow immediately."
  ],
  "suggestions": [
    "Join a study group for cloud certifications.",
    "Contribute to open-source projects that utilize Kubernetes."
  ],
  "conclusion": "This candidate is a solid developer with significant potential. Addressing the outlined skill gaps in cloud and containerization will be critical for their career advancement and ability to contribute to scalable projects."
}
"""
    
    # Specify the desired duration
    study_duration = "14 days"
    
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.5, google_api_key = os.getenv("API_KEY"))
    structured_llm = llm.with_structured_output(StudyPlan)

    # 3. Create a detailed prompt template
    # This guides the LLM on its role, the context, and the desired output format.
    prompt = ChatPromptTemplate.from_messages([
        ("system",
         """
         You are an expert career coach and technical planner. Your task is to create a
         structured, realistic study plan based on an analysis of a person's resume.
         The plan should break down the learning topics chronologically over the
         specified duration. Today's date is {today_date}.
         """
        ),
        ("human",
         """
         Please create a study plan for me based on the following resume analysis.
         I want to complete this plan in {duration}.

         Resume Analysis:
         "{resume_analysis}"

         Along with the task, give me the skill for which the task is relevant, and a priority level (High, Medium, Low).
         """
        )
    ])

    # 4. Create the processing chain and invoke it
    chain = prompt | structured_llm
    
    response = chain.invoke({
        "resume_analysis": sample_analysis,
        "duration": study_duration,
        "today_date": date.today().isoformat()
    })

    # The result is a Pydantic object, which can be easily converted to a dict.
    roadmap = response.model_dump()

    generated_plan = json.dumps(roadmap, indent=2)

    return generated_plan

if __name__ == "__main__":
    create_study_plan()



