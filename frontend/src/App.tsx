import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CanvasService } from './services/canvas.service';
import { ComplianceService } from './services/compliance.service';
import { ExportService } from './services/export.service';
import { CanvasState, ComplianceScore } from './types';
import './App.css';

const App: React.FC = () => {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    elements: [],
    selectedId: null,
    scale: 1,
    backgroundColor: '#ffffff',
    width: 1080,
    height: 1080,
    history: [],
    historyStep: -1,
  });

  const [compliance, setCompliance] = useState<ComplianceScore>({
    score: 100,
    violations: [],
    warnings: [],
    recommendations: [],
    isCompliant: true,
  });

  const [exporting, setExporting] = useState(false);

  // Add image element
  const handleAddImage = async (file: File) => {
    try {
      const element = await CanvasService.createImageElement(file);
      setCanvasState(prev => ({
        ...prev,
        elements: [...prev.elements, element],
      }));
    } catch (error) {
      console.error('Error adding image:', error);
    }
  };

  // Add text element
  const handleAddText = (text: string) => {
    const element = CanvasService.createTextElement(text);
    setCanvasState(prev => ({
      ...prev,
      elements: [...prev.elements, element],
    }));
  };

  // Update element
  const handleUpdateElement = (elementId: string, updates: any) => {
    setCanvasState(prev => ({
      ...prev,
      elements: prev.elements.map(el =>
        el.id === elementId ? { ...el, ...updates } : el
      ),
    }));
  };

  // Delete element
  const handleDeleteElement = (elementId: string) => {
    setCanvasState(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== elementId),
    }));
  };

  // Update compliance
  useEffect(() => {
    const updateCompliance = async () => {
      const score = await ComplianceService.calculateCompliance(canvasState);
      setCompliance(score);
    };
    updateCompliance();
  }, [canvasState]);

  // Export
  const handleExport = async () => {
    setExporting(true);
    try {
      const outputs = await ExportService.exportToFormats(canvasState, [
        'facebook_feed',
        'instagram_feed',
        'instagram_story',
        'linkedin',
      ]);
      console.log('Export complete:', outputs);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🎨 CreativeForge AI</h1>
        <p>AI-Powered Retail Media Creative Builder</p>
      </header>

      <div className="workspace">
        {/* Toolbar */}
        <div className="toolbar">
          <label className="btn">
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={e => e.target.files && handleAddImage(e.target.files)}
              style={{ display: 'none' }}
            />
          </label>
          <button className="btn" onClick={() => handleAddText('Enter text here')}>
            Add Text
          </button>
          <button className="btn" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting...' : 'Export All Formats'}
          </button>
        </div>

        <div className="main-content">
          {/* Canvas */}
          <div className="canvas-container">
            <div className="canvas" style={{
              width: `${canvasState.width}px`,
              height: `${canvasState.height}px`,
              backgroundColor: canvasState.backgroundColor,
              border: '2px solid #ddd',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {canvasState.elements.map(element => (
                <div
                  key={element.id}
                  className={`element ${element.id === canvasState.selectedId ? 'selected' : ''}`}
                  style={{
                    position: 'absolute',
                    left: `${element.x}px`,
                    top: `${element.y}px`,
                    width: `${element.width}px`,
                    height: `${element.height}px`,
                    opacity: element.opacity,
                    transform: `rotate(${element.rotation}deg)`,
                    cursor: 'move',
                    border: element.id === canvasState.selectedId ? '2px solid blue' : 'none',
                  }}
                >
                  {element.type === 'image' && (
                    <img src={element.data.src} alt="Element" style={{ width: '100%', height: '100%' }} />
                  )}
                  {element.type === 'text' && (
                    <div style={{
                      fontSize: `${element.data.fontSize}px`,
                      fontFamily: element.data.fontFamily,
                      color: element.data.color,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      wordWrap: 'break-word',
                    }}>
                      {element.data.text}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Panels */}
          <div className="panels">
            {/* Layers Panel */}
            <div className="panel">
              <h3>📑 Layers</h3>
              <div className="layers-list">
                {canvasState.elements.map(el => (
                  <div
                    key={el.id}
                    className={`layer ${el.id === canvasState.selectedId ? 'active' : ''}`}
                    onClick={() => setCanvasState(prev => ({ ...prev, selectedId: el.id }))}
                  >
                    <span>{el.type === 'image' ? '🖼️' : '📝'} {el.id.substring(0, 10)}</span>
                    <button onClick={() => handleDeleteElement(el.id)}>✕</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance Panel */}
            <div className="panel">
              <h3>✓ Compliance</h3>
              <div className="compliance-score">
                <div className={`score ${compliance.isCompliant ? 'compliant' : 'non-compliant'}`}>
                  {Math.round(compliance.score)}/100
                </div>
              </div>

              {compliance.violations.length > 0 && (
                <div className="violations">
                  <h4>⚠️ Violations ({compliance.violations.length})</h4>
                  {compliance.violations.map(v => (
                    <div key={v.id} className="violation">
                      <strong>{v.name}</strong>
                      <p>{v.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {compliance.warnings.length > 0 && (
                <div className="warnings">
                  <h4>⚡ Warnings ({compliance.warnings.length})</h4>
                  {compliance.warnings.map(w => (
                    <div key={w.id} className="warning">
                      {w.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>© 2025 CreativeForge AI - Powered by GPT-4V & DALL-E 3</p>
      </footer>
    </div>
  );
};

export default App;
