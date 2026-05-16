import { useState, useEffect } from 'react';
import {
    Mic2,
    Search,
    Loader2,
    AlertCircle,
    FileText,
    Play,
    X,
    LayoutDashboard,
    Eye,
    Sparkles,
    Filter,
    GraduationCap,
    PlayCircle
} from 'lucide-react';
import SecurePDFViewer from '../../../components/student/SecurePDFViewer';

export default function StudentInterviews() {
    const [interviews, setInterviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [previewAsset, setPreviewAsset] = useState<{ url: string; type: 'pdf' | 'video'; title: string } | null>(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const fetchInterviews = async () => {
        try {
            const response = await fetch(`${API_URL}/student/interviews`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setInterviews(data);
            } else {
                throw new Error(data.message || 'Failed to fetch interview materials.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInterviews();
    }, []);

    const filteredInterviews = interviews.filter(i =>
        i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-12 pb-12">
            {/* Header */}
            <header className="max-w-3xl animate-fade-in-up">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-brand-emerald/10 rounded-lg">
                        <Mic2 className="text-brand-emerald" size={18} />
                    </div>
                    <span className="text-brand-emerald font-black text-xs uppercase tracking-widest">Career Strategy</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-brand-charcoal dark:text-white tracking-tight mb-4">
                    Interview <span className="text-brand-emerald">Intelligence</span>
                </h1>
                <p className="text-brand-muted font-medium text-lg leading-relaxed">
                    Master your technical and behavioral presentations with curated materials, simulated scenarios, and instructional walkthroughs.
                </p>
            </header>

            {/* Filter / Search Bar */}
            <div className="relative max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted" size={20} />
                <input
                    type="text"
                    className="w-full h-16 pl-14 pr-6 bg-white dark:bg-brand-charcoal border border-brand-border rounded-[24px] focus:outline-none focus:ring-4 focus:ring-brand-emerald/10 focus:border-brand-emerald transition-all text-brand-charcoal dark:text-white font-bold text-base shadow-sm"
                    placeholder="Search by topic, cohort or keyword..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="animate-spin text-brand-emerald" size={48} />
                    <p className="font-black text-xs text-brand-muted uppercase tracking-[0.2em] animate-pulse">Syncing Resource Library...</p>
                </div>
            ) : error ? (
                <div className="bg-white dark:bg-brand-charcoal p-12 rounded-xl border border-red-100 dark:border-red-900/30 text-center space-y-6 shadow-xl shadow-red-500/5">
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                        <AlertCircle size={40} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Access Error</h2>
                        <p className="text-brand-muted font-medium mt-2">{error}</p>
                    </div>
                    <button 
                        onClick={fetchInterviews} 
                        className="bg-brand-emerald text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all border-none cursor-pointer shadow-xl shadow-brand-emerald/20"
                    >
                        Re-establish Connection
                    </button>
                </div>
            ) : filteredInterviews.length === 0 ? (
                <div className="bg-white dark:bg-brand-charcoal py-24 text-center rounded-xl border border-brand-border shadow-sm border-dashed">
                    <div className="w-24 h-24 bg-brand-beige dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-brand-muted/30">
                        <LayoutDashboard size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-brand-charcoal dark:text-white mb-3 uppercase tracking-tight">No Resources Found</h2>
                    <p className="text-brand-muted font-medium max-w-md mx-auto">The interview preparation repository is currently being updated for your active curriculum.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredInterviews.map((i, idx) => (
                        <div 
                            key={i.id} 
                            className="bg-white dark:bg-brand-charcoal rounded-xl border border-brand-border p-8 flex flex-col hover:shadow-2xl hover:shadow-brand-emerald/10 transition-all duration-500 group animate-fade-in-up"
                            style={{ animationDelay: `${0.1 * (idx + 1)}s` }}
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className="px-4 py-1.5 bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                    {i.cohort?.name || 'Academic Core'}
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-brand-beige dark:bg-white/5 flex items-center justify-center text-brand-muted group-hover:scale-110 transition-transform">
                                    <GraduationCap size={20} />
                                </div>
                            </div>

                            <div className="flex-1 space-y-4">
                                <h3 className="text-2xl font-black text-brand-charcoal dark:text-white tracking-tight leading-tight group-hover:text-brand-emerald transition-colors">
                                    {i.title}
                                </h3>
                                <p className="text-brand-muted text-sm font-medium leading-relaxed line-clamp-3">
                                    {i.description}
                                </p>
                            </div>
                            
                            <div className="mt-10 space-y-3">
                                {i.document_url && (
                                    <button 
                                        onClick={() => setPreviewAsset({ url: i.document_url, type: 'pdf', title: i.title })}
                                        className="w-full flex items-center gap-4 p-4 bg-brand-beige/30 dark:bg-white/5 rounded-2xl border border-brand-border hover:bg-brand-emerald hover:text-white hover:border-brand-emerald transition-all duration-300 group/item cursor-pointer text-left border-none outline-none"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center text-brand-emerald group-hover/item:text-white transition-colors shadow-sm">
                                            <FileText size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[10px] font-black uppercase tracking-widest">Strategic Brief</div>
                                            <div className="text-xs font-bold opacity-70">Instructional PDF</div>
                                        </div>
                                        <Eye size={18} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                    </button>
                                )}
                                {i.video_url && (
                                    <button 
                                        onClick={() => setPreviewAsset({ url: i.video_url, type: 'video', title: i.title })}
                                        className="w-full flex items-center gap-4 p-4 bg-brand-beige/30 dark:bg-white/5 rounded-2xl border border-brand-border hover:bg-brand-charcoal dark:hover:bg-brand-emerald hover:text-white hover:border-brand-charcoal transition-all duration-300 group/item cursor-pointer text-left border-none outline-none"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center text-brand-emerald group-hover/item:text-white transition-colors shadow-sm">
                                            <PlayCircle size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[10px] font-black uppercase tracking-widest">Video Simulation</div>
                                            <div className="text-xs font-bold opacity-70">Multimedia Stream</div>
                                        </div>
                                        <Play size={18} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Asset Previewer Modal */}
            {previewAsset && (
                <div className="fixed inset-0 z-[3000] bg-white dark:bg-brand-charcoal flex flex-col animate-in fade-in zoom-in-95 duration-300">
                    <div className="px-8 py-6 border-b border-brand-border flex justify-between items-center bg-white/80 dark:bg-brand-charcoal/80 backdrop-blur-xl shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-emerald/10 flex items-center justify-center text-brand-emerald">
                                {previewAsset.type === 'pdf' ? <FileText size={24} /> : <PlayCircle size={24} />}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">
                                    {previewAsset.title}
                                </h3>
                                <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] mt-1">
                                    Secure Career Preparation Asset
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setPreviewAsset(null)} 
                            className="bg-brand-charcoal dark:bg-brand-emerald text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-charcoal/20 transition-all active:scale-95 border-none cursor-pointer flex items-center gap-2"
                        >
                            <X size={18} strokeWidth={3} /> Close Preview
                        </button>
                    </div>

                    <div 
                        className="flex-1 relative bg-brand-beige dark:bg-brand-charcoal overflow-hidden flex items-center justify-center"
                        onContextMenu={e => e.preventDefault()}
                    >
                        {previewAsset.type === 'pdf' ? (
                            <SecurePDFViewer url={previewAsset.url} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-black">
                                {(() => {
                                    const getCleanUrl = (url: string) => {
                                        if (!url) return '';
                                        if (url.includes('mediadelivery.net')) return url;
                                        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
                                        if (url.startsWith('/storage')) return `${baseUrl}${url}`;
                                        if (url.includes('localhost:8000') || url.includes('127.0.0.1:8000')) {
                                            return url.replace(/https?:\/\/[^\/]+(?=\/storage)/, baseUrl);
                                        }
                                        return url;
                                    };
                                    
                                    const cleanUrl = getCleanUrl(previewAsset.url);
                                    
                                    return cleanUrl.includes('mediadelivery.net') ? (
                                        <iframe
                                            src={cleanUrl}
                                            loading="lazy"
                                            className="w-full h-full border-none"
                                            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                                            allowFullScreen={true}
                                        />
                                    ) : (
                                        <video 
                                            src={cleanUrl} 
                                            controls 
                                            controlsList="nodownload" 
                                            autoPlay 
                                            className="max-w-full max-h-full" 
                                        />
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
