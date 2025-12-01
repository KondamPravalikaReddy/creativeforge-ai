import { CanvasState, ExportFormat, ExportOutput } from '../types';
import axios from 'axios';

export class ExportService {
  private static readonly FORMATS: Record<string, ExportFormat> = {
    facebook_feed: { name: 'Facebook Feed', width: 1200, height: 630, platform: 'facebook' },
    facebook_story: { name: 'Facebook Story', width: 1080, height: 1920, platform: 'facebook' },
    instagram_feed: { name: 'Instagram Feed', width: 1080, height: 1080, platform: 'instagram' },
    instagram_story: { name: 'Instagram Story', width: 1080, height: 1920, platform: 'instagram' },
    linkedin: { name: 'LinkedIn Post', width: 1200, height: 627, platform: 'linkedin' },
  };

  static async exportToFormats(
    canvasState: CanvasState,
    formatKeys: string[]
  ): Promise<ExportOutput[]> {
    const outputs: ExportOutput[] = [];

    for (const formatKey of formatKeys) {
      const format = this.FORMATS[formatKey];
      if (!format) continue;

      try {
        const output = await this.exportToFormat(canvasState, format);
        outputs.push(output);
      } catch (error) {
        console.error(`Export failed for ${formatKey}:`, error);
      }
    }

    return outputs;
  }

  private static async exportToFormat(
    canvasState: CanvasState,
    format: ExportFormat
  ): Promise<ExportOutput> {
    const resizedState = this.adaptiveResize(canvasState, format);
    const imageData = await this.generateImage(resizedState);
    
    const formData = new FormData();
    formData.append('file', imageData);
    formData.append('format', format.name);

    const response = await axios.post('/api/creative/export', formData);
    
    return {
      format,
      url: response.data.url,
      size: response.data.size,
      downloadUrl: response.data.downloadUrl,
    };
  }

  private static adaptiveResize(
    canvasState: CanvasState,
    targetFormat: ExportFormat
  ): CanvasState {
    const resized = JSON.parse(JSON.stringify(canvasState));
    const targetRatio = targetFormat.width / targetFormat.height;
    const currentRatio = canvasState.width / canvasState.height;

    if (Math.abs(targetRatio - currentRatio) > 0.01) {
      if (targetRatio > currentRatio) {
        resized.height = Math.floor(canvasState.width / targetRatio);
      } else {
        resized.width = Math.floor(canvasState.height * targetRatio);
      }

      resized.elements.forEach((element: any) => {
        if (element.type === 'image' && element.data?.elementType === 'product') {
          element.x = (resized.width - element.width) / 2;
          element.y = (resized.height - element.height) / 2;
        }
      });
    }

    return resized;
  }

  private static async generateImage(canvasState: CanvasState): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = canvasState.width;
      canvas.height = canvasState.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.fillStyle = canvasState.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let loadedImages = 0;
      const totalImages = canvasState.elements.filter(el => el.type === 'image').length;

      canvasState.elements.forEach(element => {
        if (element.type === 'image') {
          const img = new Image();
          img.onload = () => {
            ctx.globalAlpha = element.opacity;
            ctx.save();
            ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
            ctx.rotate((element.rotation * Math.PI) / 180);
            ctx.drawImage(img, -element.width / 2, -element.height / 2, element.width, element.height);
            ctx.restore();
            ctx.globalAlpha = 1;

            loadedImages++;
            if (loadedImages === totalImages) {
              canvas.toBlob(resolve, 'image/jpeg', 0.92);
            }
          };
          img.src = element.data.src;
        }
      });

      if (totalImages === 0) {
        canvas.toBlob(resolve, 'image/jpeg', 0.92);
      }
    });
  }
}
