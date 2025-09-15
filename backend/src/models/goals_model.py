"""
Goals model for database operations
Handles learning goals and study plans storage and retrieval
"""

import logging
import json
from datetime import datetime, date
from typing import Optional, Dict, Any, List
from config.database import db_config

logger = logging.getLogger(__name__)

class GoalsModel:
    """Goals model for database operations"""
    
    @staticmethod
    def create_goal(user_id: int, workplace_id: int, goal_data: dict, duration_days: int = 14) -> Optional[Dict[str, Any]]:
        """Create a new goal for a workplace"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    # Check if there's already an active goal for this workplace
                    cursor.execute("""
                        SELECT id FROM goals 
                        WHERE user_id = %s AND workplace_id = %s AND is_active = TRUE
                    """, (user_id, workplace_id))
                    
                    existing_goal = cursor.fetchone()
                    if existing_goal:
                        # Update existing goal instead of creating new one
                        return GoalsModel.update_goal(existing_goal[0], user_id, goal_data, duration_days)
                    
                    # Create new goal
                    query = """
                    INSERT INTO goals (user_id, workplace_id, goal_data, duration_days)
                    VALUES (%s, %s, %s, %s)
                    """
                    
                    cursor.execute(query, (
                        user_id, workplace_id, json.dumps(goal_data), duration_days
                    ))
                    
                    goal_id = cursor.lastrowid
                    
                    return {
                        'id': goal_id,
                        'user_id': user_id,
                        'workplace_id': workplace_id,
                        'goal_data': goal_data,
                        'duration_days': duration_days,
                        'is_active': True,
                        'created_at': datetime.now()
                    }
                    
        except Exception as e:
            logger.error(f"Error creating goal: {e}")
            return None
    
    @staticmethod
    def update_goal(goal_id: int, user_id: int, goal_data: dict, duration_days: int = None) -> Optional[Dict[str, Any]]:
        """Update an existing goal"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    # Build update query dynamically
                    update_fields = ["goal_data = %s", "updated_at = NOW()"]
                    params = [json.dumps(goal_data)]
                    
                    if duration_days is not None:
                        update_fields.append("duration_days = %s")
                        params.append(duration_days)
                    
                    query = f"""
                    UPDATE goals 
                    SET {', '.join(update_fields)}
                    WHERE id = %s AND user_id = %s
                    """
                    params.extend([goal_id, user_id])
                    
                    cursor.execute(query, params)
                    
                    if cursor.rowcount > 0:
                        # Fetch updated goal
                        cursor.execute("""
                            SELECT id, user_id, workplace_id, goal_data, duration_days, is_active, created_at, updated_at
                            FROM goals 
                            WHERE id = %s AND user_id = %s
                        """, (goal_id, user_id))
                        
                        result = cursor.fetchone()
                        if result:
                            return {
                                'id': result[0],
                                'user_id': result[1],
                                'workplace_id': result[2],
                                'goal_data': json.loads(result[3]) if result[3] else {},
                                'duration_days': result[4],
                                'is_active': result[5],
                                'created_at': result[6],
                                'updated_at': result[7]
                            }
                    
                    return None
                    
        except Exception as e:
            logger.error(f"Error updating goal: {e}")
            return None
    
    @staticmethod
    def get_goal_by_workplace(user_id: int, workplace_id: int) -> Optional[Dict[str, Any]]:
        """Get the active goal for a specific workplace"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = """
                    SELECT id, user_id, workplace_id, goal_data, duration_days, is_active, created_at, updated_at
                    FROM goals 
                    WHERE user_id = %s AND workplace_id = %s AND is_active = TRUE
                    ORDER BY created_at DESC
                    LIMIT 1
                    """
                    
                    cursor.execute(query, (user_id, workplace_id))
                    result = cursor.fetchone()
                    
                    if result:
                        return {
                            'id': result[0],
                            'user_id': result[1],
                            'workplace_id': result[2],
                            'goal_data': json.loads(result[3]) if result[3] else {},
                            'duration_days': result[4],
                            'is_active': result[5],
                            'created_at': result[6],
                            'updated_at': result[7]
                        }
                    
                    return None
                    
        except Exception as e:
            logger.error(f"Error getting goal by workplace: {e}")
            return None
    
    @staticmethod
    def get_goals_by_user(user_id: int) -> List[Dict[str, Any]]:
        """Get all goals for a user"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = """
                    SELECT id, user_id, workplace_id, goal_data, duration_days, is_active, created_at, updated_at
                    FROM goals 
                    WHERE user_id = %s
                    ORDER BY created_at DESC
                    """
                    
                    cursor.execute(query, (user_id,))
                    results = cursor.fetchall()
                    
                    goals = []
                    for result in results:
                        goals.append({
                            'id': result[0],
                            'user_id': result[1],
                            'workplace_id': result[2],
                            'goal_data': json.loads(result[3]) if result[3] else {},
                            'duration_days': result[4],
                            'is_active': result[5],
                            'created_at': result[6],
                            'updated_at': result[7]
                        })
                    
                    return goals
                    
        except Exception as e:
            logger.error(f"Error getting goals by user: {e}")
            return []
    
    @staticmethod
    def deactivate_goal(goal_id: int, user_id: int) -> bool:
        """Deactivate a goal (soft delete)"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = """
                    UPDATE goals 
                    SET is_active = FALSE, updated_at = NOW()
                    WHERE id = %s AND user_id = %s
                    """
                    
                    cursor.execute(query, (goal_id, user_id))
                    return cursor.rowcount > 0
                    
        except Exception as e:
            logger.error(f"Error deactivating goal: {e}")
            return False
    
    @staticmethod
    def delete_goal(goal_id: int, user_id: int) -> bool:
        """Delete a goal permanently"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = "DELETE FROM goals WHERE id = %s AND user_id = %s"
                    cursor.execute(query, (goal_id, user_id))
                    return cursor.rowcount > 0
                    
        except Exception as e:
            logger.error(f"Error deleting goal: {e}")
            return False


