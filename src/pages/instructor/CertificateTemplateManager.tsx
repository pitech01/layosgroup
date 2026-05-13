import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    Stage, 
    Layer, 
    Text, 
    Rect, 
    Image as KonvaImage, 
    Transformer 
} from 'react-konva';
import useImage from 'use-image';
import { 
    Type, 
    Image as ImageIcon, 
    Save, 
    Trash2, 
    Move, 
    ChevronLeft, 
    Loader2, 
    Settings, 
    Sparkles,
    ShieldCheck,
    Palette,
    Layers,
    Eye,
    Zap,
    Plus,
    X,
    Layout,
    MoreVertical,
    Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TextElement {
    id: string;
    type: 'text';
    text: string;
    x: number;
    y: number;
    fontSize: number;
    fontFamily: string;
    fill: string;
    isVariable?: boolean;
    width?: number;
    height?: number;
    rotation?: number;
}

interface ImageElement {
    id: string;
    type: 'image';
    url: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
}

type Element = TextElement | ImageElement;

const CertificateTemplateManager = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [elements, setElements] = useState<Element[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
    const [bgImage] = useImage(backgroundImage || '');
    
    const stageRef = useRef<any>(null);
    const transformerRef = useRef<any>(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/courses/${courseId}/certificate-template`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.template) {
                        setElements(data.template.elements || []);
                        setBackgroundColor(data.template.backgroundColor || '#ffffff');
                        setBackgroundImage(data.template.backgroundImage || null);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch template", error);
                toast.error("Failed to load template");
            } finally {
                setLoading(false);
            }
        };
        fetchTemplate();
    }, [courseId, API_URL]);

    useEffect(() => {
        if (selectedId && transformerRef.current) {
            const selectedNode = stageRef.current.findOne('#' + selectedId);
            if (selectedNode) {
                transformerRef.current.nodes([selectedNode]);
                transformerRef.current.getLayer().batchDraw();
            }
        }
    }, [selectedId]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/courses/${courseId}/certificate-template`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    elements,
                    backgroundColor,
                    backgroundImage
                })
            });
            if (response.ok) {
                toast.success("Template saved successfully");
            } else {
                toast.error("Failed to save template");
            }
        } catch (error) {
            toast.error("Error saving template");
        } finally {
            setIsSaving(false);
        }
    };

    const addText = () => {
        const newText: TextElement = {
            id: `text-${Date.now()}`,
            type: 'text',
            text: 'New Text Block',
            x: 100,
            y: 100,
            fontSize: 24,
            fontFamily: 'Outfit',
            fill: '#1e293b'
        };
        setElements([...elements, newText]);
        setSelectedId(newText.id);
    };

    const addVariable = (variable: string) => {
        const newText: TextElement = {
            id: `var-${Date.now()}`,
            type: 'text',
            text: `{{${variable}}}`,
            x: 100,
            y: 150,
            fontSize: 24,
            fontFamily: 'Outfit',
            fill: '#1e293b',
            isVariable: true
        };
        setElements([...elements, newText]);
        setSelectedId(newText.id);
    };

    const deleteElement = () => {
        if (selectedId) {
            setElements(elements.filter(el => el.id !== selectedId));
            setSelectedId(null);
        }
    };

    const updateElement = (id: string, updates: Partial<Element>) => {
        setElements(elements.map(el => el.id === id ? { ...el, ...updates } as any : el));
    };

    const selectedElement = elements.find(el => el.id === selectedId);

    if (loading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-6 animate-pulse">
                <div className="w-16 h-16 bg-brand-emerald/10 rounded-3xl flex items-center justify-center">
                    <Loader2 className="animate-spin text-brand-emerald" size={32} />
                </div>
                <p className="font-black text-[10px] text-brand-muted uppercase tracking-[0.4em]">Calibrating Studio...</p>
            </div>
        );
    }

    return (
        <div className="max-w-screen-2xl mx-auto space-y-8 pb-12 animate-fade-in-up">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4 lg:px-0">
                <div className="space-y-4">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="group flex items-center gap-3 text-[10px] font-black text-brand-muted hover:text-brand-emerald uppercase tracking-[0.3em] transition-all border-none bg-transparent cursor-pointer"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Curriculum
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-brand-emerald/10 rounded-xl text-brand-emerald">
                            <Palette size={20} />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">
                            Certificate <span className="text-brand-emerald">Studio</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-16 px-10 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-[24px] font-black text-xs uppercase tracking-[0.3em] flex items-center gap-4 shadow-2xl shadow-brand-charcoal/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 border-none cursor-pointer"
                    >
                        {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Persist Template</>}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Toolbar */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-brand-charcoal rounded-[40px] border border-brand-border p-8 space-y-10 shadow-xl shadow-brand-charcoal/5">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-[0.3em] px-2">Artifacts</h3>
                            <div className="space-y-3">
                                <button onClick={addText} className="w-full h-14 flex items-center gap-4 px-6 rounded-2xl bg-brand-beige/20 dark:bg-white/5 text-brand-charcoal dark:text-white hover:bg-brand-emerald hover:text-white transition-all border-none cursor-pointer group">
                                    <Type size={18} className="text-brand-emerald group-hover:text-white transition-colors" />
                                    <span className="text-xs font-black uppercase tracking-tight">Text Block</span>
                                </button>
                                <button onClick={() => addVariable('student_name')} className="w-full h-14 flex items-center gap-4 px-6 rounded-2xl bg-brand-beige/20 dark:bg-white/5 text-brand-charcoal dark:text-white hover:bg-brand-emerald hover:text-white transition-all border-none cursor-pointer group">
                                    <Sparkles size={18} className="text-brand-emerald group-hover:text-white transition-colors" />
                                    <span className="text-xs font-black uppercase tracking-tight">User Variable</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-[0.3em] px-2">Workspace</h3>
                            <div className="space-y-3">
                                <div className="p-5 bg-brand-beige/10 dark:bg-white/5 rounded-2xl border border-brand-border space-y-4">
                                    <label className="text-[9px] font-black text-brand-muted uppercase tracking-widest block">Background Hex</label>
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="color" 
                                            value={backgroundColor}
                                            onChange={(e) => setBackgroundColor(e.target.value)}
                                            className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none p-0"
                                        />
                                        <span className="text-xs font-mono font-bold uppercase">{backgroundColor}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Canvas Area */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className="bg-brand-charcoal/5 dark:bg-white/5 rounded-[60px] border-2 border-brand-border border-dashed p-10 flex items-center justify-center relative min-h-[600px] group">
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 px-6 py-2 bg-white dark:bg-brand-charcoal rounded-full border border-brand-border shadow-xl z-10 flex items-center gap-3">
                            <div className="w-2 h-2 bg-brand-emerald rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em]">Live Canvas Workspace</span>
                        </div>
                        
                        <div className="shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] rounded-sm overflow-hidden bg-white">
                            <Stage 
                                width={800} 
                                height={560} 
                                ref={stageRef}
                                onMouseDown={(e) => {
                                    if (e.target === e.target.getStage()) setSelectedId(null);
                                }}
                            >
                                <Layer>
                                    <Rect 
                                        width={800} 
                                        height={560} 
                                        fill={backgroundColor} 
                                    />
                                    {bgImage && (
                                        <KonvaImage 
                                            image={bgImage} 
                                            width={800} 
                                            height={560} 
                                        />
                                    )}
                                    {elements.map((el) => (
                                        <React.Fragment key={el.id}>
                                            {el.type === 'text' ? (
                                                <Text 
                                                    id={el.id}
                                                    {...el}
                                                    draggable
                                                    onClick={() => setSelectedId(el.id)}
                                                    onDragEnd={(e) => updateElement(el.id, { x: e.target.x(), y: e.target.y() })}
                                                />
                                            ) : (
                                                <KonvaImage 
                                                    id={el.id}
                                                    {...el}
                                                    draggable
                                                    onClick={() => setSelectedId(el.id)}
                                                    onDragEnd={(e) => updateElement(el.id, { x: e.target.x(), y: e.target.y() })}
                                                />
                                            )}
                                        </React.Fragment>
                                    ))}
                                    <Transformer 
                                        ref={transformerRef}
                                        boundBoxFunc={(oldBox, newBox) => {
                                            if (newBox.width < 5 || newBox.height < 5) return oldBox;
                                            return newBox;
                                        }}
                                    />
                                </Layer>
                            </Stage>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Properties */}
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-brand-charcoal rounded-[48px] border border-brand-border p-10 space-y-12 shadow-2xl shadow-brand-charcoal/5 sticky top-32">
                        <div className="flex items-center justify-between border-b border-brand-border pb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-brand-emerald/10 rounded-xl text-brand-emerald">
                                    <Settings size={18} />
                                </div>
                                <h3 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">Intelligence</h3>
                            </div>
                        </div>

                        {selectedElement ? (
                            <div className="space-y-10 animate-fade-in">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] px-2">Content Parameter</h4>
                                    {selectedElement.type === 'text' && (
                                        <textarea 
                                            className="w-full p-6 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[28px] focus:outline-none focus:border-brand-emerald font-bold text-sm h-32 resize-none transition-all"
                                            value={selectedElement.text}
                                            onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                                        />
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] px-2">Visual Logic</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedElement.type === 'text' && (
                                            <>
                                                <div className="p-5 bg-brand-beige/10 dark:bg-white/5 rounded-2xl border border-brand-border space-y-2">
                                                    <label className="text-[9px] font-black text-brand-muted uppercase tracking-widest block">Font Size</label>
                                                    <input 
                                                        type="number" 
                                                        className="w-full bg-transparent border-none outline-none font-black text-lg p-0"
                                                        value={selectedElement.fontSize}
                                                        onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                                                    />
                                                </div>
                                                <div className="p-5 bg-brand-beige/10 dark:bg-white/5 rounded-2xl border border-brand-border space-y-2">
                                                    <label className="text-[9px] font-black text-brand-muted uppercase tracking-widest block">Text Color</label>
                                                    <div className="flex items-center gap-3">
                                                        <input 
                                                            type="color" 
                                                            value={selectedElement.fill}
                                                            onChange={(e) => updateElement(selectedElement.id, { fill: e.target.value })}
                                                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none p-0"
                                                        />
                                                        <span className="text-[10px] font-mono font-bold uppercase">{selectedElement.fill}</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <button 
                                    onClick={deleteElement}
                                    className="w-full h-16 flex items-center justify-center gap-4 bg-red-500/10 text-red-500 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer group shadow-sm shadow-red-500/5"
                                >
                                    <Trash2 size={18} /> Redact Artifact
                                </button>
                            </div>
                        ) : (
                            <div className="py-20 text-center space-y-8 animate-fade-in">
                                <div className="w-24 h-24 bg-brand-beige dark:bg-white/5 rounded-[40px] flex items-center justify-center mx-auto text-brand-muted/30 border border-brand-border border-dashed shadow-inner">
                                    <Layers size={40} />
                                </div>
                                <div className="space-y-2 px-4">
                                    <h4 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Idle State</h4>
                                    <p className="text-xs font-medium text-brand-muted leading-relaxed">Select an artifact on the canvas to adjust its operational parameters and visual logic.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificateTemplateManager;
