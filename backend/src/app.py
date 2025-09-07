from flask import Flask
from api_routes import api_bp
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = '../uploads'

# Register the blueprint
app.register_blueprint(api_bp, url_prefix='/api')

# Main routes
@app.route('/')
def home():
    return 'Welcome to the Flask API!'

if __name__ == '__main__':
    app.run(debug=True, port=5001)