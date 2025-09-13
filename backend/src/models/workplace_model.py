"""
Workplace model for database operations
Handles analysis sessions that group resume and job description pairs
"""

import json
import logging
from datetime import datetime
from typing import Optional, Dict, Any, List
from config.database import db_config
import pymysql

logger = logging.getLogger(__name__)

class WorkplaceModel:
    """Workplace model for database operations"""
    
    @staticmethod
    def create_workplace(user_id: int, resume_id: int, job_description_id: int, 
                        name: str = None, description: str = None, 
                        analysis_data: Dict[str, Any] = None) -> Optional[Dict[str, Any]]:
        """Create a new workplace (analysis session)"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor(pymysql.cursors.DictCursor) as cursor:
                    # Generate default name if not provided
                    if not name:
                        name = f"Analysis Session - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
                    
                    query = """
                    INSERT INTO workplaces (user_id, name, description, resume_id, job_description_id, analysis_data)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """
                    
                    analysis_data_json = json.dumps(analysis_data) if analysis_data else None
                    
                    cursor.execute(query, (
                        user_id, name, description, resume_id, job_description_id, analysis_data_json
                    ))
                    
                    workplace_id = cursor.lastrowid
                    
                    return {
                        'id': workplace_id,
                        'user_id': user_id,
                        'name': name,
                        'description': description,
                        'resume_id': resume_id,
                        'job_description_id': job_description_id,
                        'analysis_data': analysis_data,
                        'created_at': datetime.now()
                    }
                    
        except Exception as e:
            logger.error(f"Error creating workplace: {e}")
            return None
    
    @staticmethod
    def get_workplace_by_id(workplace_id: int) -> Optional[Dict[str, Any]]:
        """Get workplace by ID with resume and job description data"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor(pymysql.cursors.DictCursor) as cursor:
                    query = """
                    SELECT 
                        w.*,
                        r.filename as resume_filename,
                        r.parsed_data as resume_data,
                        jd.title as job_title,
                        jd.company as job_company,
                        jd.parsed_data as job_data
                    FROM workplaces w
                    LEFT JOIN resumes r ON w.resume_id = r.id
                    LEFT JOIN job_descriptions jd ON w.job_description_id = jd.id
                    WHERE w.id = %s
                    """
                    
                    cursor.execute(query, (workplace_id,))
                    result = cursor.fetchone()
                    
                    if result:
                        return {
                            'id': result['id'],
                            'user_id': result['user_id'],
                            'name': result['name'],
                            'description': result['description'],
                            'resume_id': result['resume_id'],
                            'job_description_id': result['job_description_id'],
                            'analysis_data': json.loads(result['analysis_data']) if result['analysis_data'] else None,
                            'created_at': result['created_at'],
                            'updated_at': result['updated_at'],
                            'resume': {
                                'filename': result['resume_filename'],
                                'data': json.loads(result['resume_data']) if result['resume_data'] else None
                            } if result['resume_filename'] else None,
                            'job_description': {
                                'title': result['job_title'],
                                'company': result['job_company'],
                                'data': json.loads(result['job_data']) if result['job_data'] else None
                            } if result['job_title'] else None
                        }
                    
                    return None
                    
        except Exception as e:
            logger.error(f"Error getting workplace: {e}")
            return None
    
    @staticmethod
    def get_workplaces_by_user(user_id: int, limit: int = 50) -> List[Dict[str, Any]]:
        """Get all workplaces for a user, ordered by creation date (newest first)"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor(pymysql.cursors.DictCursor) as cursor:
                    query = """
                    SELECT 
                        w.*,
                        r.filename as resume_filename,
                        jd.title as job_title,
                        jd.company as job_company
                    FROM workplaces w
                    LEFT JOIN resumes r ON w.resume_id = r.id
                    LEFT JOIN job_descriptions jd ON w.job_description_id = jd.id
                    WHERE w.user_id = %s
                    ORDER BY w.created_at DESC
                    LIMIT %s
                    """
                    
                    cursor.execute(query, (user_id, limit))
                    results = cursor.fetchall()
                    
                    workplaces = []
                    for result in results:
                        workplaces.append({
                            'id': result['id'],
                            'user_id': result['user_id'],
                            'name': result['name'],
                            'description': result['description'],
                            'resume_id': result['resume_id'],
                            'job_description_id': result['job_description_id'],
                            'analysis_data': json.loads(result['analysis_data']) if result['analysis_data'] else None,
                            'created_at': result['created_at'],
                            'updated_at': result['updated_at'],
                            'resume_filename': result['resume_filename'],
                            'job_title': result['job_title'],
                            'job_company': result['job_company']
                        })
                    
                    return workplaces
                    
        except Exception as e:
            logger.error(f"Error getting user workplaces: {e}")
            return []
    
    @staticmethod
    def get_latest_resume_and_job_description(user_id: int) -> Dict[str, Any]:
        """Get the latest resume and job description for a user"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor(pymysql.cursors.DictCursor) as cursor:
                    # Get latest resume
                    resume_query = """
                    SELECT * FROM resumes 
                    WHERE user_id = %s 
                    ORDER BY created_at DESC 
                    LIMIT 1
                    """
                    cursor.execute(resume_query, (user_id,))
                    latest_resume = cursor.fetchone()
                    
                    # Get latest job description
                    job_query = """
                    SELECT * FROM job_descriptions 
                    WHERE user_id = %s 
                    ORDER BY created_at DESC 
                    LIMIT 1
                    """
                    cursor.execute(job_query, (user_id,))
                    latest_job = cursor.fetchone()
                    
                    return {
                        'resume': dict(latest_resume) if latest_resume else None,
                        'job_description': dict(latest_job) if latest_job else None
                    }
                    
        except Exception as e:
            logger.error(f"Error getting latest resume and job description: {e}")
            return {'resume': None, 'job_description': None}
    
    @staticmethod
    def update_workplace_analysis(workplace_id: int, analysis_data: Dict[str, Any]) -> bool:
        """Update the analysis data for a workplace"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor(pymysql.cursors.DictCursor) as cursor:
                    query = """
                    UPDATE workplaces 
                    SET analysis_data = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    """
                    
                    analysis_data_json = json.dumps(analysis_data)
                    cursor.execute(query, (analysis_data_json, workplace_id))
                    
                    return cursor.rowcount > 0
                    
        except Exception as e:
            logger.error(f"Error updating workplace analysis: {e}")
            return False
