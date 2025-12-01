from flask import Blueprint, request, jsonify, current_app
from ..services.image_processor import ImageProcessor
from ..services.compliance_engine import ComplianceEngine
import os
import logging

bp = Blueprint('creative', __name__, url_prefix='/api/creative')
logger = logging.getLogger(__name__)

@bp.route('/upload-image', methods=['POST'])
def upload_image():
    """Upload and process image"""
    try:
        if 'image' not in request.files:
            return {'error': 'No image provided'}, 400

        file = request.files['image']
        remove_bg = request.form.get('removeBackground', 'true').lower() == 'true'

        # Save temporarily
        temp_path = os.path.join(current_app.config['UPLOAD_FOLDER'], file.filename)
        file.save(temp_path)

        # Process image
        if remove_bg:
            processed, success = ImageProcessor.remove_background(temp_path)
            if not success:
                with open(temp_path, 'rb') as f:
                    processed = f.read()
        else:
            with open(temp_path, 'rb') as f:
                processed = f.read()

        # Get metadata
        metadata = ImageProcessor.get_image_metadata(temp_path)

        return {
            'success': True,
            'processedImage': processed.hex() if processed else None,
            'metadata': metadata
        }, 200

    except Exception as e:
        logger.error(f'Upload error: {str(e)}')
        return {'error': str(e)}, 500

@bp.route('/remove-background', methods=['POST'])
def remove_background():
    """Remove background from image"""
    try:
        data = request.json
        image_url = data.get('imageUrl')

        if not image_url:
            return {'error': 'No image URL provided'}, 400

        processed, success = ImageProcessor.remove_background(image_url)

        return {
            'success': success,
            'processedImage': processed.hex() if processed else image_url
        }, 200

    except Exception as e:
        logger.error(f'Background removal error: {str(e)}')
        return {'error': str(e)}, 500

@bp.route('/export', methods=['POST'])
def export_creative():
    """Export creative"""
    try:
        file = request.files.get('file')
        format_name = request.form.get('format', 'jpeg')

        if not file:
            return {'error': 'No file provided'}, 400

        # Optimize image
        file_data = file.read()
        optimized = ImageProcessor.optimize_image(file_data)

        # Save optimized
        filename = f'export_{int(os.times() * 1000)}.jpeg'
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)

        with open(filepath, 'wb') as f:
            f.write(optimized)

        return {
            'success': True,
            'url': f'/uploads/{filename}',
            'downloadUrl': f'/uploads/{filename}',
            'size': len(optimized)
        }, 200

    except Exception as e:
        logger.error(f'Export error: {str(e)}')
        return {'error': str(e)}, 500

@bp.route('/validate-compliance', methods=['POST'])
def validate_compliance():
    """Validate creative compliance"""
    try:
        data = request.json
        canvas_state = data.get('canvasState')
        guidelines = data.get('guidelines', {})

        if not canvas_state:
            return {'error': 'No canvas state provided'}, 400

        # Validate
        result = ComplianceEngine.validate_creative(canvas_state, guidelines)

        return {
            'success': True,
            'compliance': result
        }, 200

    except Exception as e:
        logger.error(f'Compliance validation error: {str(e)}')
        return {'error': str(e)}, 500
