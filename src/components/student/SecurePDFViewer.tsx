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
}

const SecurePDFViewer: React.FC<SecurePDFViewerProps> = ({ url, onLoadSuccess, currentPage, hideToolbar = false }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.2);
    const [error, setError] = useState<string | null>(null);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const [loadProgress, setLoadProgress] = useState(0);
    const [documentLoaded, setDocumentLoaded] = useState(false);

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
        <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            background: '#0f172a',
            overflow: 'hidden',
            userSelect: 'none',
            position: 'relative'
        }}>
            
            {/* Control Bar */}
            {!hideToolbar && (
            <div style={{ 
                padding: '0.75rem 2rem', 
                background: 'rgba(15, 23, 42, 0.95)', 
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px' }}>
                        <button 
                            onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                            style={{ background: 'none', border: 'none', color: 'white', padding: '8px', cursor: 'pointer' }}
                        >
                            <ZoomOut size={18} />
                        </button>
                        <button 
                            onClick={() => setScale(s => Math.min(3, s + 0.1))}
                            style={{ background: 'none', border: 'none', color: 'white', padding: '8px', cursor: 'pointer' }}
                        >
                            <ZoomIn size={18} />
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <button 
                        disabled={pageNumber <= 1}
                        onClick={() => changePage(-1)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '10px', cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <div style={{ color: 'white', fontWeight: 800, fontSize: '0.9rem', minWidth: '80px', textAlign: 'center' }}>
                        PAGE {pageNumber} / {numPages || '--'}
                    </div>
                    <button 
                        disabled={pageNumber >= (numPages || 1)}
                        onClick={() => changePage(1)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '10px', cursor: pageNumber >= (numPages || 1) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                    <Shield size={14} />
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Virtual Teaching Link</span>
                </div>
            </div>
            )}

            {/* Content Area with Swipe/Fade Effect */}
            <div style={{ 
                flex: 1, 
                overflow: 'auto', 
                padding: '2rem', 
                display: 'flex', 
                justifyContent: 'center',
                background: '#020617',
                position: 'relative'
            }}>
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
                `}</style>

                {error ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginTop: '10rem', textAlign: 'center', maxWidth: '400px' }}>
                        <Shield size={48} color="#ef4444" />
                        <h4 style={{ color: 'white', margin: 0, fontWeight: 900 }}>Synchronization Fault</h4>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{error}</p>
                    </div>
                ) : blobUrl ? (
                    <>
                        {showLoader && (
                            <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#020617' }}>
                                <div style={{
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    backdropFilter: 'blur(16px)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '24px',
                                    padding: '3rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '2rem',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(16, 185, 129, 0.1)',
                                    maxWidth: '400px',
                                    width: '100%'
                                }}>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', inset: -10, background: 'rgba(16, 185, 129, 0.2)', borderRadius: '50%', filter: 'blur(12px)', animation: 'pulseGlow 2s infinite' }}></div>
                                        <div style={{ width: '70px', height: '70px', background: 'rgba(16, 185, 129, 0.1)', border: '1.5px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                            <Shield size={32} color="#10b981" />
                                            <Loader2 size={16} color="white" className="animate-spin" style={{ position: 'absolute', bottom: -6, right: -6, background: '#0f172a', borderRadius: '50%' }} />
                                        </div>
                                    </div>

                                    <div style={{ width: '100%' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <span style={{ color: 'white', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.02em' }}>
                                                Architecting Secure View...
                                            </span>
                                            <span style={{ color: '#10b981', fontWeight: 900, fontSize: '0.95rem' }}>
                                                {loadProgress}%
                                            </span>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }}>
                                            <div style={{ 
                                                width: `${loadProgress}%`, 
                                                height: '100%', 
                                                background: 'linear-gradient(90deg, #059669 0%, #10b981 50%, #34d399 100%)', 
                                                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                                                borderRadius: '100px',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 0, left: 0, bottom: 0, right: 0,
                                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                                                    animation: 'shimmer 2s infinite'
                                                }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <style>{`
                                    @keyframes shimmer {
                                        0% { transform: translateX(-100%); }
                                        100% { transform: translateX(200%); }
                                    }
                                    @keyframes pulseGlow {
                                        0%, 100% { opacity: 1; transform: scale(1); }
                                        50% { opacity: 0.6; transform: scale(1.1); }
                                    }
                                `}</style>
                            </div>
                        )}

                        <div className={`pdf-page-container ${isAnimating ? 'pdf-animating' : ''}`} style={{ opacity: showLoader ? 0 : 1, transition: 'opacity 0.6s ease' }}>
                            <Document
                                file={blobUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                onLoadError={onDocumentLoadError}
                                onLoadProgress={({ loaded, total }) => {
                                    if (total) {
                                        // Scale download progress to max 90% so the user waits for parsing
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