class TaskCompletionModel:
    """Task completion tracking model"""
    
    @staticmethod
    def mark_task_completed(user_id: int, workplace_id: int, task_id: str, task_date: date, is_completed: bool = True) -> bool:
        """Mark a task as completed or uncompleted for a specific date"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    if is_completed:
                        # Insert or update task completion
                        query = """
                        INSERT INTO task_completions (user_id, workplace_id, task_id, task_date, is_completed, completed_at)
                        VALUES (%s, %s, %s, %s, %s, NOW())
                        ON DUPLICATE KEY UPDATE 
                        is_completed = %s, completed_at = NOW(), updated_at = NOW()
                        """
                        cursor.execute(query, (user_id, workplace_id, task_id, task_date, is_completed, is_completed))
                    else:
                        # Mark as not completed
                        query = """
                        INSERT INTO task_completions (user_id, workplace_id, task_id, task_date, is_completed, completed_at)
                        VALUES (%s, %s, %s, %s, %s, NULL)
                        ON DUPLICATE KEY UPDATE 
                        is_completed = %s, completed_at = NULL, updated_at = NOW()
                        """
                        cursor.execute(query, (user_id, workplace_id, task_id, task_date, is_completed, is_completed))
                    
                    return True
                    
        except Exception as e:
            logger.error(f"Error marking task completion: {e}")
            return False
    
    @staticmethod
    def get_task_completions(user_id: int, workplace_id: int, start_date: date = None, end_date: date = None) -> Dict[str, Dict[str, bool]]:
        """Get task completion status for a workplace within a date range"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = """
                    SELECT task_id, task_date, is_completed
                    FROM task_completions 
                    WHERE user_id = %s AND workplace_id = %s
                    """
                    params = [user_id, workplace_id]
                    
                    if start_date:
                        query += " AND task_date >= %s"
                        params.append(start_date)
                    
                    if end_date:
                        query += " AND task_date <= %s"
                        params.append(end_date)
                    
                    query += " ORDER BY task_date, task_id"
                    
                    cursor.execute(query, params)
                    results = cursor.fetchall()
                    
                    # Organize by date and task_id
                    completions = {}
                    for result in results:
                        task_id, task_date, is_completed = result
                        date_str = task_date.strftime('%Y-%m-%d')
                        
                        if date_str not in completions:
                            completions[date_str] = {}
                        
                        completions[date_str][task_id] = bool(is_completed)
                    
                    return completions
                    
        except Exception as e:
            logger.error(f"Error getting task completions: {e}")
            return {}
    
    @staticmethod
    def get_completion_stats(user_id: int, workplace_id: int) -> Dict[str, Any]:
        """Get completion statistics for a workplace"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = """
                    SELECT 
                        COUNT(*) as total_tasks,
                        SUM(CASE WHEN is_completed = TRUE THEN 1 ELSE 0 END) as completed_tasks,
                        COUNT(DISTINCT task_date) as days_with_tasks
                    FROM task_completions 
                    WHERE user_id = %s AND workplace_id = %s
                    """
                    
                    cursor.execute(query, (user_id, workplace_id))
                    result = cursor.fetchone()
                    
                    if result:
                        total_tasks = result[0] or 0
                        completed_tasks = result[1] or 0
                        days_with_tasks = result[2] or 0
                        
                        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
                        
                        return {
                            'total_tasks': total_tasks,
                            'completed_tasks': completed_tasks,
                            'completion_rate': round(completion_rate, 2),
                            'days_with_tasks': days_with_tasks
                        }
                    
                    return {
                        'total_tasks': 0,
                        'completed_tasks': 0,
                        'completion_rate': 0,
                        'days_with_tasks': 0
                    }
                    
        except Exception as e:
            logger.error(f"Error getting completion stats: {e}")
            return {
                'total_tasks': 0,
                'completed_tasks': 0,
                'completion_rate': 0,
                'days_with_tasks': 0
            }
