#!/usr/bin/env python3
"""
Database initialization script for TiDB Cloud
This script creates the database schema and initializes the tables
"""

import os
import sys
import logging
from pathlib import Path

# Add the src directory to the Python path
sys.path.append(str(Path(__file__).parent.parent))

from config.database import db_config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def read_schema_file():
    """Read the SQL schema file"""
    schema_path = Path(__file__).parent / 'schema.sql'
    try:
        with open(schema_path, 'r', encoding='utf-8') as file:
            return file.read()
    except FileNotFoundError:
        logger.error(f"Schema file not found: {schema_path}")
        return None
    except Exception as e:
        logger.error(f"Error reading schema file: {e}")
        return None

def execute_schema():
    """Execute the database schema"""
    schema_sql = read_schema_file()
    if not schema_sql:
        logger.error("Failed to read schema file")
        return False
    
    try:
        with db_config.get_connection() as conn:
            with conn.cursor() as cursor:
                # Split the schema into individual statements
                statements = [stmt.strip() for stmt in schema_sql.split(';') if stmt.strip()]
                
                for statement in statements:
                    if statement:
                        logger.info(f"Executing: {statement[:50]}...")
                        cursor.execute(statement)
                        logger.info("Statement executed successfully")
                
                conn.commit()
                logger.info("Database schema created successfully")
                return True
                
    except Exception as e:
        logger.error(f"Error executing schema: {e}")
        return False

def test_database_connection():
    """Test the database connection"""
    logger.info("Testing database connection...")
    if db_config.test_connection():
        logger.info(" Database connection successful")
        return True
    else:
        logger.error(" Database connection failed")
        return False

def main():
    """Main initialization function"""
    logger.info(" Starting database initialization...")
    
    # Test connection first
    if not test_database_connection():
        logger.error("Cannot proceed without database connection")
        sys.exit(1)
    
    # Execute schema
    if execute_schema():
        logger.info(" Database initialization completed successfully")
        logger.info(" Tables created:")
        logger.info("   - users")
        logger.info("   - resumes") 
        logger.info("   - job_descriptions")
        logger.info("   - ai_suggestions")
        logger.info("   - job_applications")
        logger.info("   - user_sessions")
    else:
        logger.error(" Database initialization failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
