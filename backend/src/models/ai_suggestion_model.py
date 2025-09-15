"""
AI Suggestion model for database operations
Handles AI-generated suggestions storage and retrieval
"""

import logging
from datetime import datetime
from typing import Optional, Dict, Any, List
from config.database import db_config

logger = logging.getLogger(__name__)

class AISuggestionModel:
    """AI Suggestion model for database operations"""
    
    @staticmethod
    def create_suggestion(user_id: int, suggestion_type: str, title: str, content: str, 
                         priority: str = 'medium', resume_id: Optional[int] = None, 
                         job_description_id: Optional[int] = None) -> Optional[Dict[str, Any]]:
        """Create a new AI suggestion"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = """
                    INSERT INTO ai_suggestions (user_id, resume_id, job_description_id, suggestion_type, title, content, priority)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """
                    
                    cursor.execute(query, (
                        user_id, resume_id, job_description_id, suggestion_type,
                        title, content, priority
                    ))
                    
                    suggestion_id = cursor.lastrowid
                    
                    return {
                        'id': suggestion_id,
                        'user_id': user_id,
                        'resume_id': resume_id,
                        'job_description_id': job_description_id,
                        'suggestion_type': suggestion_type,
                        'title': title,
                        'content': content,
                        'priority': priority,
                        'is_read': False,
                        'created_at': datetime.now()
                    }
                    
        except Exception as e:
            logger.error(f"Error creating AI suggestion: {e}")
            return None
    
    @staticmethod
    def get_suggestions_by_user(user_id: int, suggestion_type: Optional[str] = None, 
                               is_read: Optional[bool] = None) -> List[Dict[str, Any]]:
        """Get AI suggestions for a user with optional filters"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    # Build dynamic query based on filters
                    base_query = """
                    SELECT id, resume_id, job_description_id, suggestion_type, title, content, 
                           priority, is_read, created_at
                    FROM ai_suggestions 
                    WHERE user_id = %s
                    """
                    params = [user_id]
                    
                    if suggestion_type:
                        base_query += " AND suggestion_type = %s"
                        params.append(suggestion_type)
                    
                    if is_read is not None:
                        base_query += " AND is_read = %s"
                        params.append(is_read)
                    
                    base_query += " ORDER BY priority DESC, created_at DESC"
                    
                    cursor.execute(base_query, params)
                    results = cursor.fetchall()
                    
                    suggestions = []
                    for result in results:
                        suggestion = {
                            'id': result[0],
                            'resume_id': result[1],
                            'job_description_id': result[2],
                            'suggestion_type': result[3],
                            'title': result[4],
                            'content': result[5],
                            'priority': result[6],
                            'is_read': result[7],
                            'created_at': result[8]
                        }
                        suggestions.append(suggestion)
                    
                    return suggestions
                    
        except Exception as e:
            logger.error(f"Error getting AI suggestions by user: {e}")
            return []
    
    @staticmethod
    def get_suggestion_by_id(suggestion_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific AI suggestion by ID for a user"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = """
                    SELECT id, resume_id, job_description_id, suggestion_type, title, content, 
                           priority, is_read, created_at
                    FROM ai_suggestions 
                    WHERE id = %s AND user_id = %s
                    """
                    cursor.execute(query, (suggestion_id, user_id))
                    result = cursor.fetchone()
                    
                    if result:
                        return {
                            'id': result[0],
                            'resume_id': result[1],
                            'job_description_id': result[2],
                            'suggestion_type': result[3],
                            'title': result[4],
                            'content': result[5],
                            'priority': result[6],
                            'is_read': result[7],
                            'created_at': result[8]
                        }
                    return None
                    
        except Exception as e:
            logger.error(f"Error getting AI suggestion by ID: {e}")
            return None
    
    @staticmethod
    def mark_suggestion_as_read(suggestion_id: int, user_id: int) -> bool:
        """Mark a suggestion as read"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = """
                    UPDATE ai_suggestions 
                    SET is_read = TRUE, updated_at = NOW()
                    WHERE id = %s AND user_id = %s
                    """
                    cursor.execute(query, (suggestion_id, user_id))
                    return cursor.rowcount > 0
                    
        except Exception as e:
            logger.error(f"Error marking suggestion as read: {e}")
            return False
    
    @staticmethod
    def mark_all_suggestions_as_read(user_id: int, suggestion_type: Optional[str] = None) -> bool:
        """Mark all suggestions as read for a user"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = "UPDATE ai_suggestions SET is_read = TRUE, updated_at = NOW() WHERE user_id = %s"
                    params = [user_id]
                    
                    if suggestion_type:
                        query += " AND suggestion_type = %s"
                        params.append(suggestion_type)
                    
                    cursor.execute(query, params)
                    return cursor.rowcount > 0
                    
        except Exception as e:
            logger.error(f"Error marking all suggestions as read: {e}")
            return False
    
    @staticmethod
    def delete_suggestion(suggestion_id: int, user_id: int) -> bool:
        """Delete an AI suggestion"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = "DELETE FROM ai_suggestions WHERE id = %s AND user_id = %s"
                    cursor.execute(query, (suggestion_id, user_id))
                    return cursor.rowcount > 0
                    
        except Exception as e:
            logger.error(f"Error deleting AI suggestion: {e}")
            return False
    
    @staticmethod
    def get_suggestion_stats(user_id: int) -> Dict[str, int]:
        """Get suggestion statistics for a user"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = """
                    SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as unread,
                        SUM(CASE WHEN priority = 'high' AND is_read = FALSE THEN 1 ELSE 0 END) as high_priority_unread
                    FROM ai_suggestions 
                    WHERE user_id = %s
                    """
                    cursor.execute(query, (user_id,))
                    result = cursor.fetchone()
                    
                    return {
                        'total': result[0] or 0,
                        'unread': result[1] or 0,
                        'high_priority_unread': result[2] or 0
                    }
                    
        except Exception as e:
            logger.error(f"Error getting suggestion stats: {e}")
            return {'total': 0, 'unread': 0, 'high_priority_unread': 0}