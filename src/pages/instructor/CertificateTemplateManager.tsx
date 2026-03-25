import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Stage, Layer, Image, Text, Rect, Transformer 
} from 'react-konva';
import useImage from 'use-image';
import { 
    Upload, Save, QrCode, Calendar, User, 
    Book, Loader2, 
    Menu, X, ZoomIn, ZoomOut, Trash2,
    Plus, Type as TypeIcon,
    ChevronLeft, Palette, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Element {
    id: string;
    type: 'text' | 'qr' | 'placeholder';
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fill?: string;
    fontWeight?: string;
    align?: 'left' | 'center' | 'right';
    placeholderType?: string;
}

interface Template {
    id: number;
    course_id: number;
    template_path: string;
    template_url?: string;
    layout_json?: {
        elements: Element[];
    };
}

const KONVA_WIDTH = 1000;
const KONVA_HEIGHT = 707; 

const CertificateTemplateManager = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [template, setTemplate] = useState<Template | null>(null);
    const [elements, setElements] = useState<Element[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [showSidebar, setShowSidebar] = useState(true);
    const [zoom, setZoom] = useState(0.8);
    const [activeTab, setActiveTab] = useState<'components' | 'background'>('components');
    const stageRef = useRef<any>(null);
    const transformerRef = useRef<any>(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    const PUBLIC_URL = API_URL.replace('/api', '/storage');

    const [bgImg] = useImage(template?.template_url || (template?.template_path ? `${PUBLIC_URL}/${template.template_path}` : ''));

    useEffect(() => {
        fetchTemplate();
        if (window.innerWidth < 1280) setShowSidebar(false);
    }, [courseId]);

    useEffect(() => {
        if (selectedId && transformerRef.current) {
            const selectedNode = stageRef.current.findOne('#' + selectedId);
            if (selectedNode) {
                transformerRef.current.nodes([selectedNode]);
                transformerRef.current.getLayer().batchDraw();
            }
        }
    }, [selectedId]);

    const fetchTemplate = async () => {
        try {
            const res = await axios.get(`${API_URL}/instructor/courses/${courseId}/certificate-template`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setTemplate(res.data);
            if (res.data?.layout_json?.elements) {
                setElements(res.data.layout_json.elements);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const formData = new FormData();
        formData.append('template', e.target.files[0]);

        try {
            const res = await axios.post(`${API_URL}/instructor/courses/${courseId}/certificate-template`, formData, {
                headers: { 
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setTemplate(res.data);
            toast.success('Background updated');
        } catch (err: any) {
            toast.error('Upload failed');
        }
    };

    const handleSave = async () => {
        if (!template) return;
        setSaving(true);
        try {
            await axios.put(`${API_URL}/instructor/courses/${courseId}/certificate-template/positions`, {
                layout_json: { elements }
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Saved successfully');
        } catch (err) {
            toast.error('Save failed');
        } finally {
            setSaving(false);
        }
    };

    const addTextElement = (type: string, placeholder: string) => {
        const newEl: Element = {
            id: `el-${Date.now()}`,
            type: type === 'qr' ? 'qr' : 'placeholder',
            placeholderType: type,
            text: placeholder,
            x: 400,
            y: 300,
            width: type === 'qr' ? 120 : 300,
            height: type === 'qr' ? 120 : 60,
            rotation: 0,
            fontSize: 42,
            fontFamily: 'Outfit',
            fill: '#1e293b',
            fontWeight: 'bold',
            align: 'center'
        };
        setElements([...elements, newEl]);
        setSelectedId(newEl.id);
    };

    const updateElement = (id: string, attrs: Partial<Element>) => {
        setElements(elements.map(el => el.id === id ? { ...el, ...attrs } : el));
    };

    const handleTransformEnd = (e: any) => {
        const node = e.target;
        updateElement(selectedId!, {
            x: node.x(),
            y: node.y(),
            width: node.width() * node.scaleX(),
            height: node.height() * node.scaleY(),
            rotation: node.rotation()
        });
        node.scaleX(1);
        node.scaleY(1);
    };

    const handleDragEnd = (e: any) => {
        updateElement(e.target.id(), {
            x: e.target.x(),
            y: e.target.y()
        });
    };

    const selectedElement = elements.find(el => el.id === selectedId);

    if (loading) return (
        <div className="studio-loader">
            <div className="spinner-container">
                <Loader2 className="spinner" size={40} />
                <p>Initializing Studio...</p>
            </div>
        </div>
    );

    return (
        <div className="studio-container">
            <header className="studio-header">
                <div className="header-left">
                    <button onClick={() => navigate(-1)} className="btn-icon">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="divider"></div>
                    <div className="branding">
                        <div className="brand-title">
                            <h3>CERTIFICATE STUDIO</h3>
                            <span className="badge">PRO</span>
                        </div>
                        <p className="brand-subtitle">Design your course certificates</p>
                    </div>
                </div>

                <div className="header-actions">
                    <div className="zoom-controls">
                        <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}><ZoomOut size={16} /></button>
                        <span className="zoom-text">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(Math.min(2, zoom + 0.1))}><ZoomIn size={16} /></button>
                    </div>
                    <div className="divider"></div>
                    <button onClick={handleSave} disabled={saving} className="btn-publish">
                        {saving ? <Loader2 className="spinner" size={16} /> : <Save size={16} />}
                        PUBLISH
                    </button>
                </div>
            </header>

            <main className="studio-main">
                <aside className="tool-rail">
                    <button className={`rail-item ${activeTab === 'components' ? 'active' : ''}`} onClick={() => setActiveTab('components')}>
                        <Layers size={22} />
                        <span>FIELDS</span>
                    </button>
                    <button className={`rail-item ${activeTab === 'background' ? 'active' : ''}`} onClick={() => setActiveTab('background')}>
                        <Palette size={22} />
                        <span>STYLE</span>
                    </button>
                    <div className="spacer"></div>
                    <button className="rail-item" onClick={() => setShowSidebar(!showSidebar)}>
                        {showSidebar ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </aside>

                <aside className={`tool-panel ${showSidebar ? 'open' : 'closed'}`}>
                    {activeTab === 'components' ? (
                        <div className="panel-content">
                            <div className="panel-header">
                                <h4>COMPONENTS</h4>
                                <p>Drag these to your canvas</p>
                            </div>
                            <div className="tool-list">
                                <ToolItem icon={<User />} label="RECIPIENT NAME" sub="Student full name" onClick={() => addTextElement('name', '{{full_name}}')} />
                                <ToolItem icon={<Book />} label="COURSE TITLE" sub="The subject name" onClick={() => addTextElement('course', '{{course_title}}')} />
                                <ToolItem icon={<Calendar />} label="COMPLETION DATE" sub="Auto-filled date" onClick={() => addTextElement('date', '{{date}}')} />
                                <ToolItem icon={<TypeIcon />} label="SERIAL HASH" sub="Unique certificate ID" onClick={() => addTextElement('cert_id', '{{cert_id}}')} />
                                <ToolItem icon={<QrCode />} label="VERIFICATION QR" sub="Scan-to-verify code" onClick={() => addTextElement('qr', 'QR')} />
                            </div>
                        </div>
                    ) : (
                        <div className="panel-content">
                            <div className="panel-header">
                                <h4>BACKGROUND</h4>
                                <p>Manage your base image</p>
                            </div>
                            <div className="upload-zone">
                                {bgImg ? (
                                    <div className="bg-preview">
                                        <img src={template?.template_url || (template?.template_path ? `${PUBLIC_URL}/${template.template_path}` : '')} alt="Preview" />
                                        <label className="replace-overlay">
                                            <Upload size={18} /> REPLACE
                                            <input type="file" hidden onChange={handleUpload} />
                                        </label>
                                    </div>
                                ) : (
                                    <label className="upload-placeholder">
                                        <div className="upload-icon"><Upload size={30} /></div>
                                        <p>Click to upload base</p>
                                        <input type="file" hidden onChange={handleUpload} />
                                    </label>
                                )}
                            </div>
                        </div>
                    )}
                </aside>

                <section className="canvas-wrapper" onMouseDown={(e) => e.target === e.currentTarget && setSelectedId(null)}>
                    <div 
                        className="canvas-container"
                        style={{ 
                            width: KONVA_WIDTH, 
                            height: KONVA_HEIGHT,
                            transform: `scale(${zoom})`,
                        }}
                    >
                        <Stage 
                            width={KONVA_WIDTH} 
                            height={KONVA_HEIGHT}
                            ref={stageRef}
                            onMouseDown={(e) => e.target === e.target.getStage() && setSelectedId(null)}
                        >
                            <Layer>
                                {bgImg && <Image image={bgImg} width={KONVA_WIDTH} height={KONVA_HEIGHT} listening={false} />}
                                {elements.map((el) => (
                                    <React.Fragment key={el.id}>
                                        {el.type === 'qr' ? (
                                            <Rect
                                                id={el.id}
                                                x={el.x}
                                                y={el.y}
                                                width={el.width}
                                                height={el.height}
                                                rotation={el.rotation}
                                                fill="#ffffffcc"
                                                stroke={selectedId === el.id ? '#4f46e5' : '#e2e8f0'}
                                                strokeWidth={2}
                                                dash={selectedId === el.id ? [0, 0] : [5, 5]}
                                                cornerRadius={4}
                                                draggable
                                                onClick={() => setSelectedId(el.id)}
                                                onDragEnd={handleDragEnd}
                                                onTransformEnd={handleTransformEnd}
                                            />
                                        ) : (
                                            <Text
                                                id={el.id}
                                                x={el.x}
                                                y={el.y}
                                                width={el.width}
                                                text={el.text}
                                                fontSize={el.fontSize}
                                                fontFamily={el.fontFamily}
                                                fill={el.fill}
                                                align={el.align || 'center'}
                                                fontStyle={el.fontWeight}
                                                rotation={el.rotation}
                                                draggable
                                                onClick={() => setSelectedId(el.id)}
                                                onDragEnd={handleDragEnd}
                                                onTransformEnd={handleTransformEnd}
                                            />
                                        )}
                                        {el.type === 'qr' && (
                                            <Text 
                                                text="QR VERIFY" 
                                                x={el.x} y={el.y + el.height/2 - 5} 
                                                width={el.width} 
                                                align="center" 
                                                fontSize={10} 
                                                fontFamily="sans-serif"
                                                fontStyle="bold"
                                                fill="#64748b"
                                                listening={false}
                                            />
                                        )}
                                    </React.Fragment>
                                ))}
                                <Transformer 
                                    ref={transformerRef}
                                    rotateEnabled
                                    anchorSize={8}
                                    anchorCornerRadius={4}
                                    anchorStroke="#4f46e5"
                                    anchorFill="#ffffff"
                                    borderStroke="#4f46e5"
                                    borderStrokeWidth={1}
                                />
                            </Layer>
                        </Stage>
                    </div>
                </section>

                <aside className={`property-panel ${selectedId ? 'active' : 'hidden'}`}>
                    {selectedElement && (
                        <div className="property-content">
                            <div className="panel-header">
                                <div className="header-top">
                                    <h4>ELEMENT CONFIG</h4>
                                    <button className="btn-delete" onClick={() => { setElements(elements.filter(e => e.id !== selectedId)); setSelectedId(null); }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <p>Adjust properties below</p>
                            </div>

                            <div className="property-groups">
                                <div className="prop-group">
                                    <label>GEOMETRY</label>
                                    <div className="grid-2">
                                        <div className="mini-prop"><span>X</span>{Math.round(selectedElement.x)}</div>
                                        <div className="mini-prop"><span>Y</span>{Math.round(selectedElement.y)}</div>
                                        <div className="mini-prop"><span>W</span>{Math.round(selectedElement.width)}</div>
                                        <div className="mini-prop"><span>H</span>{Math.round(selectedElement.height)}</div>
                                    </div>
                                </div>

                                {selectedElement.type !== 'qr' && (
                                    <div className="prop-group">
                                        <label>TYPOGRAPHY</label>
                                        <select 
                                            value={selectedElement.fontFamily} 
                                            onChange={(e) => updateElement(selectedId!, { fontFamily: e.target.value })}
                                            className="input-select"
                                        >
                                            <option value="Outfit">Outfit</option>
                                            <option value="Inter">Inter</option>
                                            <option value="Montserrat">Montserrat</option>
                                            <option value="Playfair Display">Playfair</option>
                                            <option value="Great Vibes">Calligraphy</option>
                                        </select>
                                        
                                        <div className="grid-2 mt-10">
                                            <div className="input-field">
                                                <span>SIZE</span>
                                                <input type="number" value={selectedElement.fontSize} onChange={(e) => updateElement(selectedId!, { fontSize: parseInt(e.target.value) })} />
                                            </div>
                                            <div className="input-field">
                                                <span>COLOR</span>
                                                <div className="color-btn" style={{ backgroundColor: selectedElement.fill }}>
                                                    <input type="color" value={selectedElement.fill} onChange={(e) => updateElement(selectedId!, { fill: e.target.value })} />
                                                </div>
                                            </div>
                                        </div>

                                        <select 
                                            value={selectedElement.fontWeight} 
                                            onChange={(e) => updateElement(selectedId!, { fontWeight: e.target.value })}
                                            className="input-select mt-10"
                                        >
                                            <option value="normal">Normal</option>
                                            <option value="bold">Bold</option>
                                            <option value="900">Black</option>
                                            <option value="italic">Italic</option>
                                        </select>

                                        <div className="prop-group mt-10">
                                            <label>ALIGNMENT</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                                <button onClick={() => updateElement(selectedId!, { align: 'left' })} style={{ background: selectedElement.align === 'left' ? '#4f46e5' : '#f8fafc', color: selectedElement.align === 'left' ? 'white' : '#1e293b', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '10px', fontSize: '10px', fontWeight: 900, cursor: 'pointer' }}>LEFT</button>
                                                <button onClick={() => updateElement(selectedId!, { align: 'center' })} style={{ background: selectedElement.align === 'center' ? '#4f46e5' : '#f8fafc', color: selectedElement.align === 'center' ? 'white' : '#1e293b', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '10px', fontSize: '10px', fontWeight: 900, cursor: 'pointer' }}>CENTER</button>
                                                <button onClick={() => updateElement(selectedId!, { align: 'right' })} style={{ background: selectedElement.align === 'right' ? '#4f46e5' : '#f8fafc', color: selectedElement.align === 'right' ? 'white' : '#1e293b', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '10px', fontSize: '10px', fontWeight: 900, cursor: 'pointer' }}>RIGHT</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="prop-group">
                                    <label>ROTATION ({selectedElement.rotation}°)</label>
                                    <input 
                                        type="range" min="0" max="360" 
                                        value={selectedElement.rotation || 0} 
                                        onChange={(e) => updateElement(selectedId!, { rotation: parseInt(e.target.value) })}
                                        className="input-range"
                                    />
                                </div>
                            </div>
                            
                            <button className="btn-close" onClick={() => setSelectedId(null)}>CLOSE CONFIG</button>
                        </div>
                    )}
                </aside>
            </main>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&family=Inter:wght@400;700&display=swap');

                .studio-container {
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background-color: #f8fafc;
                    font-family: 'Outfit', 'Inter', sans-serif;
                    overflow: hidden;
                    position: relative;
                }

                .studio-header {
                    height: 70px;
                    background: #ffffff;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 25px;
                    z-index: 100;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.03);
                }

                .header-left, .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .divider { width: 1px; height: 30px; background: #e2e8f0; }

                .branding .brand-title { display: flex; align-items: center; gap: 10px; }
                .branding h3 { font-size: 15px; font-weight: 900; margin: 0; color: #1e293b; letter-spacing: -0.5px; }
                .branding .badge { background: #4f46e5; color: white; font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: 900; }
                .branding .brand-subtitle { font-size: 11px; color: #94a3b8; font-weight: 600; margin: 2px 0 0 0; }

                .btn-icon { background: none; border: 1px solid #e2e8f0; color: #64748b; padding: 8px; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
                .btn-icon:hover { background: #f1f5f9; color: #4f46e5; transform: translateX(-2px); }

                .zoom-controls { display: flex; align-items: center; gap: 15px; background: #f1f5f9; padding: 5px 12px; border-radius: 12px; }
                .zoom-controls button { background: none; border: none; color: #64748b; cursor: pointer; display: flex; align-items: center; }
                .zoom-controls button:hover { color: #4f46e5; }
                .zoom-text { font-size: 12px; font-weight: 900; color: #475569; width: 45px; text-align: center; font-family: monospace; }

                .btn-publish { background: #4f46e5; color: white; border: none; padding: 10px 22px; border-radius: 14px; font-weight: 900; font-size: 12px; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2); }
                .btn-publish:hover { background: #4338ca; transform: translateY(-1px); box-shadow: 0 6px 15px rgba(79, 70, 229, 0.3); }
                .btn-publish:disabled { opacity: 0.6; cursor: not-allowed; }

                .studio-main { flex: 1; display: flex; position: relative; overflow: hidden; }

                .tool-rail { width: 75px; background: #ffffff; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; align-items: center; padding: 20px 0; z-index: 90; }
                .rail-item { background: none; border: none; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; width: 100%; padding: 15px 0; transition: all 0.2s; }
                .rail-item span { font-size: 9px; font-weight: 900; }
                .rail-item:hover { color: #64748b; background: #f8fafc; }
                .rail-item.active { color: #4f46e5; background: #eff6ff; border-right: 3px solid #4f46e5; }
                .spacer { flex: 1; }

                .tool-panel { width: 320px; background: rgba(255,255,255,0.98); border-right: 1px solid #e2e8f0; transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1); z-index: 80; overflow-y: auto; }
                .tool-panel.closed { width: 0; opacity: 0; pointer-events: none; transform: translateX(-20px); }
                .panel-content { padding: 30px; min-width: 320px; }
                .panel-header { margin-bottom: 25px; }
                .panel-header h4 { font-size: 13px; font-weight: 900; color: #1e293b; margin: 0; letter-spacing: 0.5px; }
                .panel-header p { font-size: 11px; color: #94a3b8; font-weight: 600; margin: 5px 0 0 0; font-style: italic; }

                .tool-list { display: flex; flex-direction: column; gap: 12px; }
                .tool-item { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 15px; display: flex; align-items: center; gap: 15px; cursor: pointer; transition: all 0.2s; text-align: left; width: 100%; outline: none; }
                .tool-item:hover { border-color: #4f46e5; background: #f5f3ff; box-shadow: 0 4px 12px rgba(79,70,229,0.05); transform: translateY(-2px); }
                .tool-item svg { color: #4f46e5; }
                .tool-item .label { font-size: 11px; font-weight: 900; color: #1e293b; display: block; }
                .tool-item .sub { font-size: 10px; color: #94a3b8; font-weight: 500; font-style: italic; }

                .upload-zone { border: 2px dashed #e2e8f0; border-radius: 24px; padding: 30px; text-align: center; background: #f8fafc; transition: all 0.2s; }
                .upload-zone:hover { border-color: #4f46e5; background: #eff6ff; }
                .upload-placeholder { cursor: pointer; display: block; }
                .upload-icon { color: #4f46e5; margin-bottom: 15px; opacity: 0.7; }
                .upload-zone p { font-size: 12px; font-weight: 900; color: #64748b; margin: 0; }

                .bg-preview { position: relative; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .bg-preview img { width: 100%; display: block; border-radius: 12px; }
                .replace-overlay { position: absolute; inset: 0; background: rgba(79, 70, 229, 0.85); color: white; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 11px; font-weight: 900; opacity: 0; transition: 0.2s; cursor: pointer; }
                .bg-preview:hover .replace-overlay { opacity: 1; }

                .canvas-wrapper { flex: 1; background: #eff2f5; display: flex; align-items: center; justify-content: center; padding: 50px; overflow: auto; position: relative; background-image: radial-gradient(#cbd5e1 1px, transparent 1px); background-size: 24px 24px; }
                .canvas-container { background: white; box-shadow: 0 50px 100px -20px rgba(15,23,42,0.3); border: 1px solid rgba(0,0,0,0.05); transition: transform 0.1s ease; }

                .property-panel { width: 340px; background: white; border-left: 1px solid #e2e8f0; transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1); z-index: 85; }
                .property-panel.hidden { width: 0; opacity: 0; pointer-events: none; transform: translateX(20px); }
                .property-content { padding: 30px; min-width: 340px; display: flex; flex-direction: column; height: 100%; box-sizing: border-box; }
                .header-top { display: flex; align-items: center; justify-content: space-between; }
                .btn-delete { background: #fee2e2; color: #ef4444; border: none; padding: 8px; border-radius: 10px; cursor: pointer; transition: 0.2s; }
                .btn-delete:hover { background: #fecaca; transform: scale(1.1); }

                .property-groups { display: flex; flex-direction: column; gap: 35px; margin-top: 20px; flex: 1; overflow-y: auto; padding-right: 5px; }
                .prop-group label { display: block; font-size: 10px; font-weight: 900; color: #94a3b8; letter-spacing: 1px; margin-bottom: 12px; }
                .grid-2 { display: grid; grid-template-cols: 1fr 1fr; gap: 12px; }
                .mini-prop { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 12px; font-size: 12px; font-weight: 900; color: #1e293b; display: flex; justify-content: space-between; }
                .mini-prop span { color: #94a3b8; font-size: 10px; }

                .input-select { width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 12px; font-size: 13px; font-weight: 700; color: #1e293b; outline: none; cursor: pointer; transition: 0.2s; }
                .input-select:focus { border-color: #4f46e5; background: white; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }

                .input-field { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 10px 15px; position: relative; }
                .input-field span { display: block; font-size: 9px; font-weight: 900; color: #94a3b8; margin-bottom: 4px; }
                .input-field input { width: 100%; border: none; background: none; font-size: 13px; font-weight: 900; color: #1e293b; outline: none; padding: 0; border-radius: 0; }

                .color-btn { width: 100%; height: 32px; border-radius: 10px; border: 2px solid white; box-shadow: 0 0 0 1px #e2e8f0; position: relative; overflow: hidden; }
                .color-btn input { position: absolute; inset: -5px; width: 150%; height: 150%; cursor: pointer; opacity: 0; }

                .input-range { width: 100%; -webkit-appearance: none; background: #e2e8f0; height: 6px; border-radius: 10px; outline: none; margin: 15px 0; }
                .input-range::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; background: #4f46e5; border: 4px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.1); cursor: pointer; transition: 0.2s; }
                .input-range::-webkit-slider-thumb:hover { transform: scale(1.1); }

                .btn-close { width: 100%; background: #1e293b; color: white; border: none; padding: 15px; border-radius: 18px; font-weight: 900; font-size: 11px; letter-spacing: 1px; cursor: pointer; margin-top: 30px; transition: 0.2s; }
                .btn-close:hover { background: #0f172a; }

                .mt-10 { margin-top: 10px; }
                .spinner { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .studio-loader { height: 100vh; display: flex; align-items: center; justify-content: center; background: white; }
                .spinner-container { text-align: center; }
                .spinner-container p { font-size: 12px; font-weight: 900; color: #94a3b8; margin-top: 15px; letter-spacing: 2px; text-transform: uppercase; }

                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
};

const ToolItem = ({ icon, label, sub, onClick }: { icon: any, label: string, sub: string, onClick: () => void }) => (
    <button className="tool-item" onClick={onClick}>
        <div className="tool-icon">{icon}</div>
        <div className="tool-info">
            <span className="label">{label}</span>
            <span className="sub">{sub}</span>
        </div>
        <Plus size={14} style={{ marginLeft: 'auto', opacity: 0.3 }} />
    </button>
);

export default CertificateTemplateManager;
