import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Upload, Save, Move, Type, QrCode, Calendar, User, Book, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Template {
    id: number;
    course_id: number;
    template_path: string;
    name_x: number;
    name_y: number;
    course_x: number;
    course_y: number;
    date_x: number;
    date_y: number;
    cert_id_x: number;
    cert_id_y: number;
    qr_x: number;
    qr_y: number;
    qr_size: number;
    font_color: string;
    font_size: number;
}

const CertificateTemplateManager = () => {
    const { courseId } = useParams();
    const [template, setTemplate] = useState<Template | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    // UI state for positioning
    const [activeDraggable, setActiveDraggable] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    const PUBLIC_URL = API_URL.replace('/api', '/storage');

    useEffect(() => {
        fetchTemplate();
    }, [courseId]);

    const fetchTemplate = async () => {
        try {
            const res = await axios.get(`${API_URL}/instructor/courses/${courseId}/certificate-template`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setTemplate(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        
        setUploading(true);
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
            toast.success('Template uploaded successfully');
        } catch (err) {
            toast.error('Failed to upload template');
        } finally {
            setUploading(false);
        }
    };

    const handleSavePositions = async () => {
        if (!template) return;
        setSaving(true);
        try {
            await axios.put(`${API_URL}/instructor/courses/${courseId}/certificate-template/positions`, template, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Positions saved');
        } catch (err) {
            toast.error('Failed to save positions');
        } finally {
            setSaving(false);
        }
    };

    const handleMouseDown = (field: string) => {
        setActiveDraggable(field);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!activeDraggable || !containerRef.current || !template) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Constraint check
        const clampedX = Math.max(0, Math.min(100, x));
        const clampedY = Math.max(0, Math.min(100, y));

        setTemplate({
            ...template,
            [`${activeDraggable}_x`]: clampedX,
            [`${activeDraggable}_y`]: clampedY
        });
    };

    const handleMouseUp = () => {
        setActiveDraggable(null);
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Certificate Designer</h1>
                        <p className="text-slate-500 font-medium">Configure dynamic overlays for your course certificates</p>
                    </div>
                    <div className="flex gap-4">
                        <label className="cursor-pointer bg-white border-2 border-slate-200 hover:border-blue-500 transition-all rounded-xl px-4 py-2 flex items-center gap-2 font-bold text-slate-700 shadow-sm">
                            <Upload size={18} />
                            {uploading ? 'Uploading...' : 'Upload Template'}
                            <input type="file" className="hidden" accept=".jpg,.jpeg" onChange={handleUpload} disabled={uploading} />
                        </label>
                        {template && (
                            <button 
                                onClick={handleSavePositions}
                                disabled={saving}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2 flex items-center gap-2 font-black shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:bg-blue-300"
                            >
                                <Save size={18} />
                                {saving ? 'Saving...' : 'Save Design'}
                            </button>
                        )}
                    </div>
                </header>

                {!template ? (
                    <div className="bg-white border-4 border-dashed border-slate-200 rounded-3xl p-20 text-center">
                        <div className="bg-slate-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-400">
                            <Upload size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">No Template Uploaded</h2>
                        <p className="text-slate-500 max-w-md mx-auto">Upload a JPEG file to start designing the certificate layout for this course.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Designer Area */}
                        <div className="lg:col-span-3">
                            <div 
                                ref={containerRef}
                                className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-white select-none"
                                style={{ aspectRatio: '1.414/1' }}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            >
                                <img 
                                    src={`${PUBLIC_URL}/${template.template_path}`} 
                                    className="w-full h-full object-contain"
                                    draggable={false}
                                />
                                
                                {/* Draggable Overlays */}
                                <DraggableField 
                                    label="Student Name" 
                                    icon={<User size={14}/>}
                                    x={template.name_x} 
                                    y={template.name_y} 
                                    active={activeDraggable === 'name'}
                                    onMouseDown={() => handleMouseDown('name')}
                                />
                                <DraggableField 
                                    label="Course Title" 
                                    icon={<Book size={14}/>}
                                    x={template.course_x} 
                                    y={template.course_y} 
                                    active={activeDraggable === 'course'}
                                    onMouseDown={() => handleMouseDown('course')}
                                />
                                <DraggableField 
                                    label="Date of Completion" 
                                    icon={<Calendar size={14}/>}
                                    x={template.date_x} 
                                    y={template.date_y} 
                                    active={activeDraggable === 'date'}
                                    onMouseDown={() => handleMouseDown('date')}
                                />
                                <DraggableField 
                                    label="Certificate ID" 
                                    icon={<Type size={14}/>}
                                    x={template.cert_id_x} 
                                    y={template.cert_id_y} 
                                    active={activeDraggable === 'cert_id'}
                                    onMouseDown={() => handleMouseDown('cert_id')}
                                />
                                <div 
                                    className={`absolute cursor-move flex items-center justify-center border-2 border-dashed ${activeDraggable === 'qr' ? 'border-red-500 bg-red-50/50' : 'border-slate-400 bg-slate-50/50'} transition-colors`}
                                    style={{ 
                                        left: `${template.qr_x}%`, 
                                        top: `${template.qr_y}%`, 
                                        width: `${template.qr_size / 5}%`,
                                        height: `${template.qr_size / 5}%`,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                    onMouseDown={() => handleMouseDown('qr')}
                                >
                                    <QrCode size={template.qr_size / 6} className="text-slate-600" />
                                </div>
                            </div>
                            <p className="mt-4 text-slate-400 text-sm font-medium italic flex items-center gap-2">
                                <Move size={14} /> TIP: Drag the labels to position dynamic content on the certificate.
                            </p>
                        </div>

                        {/* Controls Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                                <h3 className="font-black text-slate-800 flex items-center gap-2 mb-4">
                                    <QrCode size={18} className="text-blue-500" /> QR Code Scale
                                </h3>
                                <input 
                                    type="range" min="50" max="250" 
                                    value={template.qr_size}
                                    onChange={(e) => setTemplate({...template, qr_size: parseInt(e.target.value)})}
                                    className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
                                    <span>Small</span>
                                    <span>Large</span>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                                <h3 className="font-black text-slate-800 flex items-center gap-2 mb-4">
                                    <Type size={18} className="text-blue-500" /> Typography
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Font Size</label>
                                        <input 
                                            type="number" 
                                            value={template.font_size}
                                            onChange={(e) => setTemplate({...template, font_size: parseInt(e.target.value)})}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 font-bold text-slate-700 outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Text Color</label>
                                        <div className="flex gap-2 items-center">
                                            <input 
                                                type="color" 
                                                value={template.font_color}
                                                onChange={(e) => setTemplate({...template, font_color: e.target.value})}
                                                className="w-12 h-12 rounded-xl border-2 border-slate-100 p-1 bg-white cursor-pointer"
                                            />
                                            <span className="font-mono text-sm font-bold text-slate-500">{template.font_color.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100 text-blue-800">
                                <p className="text-xs font-black uppercase mb-2 flex items-center gap-2">
                                    <CheckCircle size={14} /> Ready to Generate
                                </p>
                                <p className="text-sm font-medium leading-relaxed">
                                    Manual generation and automatic triggers for this course will now use these coordinates.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

interface DraggableProps {
    label: string;
    icon: React.ReactNode;
    x: number;
    y: number;
    active: boolean;
    onMouseDown: () => void;
}

const DraggableField = ({ label, icon, x, y, active, onMouseDown }: DraggableProps) => (
    <div 
        className={`absolute cursor-move flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 shadow-lg transition-all whitespace-nowrap ${
            active 
            ? 'bg-blue-600 border-blue-400 text-white scale-110 z-50 ring-4 ring-blue-100' 
            : 'bg-white/90 border-slate-100 text-slate-800 hover:border-blue-300 z-10'
        }`}
        style={{ 
            left: `${x}%`, 
            top: `${y}%`, 
            transform: 'translate(-50%, -50%)'
        }}
        onMouseDown={onMouseDown}
    >
        <span className={active ? 'text-white/80' : 'text-blue-500'}>{icon}</span>
        <span className="text-xs font-black">{label}</span>
    </div>
);

export default CertificateTemplateManager;
