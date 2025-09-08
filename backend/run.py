#!/usr/bin/env python3
"""
Flask application runner
"""
import sys
import os

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from app import app
from utils.database import db

if __name__ == '__main__':
    # Initialize database connection and create tables (optional)
    try:
        if db.connect():
            db.create_tables()
            print("Database initialized successfully")
        else:
            print("Warning: Could not connect to database - running without DB")
    except Exception as e:
        print(f"Database connection skipped: {e}")
    
    # Run the Flask application on port 5001
    import os
    port = int(os.getenv('PORT', 5001))
    print(f"Starting Flask on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
