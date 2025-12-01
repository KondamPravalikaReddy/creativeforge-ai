from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo
from dotenv import load_dotenv
import os
import logging

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configuration
app.config['MONGO_URI'] = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/creativeforge')
app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

# Create upload folder
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize MongoDB
mongo = PyMongo(app)

# Register blueprints
from .routes import creative, compliance

app.register_blueprint(creative.bp)
app.register_blueprint(compliance.bp)

# Error handlers
@app.errorhandler(400)
def bad_request(error):
    return {'error': 'Bad request', 'details': str(error)}, 400

@app.errorhandler(404)
def not_found(error):
    return {'error': 'Not found'}, 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f'Internal error: {error}')
    return {'error': 'Internal server error'}, 500

# Health check
@app.route('/health', methods=['GET'])
def health():
    return {'status': 'healthy', 'service': 'CreativeForge AI'}, 200

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')
