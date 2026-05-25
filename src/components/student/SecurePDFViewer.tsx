import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, Shield } from 'lucide-react';
import { buildProxyUrl } from '../../utils/pdfTextExtractor';

// Use the exact version of pdfjs-dist that react-pdf is using to prevent version mismatch errors
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface SecurePDFViewerProps {
    url: string;
    onLoadSuccess?: () => void;
    currentPage?: number;
    hideToolbar?: boolean;
    onReachedEnd?: () => void;
}

const SecurePDFViewer: React.FC<SecurePDFViewerProps> = ({ url, onLoadSuccess, currentPage, hideToolbar = false, onReachedEnd }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(0.9);
    const [error, setError] = useState<string | null>(null);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const [loadProgress, setLoadProgress] = useState(0);
    const [documentLoaded, setDocumentLoaded] = useState(false);

    useEffect(() => {
        if (onReachedEnd && numPages !== null && pageNumber === numPages) {
            onReachedEnd();
        }
    }, [pageNumber, numPages, onReachedEnd]);

    useEffect(() => {
        if (currentPage && currentPage !== pageNumber) {
            setIsAnimating(true);
            setTimeout(() => {
                setPageNumber(currentPage);
                setIsAnimating(false);
            }, 300);
        }
    }, [currentPage]);

    useEffect(() => {
        setBlobUrl(buildProxyUrl(url));
        setLoadProgress(0);
        setDocumentLoaded(false);
    }, [url]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setLoadProgress(100);
        setTimeout(() => {
            setDocumentLoaded(true);
            setNumPages(numPages);
            setError(null);
            if (onLoadSuccess) onLoadSuccess();
        }, 400); // Give a brief moment for the 100% animation to finish visually
    }

    function onDocumentLoadError(err: Error) {
        console.error('PDF Load Error:', err);
        setError(`The secure document stream was interrupted or is unavailable. Details: ${err.message}`);
    }

    const changePage = (offset: number) => {
        const next = Math.min(Math.max(1, pageNumber + offset), numPages || 1);
        setIsAnimating(true);
        setTimeout(() => {
            setPageNumber(next);
            setIsAnimating(false);
        }, 300);
    };

    const showLoader = !documentLoaded;

    return (
        <div className="w-full h-full flex flex-col bg-slate-900 overflow-hidden select-none relative">
            
            {/* Custom Transition Keyframes Injection */}
            <style>{`
                .pdf-page-container {
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    transform: translateY(0);
                    opacity: 1;
                }
                .pdf-animating {
                    transform: translateY(20px);
                    opacity: 0;
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                @keyframes pulseGlow {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.1); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
                .animate-pulseGlow {
                    animation: pulseGlow 2s infinite;
                }
            `}</style>

            {/* Control Bar */}
            {!hideToolbar && (
                <div className="px-4 py-3 md:px-8 md:py-3 bg-slate-900/95 backdrop-blur-md border-b border-white/5 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 md:gap-0 z-10">
                    
                    {/* Zoom Tools */}
                    <div className="flex items-center gap-4 order-2 md:order-1">
                        <div className="flex bg-white/5 rounded-xl p-1">
                            <button 
                                onClick={() => setScale(s => Math.max(0.3, s - 0.1))}
                                className="bg-transparent border-none text-white p-2 cursor-pointer hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <ZoomOut size={18} />
                            </button>
                            <button 
                                onClick={() => setScale(s => Math.min(3, s + 0.1))}
                                className="bg-transparent border-none text-white p-2 cursor-pointer hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <ZoomIn size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Pagination Controllers */}
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-center order-1 md:order-2">
                        <button 
                            disabled={pageNumber <= 1}
                            onClick={() => changePage(-1)}
                            className={`bg-white/5 border-none text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                                pageNumber <= 1 ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:bg-white/10 active:scale-95'
                            }`}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        
                        <div className="color-white font-extrabold text-sm min-w-[90px] text-center tracking-wide text-white">
                            PAGE {pageNumber} <span className="text-slate-500 font-medium">/</span> {numPages || '--'}
                        </div>
                        
                        <button 
                            disabled={pageNumber >= (numPages || 1)}
                            onClick={() => changePage(1)}
                            className={`bg-white/5 border-none text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                                pageNumber >= (numPages || 1) ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:bg-white/10 active:scale-95'
                            }`}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* Status Brand Link */}
                    <div className="flex items-center gap-2 text-emerald-500 order-3 hidden sm:flex">
                        <Shield size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Virtual Teaching Link</span>
                    </div>
                </div>
            )}

            {/* Content Display Window */}
            <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center bg-slate-950 relative">
                
                {error ? (
                    <div className="flex flex-col items-center gap-4 mt-24 text-center max-w-[400px] px-4">
                        <Shield size={48} className="text-red-500" />
                        <h4 className="text-white m-0 font-black text-lg">Synchronization Fault</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
                    </div>
                ) : blobUrl ? (
                    <>
                        {/* Loading Overlay Shield */}
                        {showLoader && (
                            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 px-4">
                                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[24px] p-8 md:p-12 flex flex-col items-center gap-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] max-w-[400px] w-full">
                                    
                                    <div className="relative">
                                        <div className="absolute inset-[-10px] bg-emerald-500/20 rounded-full filter blur-md animate-pulseGlow" />
                                        <div className="w-[70px] h-[70px] bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center relative">
                                            <Shield size={32} className="text-emerald-500" />
                                            <Loader2 size={16} className="text-white animate-spin absolute bottom-[-6px] right-[-6px] bg-slate-900 rounded-full" />
                                        </div>
                                    </div>

                                    <div className="w-full">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-white font-extrabold text-sm tracking-wide">
                                                Architecting Secure View...
                                            </span>
                                            <span className="text-emerald-400 font-black text-sm">
                                                {loadProgress}%
                                            </span>
                                        </div>
                                        
                                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
                                            <div 
                                                className="h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 transition-all duration-300 ease-out rounded-full relative overflow-hidden"
                                                style={{ width: `${loadProgress}%` }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Core PDF Canvas Render Frame */}
                        <div 
                            className={`pdf-page-container ${isAnimating ? 'pdf-animating' : ''}`} 
                            style={{ opacity: showLoader ? 0 : 1, transition: 'opacity 0.6s ease' }}
                        >
                            <Document
                                file={blobUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                onLoadError={onDocumentLoadError}
                                onLoadProgress={({ loaded, total }) => {
                                    if (total) {
                                        const percentage = Math.round((loaded / total) * 90);
                                        setLoadProgress(percentage);
                                    }
                                }}
                                loading={null}
                            >
                                <Page 
                                    pageNumber={pageNumber} 
                                    scale={scale} 
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    className="shadow-2xl shadow-black/80 rounded-sm"
                                />
                            </Document>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default SecurePDFViewer;