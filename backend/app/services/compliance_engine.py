import logging
from typing import Dict, List

logger = logging.getLogger(__name__)

class ComplianceEngine:
    """Guideline compliance validation engine"""

    @staticmethod
    def validate_creative(canvas_state: dict, guidelines: dict) -> dict:
        """Validate creative against guidelines"""
        try:
            violations = []
            warnings = []
            recommendations = []

            elements = canvas_state.get('elements', []) or []
            width = canvas_state.get('width', 1080)
            height = canvas_state.get('height', 1080)

            # ---------- Basic presence rules ----------
            images = [e for e in elements if e.get('type') == 'image']
            texts = [e for e in elements if e.get('type') == 'text']

            if not elements:
                violations.append({
                    'type': 'empty_canvas',
                    'severity': 'error',
                    'message': 'Canvas has no elements. Add product image and text.',
                    'suggestion': 'Upload a packshot and add a headline.'
                })

            if not images:
                violations.append({
                    'type': 'no_product_image',
                    'severity': 'error',
                    'message': 'No product image found.',
                    'suggestion': 'Add at least one product image to the creative.'
                })

            if not texts:
                warnings.append({
                    'type': 'no_headline',
                    'severity': 'warning',
                    'message': 'No headline text found.',
                    'suggestion': 'Add a clear headline to improve communication.'
                })

            if len(texts) > 2:
                warnings.append({
                    'type': 'too_much_text',
                    'severity': 'warning',
                    'message': 'There are multiple text blocks which may feel cluttered.',
                    'suggestion': 'Reduce the number of text elements.'
                })

            # ---------- Existing rule 1: Text coverage ----------
            text_coverage = ComplianceEngine.calculate_text_coverage(canvas_state)
            if text_coverage > guidelines.get('maxTextCoverage', 20):
                violations.append({
                    'type': 'text_coverage',
                    'severity': 'error',
                    'message': f'Text covers {text_coverage:.1f}% (max {guidelines.get("maxTextCoverage", 20)}%)',
                    'suggestion': 'Reduce text elements or decrease text size.'
                })

            # ---------- Existing rule 2: Logo size ----------
            logo_size = ComplianceEngine.get_logo_size(canvas_state)
            if logo_size > 0 and logo_size < guidelines.get('minLogoSize', 100):
                warnings.append({
                    'type': 'logo_size',
                    'severity': 'warning',
                    'message': f'Logo size {logo_size}px² below minimum.',
                    'suggestion': 'Increase logo size for better visibility.'
                })

            # ---------- Existing rule 3: Safe zones ----------
            safe_zone_violations = ComplianceEngine.check_safe_zones(
                canvas_state,
                guidelines.get('safeZoneMargin', 10)
            )
            violations.extend(safe_zone_violations)

            # ---------- Score ----------
            score = ComplianceEngine.calculate_score(
                len(violations),
                len(warnings),
                len(recommendations)
            )

            return {
                'score': score,
                'violations': violations,
                'warnings': warnings,
                'recommendations': recommendations,
                'isCompliant': len(violations) == 0
            }

        except Exception as e:
            logger.error(f'Validation error: {str(e)}')
            return {
                'score': 50,
                'violations': [],
                'warnings': [],
                'recommendations': [],
                'isCompliant': False
            }

    @staticmethod
    def calculate_text_coverage(canvas_state: dict) -> float:
        """Calculate text coverage percentage"""
        try:
            text_elements = [e for e in canvas_state.get('elements', []) if e.get('type') == 'text']
            total_text_area = sum(e['width'] * e['height'] for e in text_elements)
            canvas_area = canvas_state['width'] * canvas_state['height']
            return (total_text_area / canvas_area * 100) if canvas_area > 0 else 0
        except Exception as e:
            logger.error(f'Text coverage calculation error: {str(e)}')
            return 0

    @staticmethod
    def get_logo_size(canvas_state: dict) -> int:
        """Get logo size"""
        try:
            logo_elements = [e for e in canvas_state.get('elements', [])
                           if e.get('data', {}).get('elementType') == 'logo']
            if logo_elements:
                logo = logo_elements
                return logo['width'] * logo['height']
            return 0
        except Exception as e:
            logger.error(f'Logo size error: {str(e)}')
            return 0

    @staticmethod
    def check_safe_zones(canvas_state: dict, margin: int) -> List[dict]:
        """Check safe zone violations"""
        violations = []
        try:
            for element in canvas_state.get('elements', []):
                if (element['x'] < margin or
                    element['y'] < margin or
                    element['x'] + element['width'] > canvas_state['width'] - margin or
                    element['y'] + element['height'] > canvas_state['height'] - margin):

                    violations.append({
                        'type': 'safe_zone_violation',
                        'severity': 'error',
                        'message': f'Element outside safe zone',
                        'suggestion': f'Keep {margin}px margin from edges'
                    })
        except Exception as e:
            logger.error(f'Safe zone check error: {str(e)}')

        return violations

    @staticmethod
    def calculate_score(violations: int, warnings: int, recommendations: int) -> int:
        """Calculate compliance score"""
        base_score = 100
        violation_penalty = violations * 15
        warning_penalty = warnings * 5
        return max(0, base_score - violation_penalty - warning_penalty)
