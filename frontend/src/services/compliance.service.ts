import { CanvasState, ComplianceScore } from '../types';
import axios from 'axios';

export class ComplianceService {
  static async calculateCompliance(
    canvasState: CanvasState,
    guidelines: any = {}
  ): Promise<ComplianceScore> {
    try {
      const textCoverage = this.calculateTextCoverage(canvasState);
      const violations = [];
      const warnings = [];
      const recommendations = [];

      // Rule 1: Text coverage
      if (textCoverage > (guidelines.maxTextCoverage || 20)) {
        violations.push({
          id: 'text-coverage',
          type: 'hard',
          name: 'Text Coverage Exceeded',
          description: `Text covers ${textCoverage.toFixed(1)}% of canvas`,
          message: `Reduce text to ${guidelines.maxTextCoverage || 20}%`,
          severity: 'error',
        });
      }

      // Rule 2: Logo size
      const logoSize = this.getLogoSize(canvasState);
      if (logoSize > 0 && logoSize < (guidelines.minLogoSize || 100)) {
        warnings.push({
          id: 'logo-size',
          type: 'soft',
          name: 'Logo Size Warning',
          description: `Logo is ${logoSize}px² (minimum: ${guidelines.minLogoSize || 100}px²)`,
          message: 'Increase logo size for visibility',
          severity: 'warning',
        });
      }

      // Rule 3: Contrast ratio
      const contrastIssues = this.validateContrast(canvasState);
      recommendations.push(...contrastIssues);

      // Calculate score
      const score = Math.max(
        0,
        100 - violations.length * 15 - warnings.length * 5
      );

      return {
        score,
        violations,
        warnings,
        recommendations,
        isCompliant: violations.length === 0,
      };
    } catch (error) {
      console.error('Compliance calculation error:', error);
      return {
        score: 50,
        violations: [],
        warnings: [],
        recommendations: [],
        isCompliant: false,
      };
    }
  }

  private static calculateTextCoverage(canvasState: CanvasState): number {
    const textElements = canvasState.elements.filter(el => el.type === 'text');
    const totalTextArea = textElements.reduce(
      (sum, el) => sum + el.width * el.height,
      0
    );
    const canvasArea = canvasState.width * canvasState.height;
    return canvasArea > 0 ? (totalTextArea / canvasArea) * 100 : 0;
  }

  private static getLogoSize(canvasState: CanvasState): number {
    const logoElements = canvasState.elements.filter(
      el => el.data?.elementType === 'logo'
    );
    return logoElements.length > 0
      ? logoElements.width * logoElements.height
      : 0;
  }

  private static validateContrast(canvasState: CanvasState) {
    const issues = [];
    const textElements = canvasState.elements.filter(el => el.type === 'text');

    textElements.forEach((textEl, index) => {
      const ratio = this.getContrastRatio(
        textEl.data?.color || '#000000',
        canvasState.backgroundColor
      );

      if (ratio < 4.5) {
        issues.push({
          id: `contrast-${index}`,
          type: 'recommendation',
          name: 'Low Contrast',
          description: `Contrast ratio: ${ratio.toFixed(1)}:1`,
          message: 'Increase to 4.5:1 for accessibility',
          severity: 'info',
        });
      }
    });

    return issues;
  }

  private static getContrastRatio(color1: string, color2: string): number {
    const lum1 = this.getRelativeLuminance(color1);
    const lum2 = this.getRelativeLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  private static getRelativeLuminance(hex: string): number {
    const rgb = this.hexToRgb(hex);
    const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
    const luminance =
      0.2126 * this.adjustColor(r) +
      0.7152 * this.adjustColor(g) +
      0.0722 * this.adjustColor(b);
    return luminance;
  }

  private static adjustColor(color: number): number {
    return color <= 0.03928
      ? color / 12.92
      : Math.pow((color + 0.055) / 1.055, 2.4);
  }

  private static hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result, 16),
          g: parseInt(result, 16),
          b: parseInt(result, 16),
        }
      : { r: 0, g: 0, b: 0 };
  }
}
