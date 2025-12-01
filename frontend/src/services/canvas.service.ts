import { CanvasElement, CanvasState } from '../types';
import axios from 'axios';

export class CanvasService {
  static generateElementId(): string {
    return `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static async createImageElement(
    file: File,
    options: { removeBackground?: boolean; x?: number; y?: number } = {}
  ): Promise<CanvasElement> {
    const { removeBackground = true, x = 0, y = 0 } = options;
    const imageUrl = await this.readFileAsDataURL(file);

    let processedUrl = imageUrl;
    if (removeBackground) {
      try {
        processedUrl = await this.removeBackground(imageUrl);
      } catch (error) {
        console.warn('Background removal failed, using original:', error);
      }
    }

    return {
      id: this.generateElementId(),
      type: 'image',
      x,
      y,
      width: 300,
      height: 300,
      rotation: 0,
      opacity: 1,
      zIndex: 1,
      data: {
        src: processedUrl,
        originalSrc: imageUrl,
      },
    };
  }

  static createTextElement(
    text: string,
    options: {
      x?: number;
      y?: number;
      fontSize?: number;
      fontFamily?: string;
      color?: string;
    } = {}
  ): CanvasElement {
    const {
      x = 0,
      y = 0,
      fontSize = 24,
      fontFamily = 'Arial',
      color = '#000000',
    } = options;

    return {
      id: this.generateElementId(),
      type: 'text',
      x,
      y,
      width: 300,
      height: 100,
      rotation: 0,
      opacity: 1,
      zIndex: 1,
      data: { text, fontSize, fontFamily, color },
    };
  }

  private static readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private static async removeBackground(imageUrl: string): Promise<string> {
    try {
      const response = await axios.post('/api/creative/remove-background', {
        imageUrl,
      });
      return response.data.processedImage;
    } catch (error) {
      console.error('Background removal error:', error);
      return imageUrl;
    }
  }

  static validateCanvasState(state: CanvasState): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!state.elements || state.elements.length === 0) {
      errors.push('Canvas must have at least one element');
    }
    if (state.width <= 0 || state.height <= 0) {
      errors.push('Canvas dimensions must be positive');
    }
    return { valid: errors.length === 0, errors };
  }

  static cloneCanvasState(state: CanvasState): CanvasState {
    return JSON.parse(JSON.stringify(state));
  }
}
