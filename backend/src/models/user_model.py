"""
User model for database operations
Handles user authentication, registration, and profile management
"""

import bcrypt
import secrets
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from config.database import db_config

logger = logging.getLogger(__name__)

class UserModel:
    """User model for database operations"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    @staticmethod
    def verify_password(password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    @staticmethod
    def create_user(email: str, password: str, first_name: str, last_name: str) -> Optional[Dict[str, Any]]:
        """Create a new user"""
        try:
            # Check if user already exists
            if UserModel.get_user_by_email(email):
                logger.warning(f"User with email {email} already exists")
                return None
            
            # Hash password
            password_hash = UserModel.hash_password(password)
            
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = """
                    INSERT INTO users (email, password_hash, first_name, last_name)
                    VALUES (%s, %s, %s, %s)
                    """
                    cursor.execute(query, (email, password_hash, first_name, last_name))
                    user_id = cursor.lastrowid
                    
                    # Return user data (without password hash)
                    return {
                        'id': user_id,
                        'email': email,
                        'first_name': first_name,
                        'last_name': last_name,
                        'created_at': datetime.now()
                    }
                    
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return None
    
    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = "SELECT id, email, password_hash, first_name, last_name, created_at, is_active FROM users WHERE email = %s"
                    cursor.execute(query, (email,))
                    result = cursor.fetchone()
                    
                    if result:
                        return {
                            'id': result[0],
                            'email': result[1],
                            'password_hash': result[2],
                            'first_name': result[3],
                            'last_name': result[4],
                            'created_at': result[5],
                            'is_active': result[6]
                        }
                    return None
                    
        except Exception as e:
            logger.error(f"Error getting user by email: {e}")
            return None
    
    @staticmethod
    def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = "SELECT id, email, first_name, last_name, created_at, is_active FROM users WHERE id = %s"
                    cursor.execute(query, (user_id,))
                    result = cursor.fetchone()
                    
                    if result:
                        return {
                            'id': result[0],
                            'email': result[1],
                            'first_name': result[2],
                            'last_name': result[3],
                            'created_at': result[4],
                            'is_active': result[5]
                        }
                    return None
                    
        except Exception as e:
            logger.error(f"Error getting user by ID: {e}")
            return None
    
    @staticmethod
    def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
        """Authenticate user with email and password"""
        try:
            user = UserModel.get_user_by_email(email)
            if not user:
                logger.warning(f"User not found: {email}")
                return None
            
            if not user['is_active']:
                logger.warning(f"Inactive user attempted login: {email}")
                return None
            
            if not UserModel.verify_password(password, user['password_hash']):
                logger.warning(f"Invalid password for user: {email}")
                return None
            
            # Return user data without password hash
            return {
                'id': user['id'],
                'email': user['email'],
                'first_name': user['first_name'],
                'last_name': user['last_name'],
                'created_at': user['created_at']
            }
            
        except Exception as e:
            logger.error(f"Error authenticating user: {e}")
            return None
    
    @staticmethod
    def create_session(user_id: int) -> Optional[str]:
        """Create a new user session"""
        try:
            session_token = secrets.token_urlsafe(32)
            expires_at = datetime.now() + timedelta(days=7)  # 7 days expiration
            
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = """
                    INSERT INTO user_sessions (user_id, session_token, expires_at)
                    VALUES (%s, %s, %s)
                    """
                    cursor.execute(query, (user_id, session_token, expires_at))
                    return session_token
                    
        except Exception as e:
            logger.error(f"Error creating session: {e}")
            return None
    
    @staticmethod
    def validate_session(session_token: str) -> Optional[Dict[str, Any]]:
        """Validate a session token and return user data"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = """
                    SELECT u.id, u.email, u.first_name, u.last_name, u.created_at
                    FROM users u
                    JOIN user_sessions s ON u.id = s.user_id
                    WHERE s.session_token = %s AND s.expires_at > NOW() AND u.is_active = TRUE
                    """
                    cursor.execute(query, (session_token,))
                    result = cursor.fetchone()
                    
                    if result:
                        return {
                            'id': result[0],
                            'email': result[1],
                            'first_name': result[2],
                            'last_name': result[3],
                            'created_at': result[4]
                        }
                    return None
                    
        except Exception as e:
            logger.error(f"Error validating session: {e}")
            return None
    
    @staticmethod
    def delete_session(session_token: str) -> bool:
        """Delete a session token"""
        try:
            with db_config.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = "DELETE FROM user_sessions WHERE session_token = %s"
                    cursor.execute(query, (session_token,))
                    return cursor.rowcount > 0
                    
        except Exception as e:
            logger.error(f"Error deleting session: {e}")
            return False
