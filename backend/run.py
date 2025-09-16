#!/usr/bin/env python3
"""
Flask application runner
"""
import sys
import os

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from app import app

if __name__ == '__main__':
    # Run the Flask application on port 5001 (internal)
    import os
    port = int(os.getenv('FLASK_PORT', 5001))
    debug = os.getenv('FLASK_ENV') == 'development'
    print(f"Starting Flask on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
