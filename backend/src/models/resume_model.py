"""
Resume model for database operations
Handles resume storage, parsing, and retrieval
"""

import json
import logging
from datetime import datetime
from typing import Optional, Dict, Any, List
from config.database import db_config

logger = logging.getLogger(__name__)

class ResumeModel:
    """Resume model for database operations"""
    
    @staticmethod
    def create_resume(user_id: int, filename: str, original_text: str, parsed_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new resume record"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = """
                    INSERT INTO resumes (user_id, filename, original_text, parsed_data, skills, education, work_experience, projects)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """
                    
                    # Extract individual components from parsed data
                    skills = json.dumps(parsed_data.get('skills', []))
                    education = json.dumps(parsed_data.get('education', []))
                    work_experience = json.dumps(parsed_data.get('work_experience', []))
                    projects = json.dumps(parsed_data.get('projects', []))
                    parsed_data_json = json.dumps(parsed_data)
                    
                    cursor.execute(query, (
                        user_id, filename, original_text, parsed_data_json,
                        skills, education, work_experience, projects
                    ))
                    
                    resume_id = cursor.lastrowid
                    
                    return {
                        'id': resume_id,
                        'user_id': user_id,
                        'filename': filename,
                        'parsed_data': parsed_data,
                        'created_at': datetime.now()
                    }
                    
        except Exception as e:
            logger.error(f"Error creating resume: {e}")
            return None
    
    @staticmethod
    def get_resumes_by_user(user_id: int) -> List[Dict[str, Any]]:
        """Get all resumes for a user"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = """
                    SELECT id, filename, parsed_data, skills, education, work_experience, projects, created_at
                    FROM resumes 
                    WHERE user_id = %s 
                    ORDER BY created_at DESC
                    """
                    cursor.execute(query, (user_id,))
                    results = cursor.fetchall()
                    
                    resumes = []
                    for result in results:
                        resume = {
                            'id': result[0],
                            'filename': result[1],
                            'parsed_data': json.loads(result[2]) if result[2] else {},
                            'skills': json.loads(result[3]) if result[3] else [],
                            'education': json.loads(result[4]) if result[4] else [],
                            'work_experience': json.loads(result[5]) if result[5] else [],
                            'projects': json.loads(result[6]) if result[6] else [],
                            'created_at': result[7]
                        }
                        resumes.append(resume)
                    
                    return resumes
                    
        except Exception as e:
            logger.error(f"Error getting resumes by user: {e}")
            return []
    
    @staticmethod
    def get_resume_by_id(resume_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific resume by ID for a user"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = """
                    SELECT id, filename, original_text, parsed_data, skills, education, work_experience, projects, created_at
                    FROM resumes 
                    WHERE id = %s AND user_id = %s
                    """
                    cursor.execute(query, (resume_id, user_id))
                    result = cursor.fetchone()
                    
                    if result:
                        return {
                            'id': result[0],
                            'filename': result[1],
                            'original_text': result[2],
                            'parsed_data': json.loads(result[3]) if result[3] else {},
                            'skills': json.loads(result[4]) if result[4] else [],
                            'education': json.loads(result[5]) if result[5] else [],
                            'work_experience': json.loads(result[6]) if result[6] else [],
                            'projects': json.loads(result[7]) if result[7] else [],
                            'created_at': result[8]
                        }
                    return None
                    
        except Exception as e:
            logger.error(f"Error getting resume by ID: {e}")
            return None
    
    @staticmethod
    def update_resume(resume_id: int, user_id: int, parsed_data: Dict[str, Any]) -> bool:
        """Update resume parsed data"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = """
                    UPDATE resumes 
                    SET parsed_data = %s, skills = %s, education = %s, work_experience = %s, projects = %s, updated_at = NOW()
                    WHERE id = %s AND user_id = %s
                    """
                    
                    # Extract individual components from parsed data
                    skills = json.dumps(parsed_data.get('skills', []))
                    education = json.dumps(parsed_data.get('education', []))
                    work_experience = json.dumps(parsed_data.get('work_experience', []))
                    projects = json.dumps(parsed_data.get('projects', []))
                    parsed_data_json = json.dumps(parsed_data)
                    
                    cursor.execute(query, (
                        parsed_data_json, skills, education, work_experience, projects,
                        resume_id, user_id
                    ))
                    
                    return cursor.rowcount > 0
                    
        except Exception as e:
            logger.error(f"Error updating resume: {e}")
            return False
    
    @staticmethod
    def delete_resume(resume_id: int, user_id: int) -> bool:
        """Delete a resume"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = "DELETE FROM resumes WHERE id = %s AND user_id = %s"
                    cursor.execute(query, (resume_id, user_id))
                    return cursor.rowcount > 0
                    
        except Exception as e:
            logger.error(f"Error deleting resume: {e}")
            return False
