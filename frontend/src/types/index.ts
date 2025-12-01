// Canvas Element Types
export interface CanvasElement {
  id: string;
  type: 'image' | 'text' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  data: Record<string, any>;
  zIndex: number;
}

export interface CanvasState {
  elements: CanvasElement[];
  selectedId: string | null;
  scale: number;
  backgroundColor: string;
  width: number;
  height: number;
  history: CanvasState[];
  historyStep: number;
}

// Compliance Types
export interface ComplianceRule {
  id: string;
  type: 'hard' | 'soft' | 'recommendation';
  name: string;
  description: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ComplianceScore {
  score: number;
  violations: ComplianceRule[];
  warnings: ComplianceRule[];
  recommendations: ComplianceRule[];
  isCompliant: boolean;
}

// Asset Types
export interface Asset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'logo' | 'background';
  category: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  brand?: string;
}

// Export Types
export interface ExportFormat {
  name: string;
  width: number;
  height: number;
  platform: 'facebook' | 'instagram' | 'linkedin' | 'custom';
}

export interface ExportOutput {
  format: ExportFormat;
  url: string;
  size: number;
  downloadUrl: string;
}
