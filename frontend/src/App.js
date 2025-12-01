import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

function App() {
    const [health, setHealth] = useState(null);
    const [headline, setHeadline] = useState('Winter Sale - 50% OFF');
    const [selectedFormat, setSelectedFormat] = useState('instagram');
    const [showHelp, setShowHelp] = useState(false);
    const [canvasState, setCanvasState] = useState({
        elements: [],
        width: 1080,
        height: 1080,
        backgroundColor: '#ffffff',
    });
    const [compliance, setCompliance] = useState(null);
    const [loadingCompliance, setLoadingCompliance] = useState(false);

    // Format dimensions
    const formatDimensions = {
        instagram: { width: 1080, height: 1080, label: 'Instagram Feed' },
        facebook: { width: 1200, height: 630, label: 'Facebook Feed' },
        linkedin: { width: 1200, height: 627, label: 'LinkedIn Post' },
    };

    // Check backend health on load
    useEffect(() => {
        axios
            .get(`${API_BASE}/health`)
            .then(res => setHealth(res.data))
            .catch(() => setHealth({ status: 'error' }));
    }, []);

    // Handle format change
    const handleFormatChange = e => {
        const format = e.target.value;
        setSelectedFormat(format);
        const dims = formatDimensions[format];
        setCanvasState(prev => ({
            ...prev,
            width: dims.width,
            height: dims.height,
        }));
    };

    // Handle image upload (add as one element on canvas)
    const handleImageUpload = e => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = ev => {
            const src = ev.target.result;
            const newElement = {
                id: 'img-1',
                type: 'image',
                x: 200,
                y: 200,
                width: 400,
                height: 400,
                rotation: 0,
                opacity: 1,
                data: {
                    src,
                    elementType: 'product',
                },
            };

            setCanvasState(prev => ({
                ...prev,
                elements: [
                    ...prev.elements.filter(el => el.id !== 'img-1'),
                    newElement,
                ],
            }));
        };
        reader.readAsDataURL(file);
    };

    // Simple text add (headline) using editable headline state
    const handleAddText = () => {
        if (!headline.trim()) {
            alert('Please enter a headline first.');
            return;
        }

        const textElement = {
            id: 'txt-1',
            type: 'text',
            x: 100,
            y: 50,
            width: 600,
            height: 80,
            rotation: 0,
            opacity: 1,
            data: {
                text: headline,
                fontSize: 32,
                fontFamily: 'Arial',
                color: '#000000',
            },
        };
        setCanvasState(prev => ({
            ...prev,
            elements: [
                ...prev.elements.filter(el => el.id !== 'txt-1'),
                textElement,
            ],
        }));
    };

    // Call backend compliance API
    const handleValidateCompliance = async () => {
        if (canvasState.elements.length === 0) {
            alert('Please add an image and headline first.');
            return;
        }

        setLoadingCompliance(true);
        setCompliance(null);
        try {
            const guidelines = {
                maxTextCoverage: 20,
                minLogoSize: 100,
                safeZoneMargin: 10,
                approvedColors: ['#000000', '#ffffff'],
            };

            const res = await axios.post(
                `${API_BASE}/api/creative/validate-compliance`,
                {
                    canvasState,
                    guidelines,
                }
            );

            setCompliance(res.data.compliance);
        } catch (err) {
            console.error('Compliance validation error:', err);
            alert('Compliance API error. Please ensure backend is running.');
        } finally {
            setLoadingCompliance(false);
        }
    };

    // Clear canvas
    const handleClearCanvas = () => {
        if (window.confirm('Clear all elements from canvas?')) {
            setCanvasState({
                elements: [],
                width: formatDimensions[selectedFormat].width,
                height: formatDimensions[selectedFormat].height,
                backgroundColor: '#ffffff',
            });
            setCompliance(null);
        }
    };

    return (
        <div
            style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                minHeight: '100vh',
                background: '#f5f5f5',
            }}
        >
            {/* HEADER */}
            <header
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    padding: '20px 24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
            >
                <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                    <h1 style={{ margin: 0, fontSize: 28, fontWeight: 'bold' }}>
                        🎨 CreativeForge AI
                    </h1>
                    <p style={{ margin: '6px 0 0 0', fontSize: 14, opacity: 0.95 }}>
                        AI-Powered Retail Media Creative Builder
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: 12 }}>
                        Backend:{' '}
                        {health && health.status ? (

                            <span style={{ color: '#4ade80' }}>✅ Connected</span>

                        ) : (

                            <span style={{ color: '#f87171' }}>⚠ Not reachable</span>

                        )}
                    </p>
                </div>
            </header>

            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px' }}>
                <div style={{ display: 'flex', gap: 20 }}>
                    {/* LEFT: CONTROLS + CANVAS */}
                    <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* HELP TOGGLE */}
                        <div style={{ textAlign: 'right', marginBottom: 8 }}>
                            <button
                                onClick={() => setShowHelp(!showHelp)}
                                style={{
                                    padding: '6px 12px',
                                    background: '#e0e7ff',
                                    color: '#4c1d95',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    fontSize: 12,
                                    fontWeight: 500,
                                }}
                            >
                                {showHelp ? '✕ Hide Guide' : '? How to Use'}
                            </button>
                        </div>

                        {/* HELP BOX */}
                        {showHelp && (
                            <div
                                style={{
                                    background: '#fef3c7',
                                    border: '1px solid #fbbf24',
                                    borderRadius: 8,
                                    padding: 12,
                                    marginBottom: 12,
                                }}
                            >
                                <h4 style={{ margin: '0 0 8px 0', color: '#92400e' }}>
                                    Quick Start Guide
                                </h4>
                                <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#78350f' }}>
                                    <li>Enter your special offer in the headline box</li>
                                    <li>Upload a product image</li>
                                    <li>Click "Add Headline Text"</li>
                                    <li>Click "Check Compliance" to validate</li>
                                    <li>Fix any issues shown on the right panel</li>
                                    <li>Aim for 95+ compliance score</li>
                                </ol>
                            </div>
                        )}

                        {/* CONTROLS ROW 1: FORMAT + HEADLINE */}
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                            <div>
                                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>
                                    📱 Platform Format
                                </label>
                                <select
                                    value={selectedFormat}
                                    onChange={handleFormatChange}
                                    style={{
                                        padding: '6px 10px',
                                        borderRadius: 4,
                                        border: '1px solid #ddd',
                                        fontSize: 12,
                                    }}
                                >
                                    <option value="instagram">Instagram (1080×1080)</option>
                                    <option value="facebook">Facebook (1200×630)</option>
                                    <option value="linkedin">LinkedIn (1200×627)</option>
                                </select>
                            </div>

                            <div style={{ flex: 1, minWidth: 200 }}>
                                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>
                                    📝 Enter Your Offer
                                </label>
                                <input
                                    type="text"
                                    value={headline}
                                    onChange={e => setHeadline(e.target.value)}
                                    placeholder="e.g., Diwali Mega Sale - 50% OFF"
                                    maxLength={60}
                                    style={{
                                        width: '100%',
                                        padding: '8px 10px',
                                        borderRadius: 4,
                                        border: '1px solid #ddd',
                                        fontSize: 12,
                                    }}
                                />
                                <p style={{ margin: '2px 0 0 0', fontSize: 10, color: '#999' }}>
                                    {headline.length}/60 characters
                                </p>
                            </div>
                        </div>

                        {/* CONTROLS ROW 2: ACTION BUTTONS */}
                        <div
                            style={{
                                display: 'flex',
                                gap: 10,
                                flexWrap: 'wrap',
                            }}
                        >
                            <label
                                style={{
                                    padding: '10px 16px',
                                    background: '#667eea',
                                    color: '#fff',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    fontWeight: 500,
                                    transition: 'background 0.2s',
                                }}
                                onMouseOver={e => (e.target.style.background = '#5568d3')}
                                onMouseOut={e => (e.target.style.background = '#667eea')}
                            >
                                📸 Upload Packshot
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                />
                            </label>

                            <button
                                onClick={handleAddText}
                                style={{
                                    padding: '10px 16px',
                                    background: '#764ba2',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    fontWeight: 500,
                                    transition: 'background 0.2s',
                                }}
                                onMouseOver={e => (e.target.style.background = '#6a3e8f')}
                                onMouseOut={e => (e.target.style.background = '#764ba2')}
                            >
                                ✏️ Add Headline
                            </button>

                            <button
                                onClick={handleValidateCompliance}
                                disabled={loadingCompliance}
                                style={{
                                    padding: '10px 16px',
                                    background: '#10b981',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 6,
                                    cursor: loadingCompliance ? 'not-allowed' : 'pointer',
                                    fontSize: 13,
                                    fontWeight: 500,
                                    opacity: loadingCompliance ? 0.7 : 1,
                                    transition: 'background 0.2s',
                                }}
                                onMouseOver={e => !loadingCompliance && (e.target.style.background = '#059669')}
                                onMouseOut={e => (e.target.style.background = '#10b981')}
                            >
                                {loadingCompliance ? '⏳ Checking…' : '✅ Check Compliance'}
                            </button>

                            <button
                                onClick={handleClearCanvas}
                                style={{
                                    padding: '10px 16px',
                                    background: '#ef4444',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    fontWeight: 500,
                                    transition: 'background 0.2s',
                                }}
                                onMouseOver={e => (e.target.style.background = '#dc2626')}
                                onMouseOut={e => (e.target.style.background = '#ef4444')}
                            >
                                🗑 Clear
                            </button>
                        </div>

                        {/* CANVAS PREVIEW */}
                        <div
                            style={{
                                background: '#fff',
                                borderRadius: 8,
                                padding: 12,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                overflow: 'auto',
                            }}
                        >
                            <p style={{ margin: '0 0 8px 0', fontSize: 12, color: '#666', fontWeight: 500 }}>
                                Preview ({canvasState.width}×{canvasState.height})
                            </p>
                            <div
                                style={{
                                    width: Math.min(540, canvasState.width * 0.5),
                                    height: Math.min(540, canvasState.height * 0.5),
                                    margin: '0 auto',
                                    position: 'relative',
                                    backgroundColor: canvasState.backgroundColor,
                                    border: '2px solid #e5e7eb',
                                    borderRadius: 4,
                                }}
                            >
                                {canvasState.elements.length === 0 ? (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#d1d5db',
                                            fontSize: 12,
                                            textAlign: 'center',
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontSize: 24, marginBottom: 8 }}>📋</div>
                                            Upload image & add text to start
                                        </div>
                                    </div>
                                ) : (
                                    canvasState.elements.map(el => (
                                        <div
                                            key={el.id}
                                            style={{
                                                position: 'absolute',
                                                left: el.x / 2,
                                                top: el.y / 2,
                                                width: el.width / 2,
                                                height: el.height / 2,
                                                opacity: el.opacity,
                                                transform: `rotate(${el.rotation}deg)`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {el.type === 'image' && (
                                                <img
                                                    src={el.data.src}
                                                    alt="creative-element"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                    }}
                                                />
                                            )}
                                            {el.type === 'text' && (
                                                <div
                                                    style={{
                                                        fontSize: el.data.fontSize / 2,
                                                        fontFamily: el.data.fontFamily,
                                                        color: el.data.color,
                                                        textAlign: 'center',
                                                        padding: 4,
                                                        fontWeight: 'bold',
                                                        wordWrap: 'break-word',
                                                    }}
                                                >
                                                    {el.data.text}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: COMPLIANCE PANEL */}
                    <div
                        style={{
                            flex: 1,
                            background: '#fff',
                            borderRadius: 8,
                            padding: 16,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            maxWidth: 380,
                            height: 'fit-content',
                            position: 'sticky',
                            top: 20,
                        }}
                    >
                        <h3 style={{ marginTop: 0, marginBottom: 16, color: '#1f2937', fontSize: 16 }}>
                            ✨ Compliance Check
                        </h3>

                        {compliance ? (
                            <>
                                {/* SCORE CARD */}
                                <div
                                    style={{
                                        fontSize: 48,
                                        fontWeight: 'bold',
                                        marginBottom: 12,
                                        padding: 16,
                                        borderRadius: 8,
                                        textAlign: 'center',
                                        background: compliance.isCompliant ? '#dcfce7' : '#fee2e2',
                                        color: compliance.isCompliant ? '#15803d' : '#b91c1c',
                                        border: `2px solid ${compliance.isCompliant ? '#86efac' : '#fca5a5'}`,
                                    }}
                                >
                                    {Math.round(compliance.score)}/100
                                </div>

                                {/* STATUS MESSAGE */}
                                {compliance.isCompliant ? (
                                    <div
                                        style={{
                                            background: '#dcfce7',
                                            border: '2px solid #15803d',
                                            borderRadius: 6,
                                            padding: 12,
                                            marginBottom: 12,
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            color: '#15803d',
                                            fontSize: 13,
                                        }}
                                    >
                                        ✅ Ready for Campaign!
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            background: '#fee2e2',
                                            border: '2px solid #b91c1c',
                                            borderRadius: 6,
                                            padding: 12,
                                            marginBottom: 12,
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            color: '#b91c1c',
                                            fontSize: 13,
                                        }}
                                    >
                                        ⚠ Needs Fixes
                                    </div>
                                )}

                                {/* VIOLATIONS */}
                                {compliance.violations && compliance.violations.length > 0 && (
                                    <div style={{ marginBottom: 12 }}>
                                        <h4 style={{ margin: '0 0 8px 0', color: '#b91c1c', fontSize: 12, fontWeight: 'bold' }}>
                                            🚫 Violations ({compliance.violations.length})
                                        </h4>
                                        {compliance.violations.map((v, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    background: '#fee2e2',
                                                    border: 'none',
                                                    borderLeft: '3px solid #b91c1c',
                                                    padding: 8,
                                                    marginBottom: 6,
                                                    borderRadius: 4,
                                                    fontSize: 11,
                                                }}
                                            >
                                                <strong style={{ color: '#b91c1c' }}>{v.type}</strong>
                                                <div style={{ marginTop: 2, color: '#7f1d1d' }}>{v.message}</div>
                                                {v.suggestion && (
                                                    <div style={{ marginTop: 4, fontStyle: 'italic', color: '#991b1b' }}>
                                                        💡 {v.suggestion}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* WARNINGS */}
                                {compliance.warnings && compliance.warnings.length > 0 && (
                                    <div style={{ marginBottom: 12 }}>
                                        <h4 style={{ margin: '0 0 8px 0', color: '#f59e0b', fontSize: 12, fontWeight: 'bold' }}>
                                            ⚠ Warnings ({compliance.warnings.length})
                                        </h4>
                                        {compliance.warnings.map((w, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    background: '#fffbeb',
                                                    border: 'none',
                                                    borderLeft: '3px solid #f59e0b',
                                                    padding: 8,
                                                    marginBottom: 6,
                                                    borderRadius: 4,
                                                    fontSize: 11,
                                                }}
                                            >
                                                <strong style={{ color: '#d97706' }}>{w.type || 'Note'}</strong>
                                                <div style={{ marginTop: 2, color: '#92400e' }}>{w.message}</div>
                                                {w.suggestion && (
                                                    <div style={{ marginTop: 4, fontStyle: 'italic', color: '#b45309' }}>
                                                        💡 {w.suggestion}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* AI TIPS */}
                                {compliance.isCompliant && (
                                    <div
                                        style={{
                                            background: '#e0f2fe',
                                            border: '1px solid #0284c7',
                                            borderRadius: 6,
                                            padding: 10,
                                            marginBottom: 12,
                                        }}
                                    >
                                        <strong style={{ color: '#0c4a6e', fontSize: 12 }}>✨ AI Tips for Better Performance</strong>
                                        <ul style={{ margin: '6px 0 0 0', paddingLeft: 16, fontSize: 11, color: '#0c4a6e' }}>
                                            <li>Product placement is optimized for eye flow</li>
                                            <li>Color contrast ensures readability on mobile</li>
                                            <li>Text size is ideal for social feeds</li>
                                        </ul>
                                    </div>
                                )}

                                {/* NO ISSUES */}
                                {(!compliance.violations || compliance.violations.length === 0) &&
                                    (!compliance.warnings || compliance.warnings.length === 0) && (
                                        <div
                                            style={{
                                                background: '#f0fdf4',
                                                border: '1px solid #15803d',
                                                borderRadius: 6,
                                                padding: 10,
                                                textAlign: 'center',
                                                fontSize: 12,
                                                color: '#15803d',
                                            }}
                                        >
                                            ✅ All checks passed. Creative is ready!
                                        </div>
                                    )}
                            </>
                        ) : (
                            <div
                                style={{
                                    background: '#f3f4f6',
                                    borderRadius: 6,
                                    padding: 12,
                                    textAlign: 'center',
                                    fontSize: 12,
                                    color: '#6b7280',
                                }}
                            >
                                <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                                <div>
                                    <strong>No Check Yet</strong>
                                    <div style={{ marginTop: 6, fontSize: 11 }}>
                                        Upload image, add headline, then click "Check Compliance"
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <footer
                style={{
                    borderTop: '1px solid #e5e7eb',
                    marginTop: 40,
                    padding: '16px 24px',
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: 12,
                }}
            >
                <p style={{ margin: 0 }}>
                    CreativeForge AI © 2025 | Powered by React + Flask + OpenAI GPT-4V
                </p>
            </footer>
        </div>
    );
}

export default App;