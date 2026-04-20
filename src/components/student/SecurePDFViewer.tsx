import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, Shield } from 'lucide-react';
import { buildProxyUrl } from '../../utils/pdfTextExtractor';

// Configure worker using a reliable local source
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

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
    }, [url]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setError(null);
        if (onLoadSuccess) onLoadSuccess();
    }

    function onDocumentLoadError(err: Error) {
        console.error('PDF Load Error:', err);
        setError('The secure document stream was interrupted or is unavailable.');
    }

    const changePage = (offset: number) => {
        const next = Math.min(Math.max(1, pageNumber + offset), numPages || 1);
        setIsAnimating(true);
        setTimeout(() => {
            setPageNumber(next);
            setIsAnimating(false);
        }, 300);
    };

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
                    <div className={`pdf-page-container ${isAnimating ? 'pdf-animating' : ''}`}>
                        <Document
                            file={blobUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading={<Loader2 className="animate-spin" color="#8b5cf6" size={48} />}
                        >
                            <Page 
                                pageNumber={pageNumber} 
                                scale={scale} 
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                            />
                        </Document>
                    </div>
                ) : (
                    <Loader2 className="animate-spin" color="#8b5cf6" size={48} style={{ marginTop: '10rem' }} />
                )}
            </div>
        </div>
    );
};

export default SecurePDFViewer;
