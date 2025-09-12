"""
Job Description model for database operations
Handles job description storage, parsing, and retrieval
"""

import json
import logging
from datetime import datetime
from typing import Optional, Dict, Any, List
from config.database import db_config

logger = logging.getLogger(__name__)

class JobDescriptionModel:
    """Job Description model for database operations"""
    
    @staticmethod
    def create_job_description(user_id: int, title: str, company: str, original_text: str, parsed_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new job description record"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = """
                    INSERT INTO job_descriptions (user_id, title, company, original_text, parsed_data, technical_skills, technical_synopsis)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """
                    
                    # Extract individual components from parsed data
                    technical_skills = json.dumps(parsed_data.get('technical_skills', []))
                    technical_synopsis = parsed_data.get('technical_synopsis', '')
                    parsed_data_json = json.dumps(parsed_data)
                    
                    cursor.execute(query, (
                        user_id, title, company, original_text, parsed_data_json,
                        technical_skills, technical_synopsis
                    ))
                    
                    job_description_id = cursor.lastrowid
                    
                    return {
                        'id': job_description_id,
                        'user_id': user_id,
                        'title': title,
                        'company': company,
                        'parsed_data': parsed_data,
                        'created_at': datetime.now()
                    }
                    
        except Exception as e:
            logger.error(f"Error creating job description: {e}")
            return None
    
    @staticmethod
    def get_job_descriptions_by_user(user_id: int) -> List[Dict[str, Any]]:
        """Get all job descriptions for a user"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = """
                    SELECT id, title, company, parsed_data, technical_skills, technical_synopsis, created_at
                    FROM job_descriptions 
                    WHERE user_id = %s 
                    ORDER BY created_at DESC
                    """
                    cursor.execute(query, (user_id,))
                    results = cursor.fetchall()
                    
                    job_descriptions = []
                    for result in results:
                        job_description = {
                            'id': result[0],
                            'title': result[1],
                            'company': result[2],
                            'parsed_data': json.loads(result[3]) if result[3] else {},
                            'technical_skills': json.loads(result[4]) if result[4] else [],
                            'technical_synopsis': result[5],
                            'created_at': result[6]
                        }
                        job_descriptions.append(job_description)
                    
                    return job_descriptions
                    
        except Exception as e:
            logger.error(f"Error getting job descriptions by user: {e}")
            return []
    
    @staticmethod
    def get_job_description_by_id(job_description_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific job description by ID for a user"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = """
                    SELECT id, title, company, original_text, parsed_data, technical_skills, technical_synopsis, created_at
                    FROM job_descriptions 
                    WHERE id = %s AND user_id = %s
                    """
                    cursor.execute(query, (job_description_id, user_id))
                    result = cursor.fetchone()
                    
                    if result:
                        return {
                            'id': result[0],
                            'title': result[1],
                            'company': result[2],
                            'original_text': result[3],
                            'parsed_data': json.loads(result[4]) if result[4] else {},
                            'technical_skills': json.loads(result[5]) if result[5] else [],
                            'technical_synopsis': result[6],
                            'created_at': result[7]
                        }
                    return None
                    
        except Exception as e:
            logger.error(f"Error getting job description by ID: {e}")
            return None
    
    @staticmethod
    def update_job_description(job_description_id: int, user_id: int, parsed_data: Dict[str, Any]) -> bool:
        """Update job description parsed data"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = """
                    UPDATE job_descriptions 
                    SET parsed_data = %s, technical_skills = %s, technical_synopsis = %s, updated_at = NOW()
                    WHERE id = %s AND user_id = %s
                    """
                    
                    # Extract individual components from parsed data
                    technical_skills = json.dumps(parsed_data.get('technical_skills', []))
                    technical_synopsis = parsed_data.get('technical_synopsis', '')
                    parsed_data_json = json.dumps(parsed_data)
                    
                    cursor.execute(query, (
                        parsed_data_json, technical_skills, technical_synopsis,
                        job_description_id, user_id
                    ))
                    
                    return cursor.rowcount > 0
                    
        except Exception as e:
            logger.error(f"Error updating job description: {e}")
            return False
    
    @staticmethod
    def delete_job_description(job_description_id: int, user_id: int) -> bool:
        """Delete a job description"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = "DELETE FROM job_descriptions WHERE id = %s AND user_id = %s"
                    cursor.execute(query, (job_description_id, user_id))
                    return cursor.rowcount > 0
                    
        except Exception as e:
            logger.error(f"Error deleting job description: {e}")
            return False
