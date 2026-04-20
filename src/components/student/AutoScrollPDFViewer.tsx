import React, { useEffect, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { Loader2 } from 'lucide-react';
import { buildProxyUrl } from '../../utils/pdfTextExtractor';

interface AutoScrollPDFViewerProps {
    url: string;
    currentPage: number;
}

const AutoScrollPDFViewer: React.FC<AutoScrollPDFViewerProps> = ({ url, currentPage }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [pdf, setPdf] = useState<any>(null);
    const [fade, setFade] = useState(false);

    // Initial Database Document Load
    useEffect(() => {
        let active = true;
        const proxyUrl = buildProxyUrl(url);

        const load = async () => {
            try {
                // Utilizing the exact same engine that powers the AI extraction!
                const loadingTask = pdfjs.getDocument({ url: proxyUrl, verbosity: 0 });
                const loadedPdf = await loadingTask.promise;
                if (active) setPdf(loadedPdf);
            } catch (err) {
                console.error("Core Engine Graphics Load Error:", err);
            }
        };
        load();

        return () => { active = false; };
    }, [url]);

    // Hardware Accelerated Page Render Logic
    useEffect(() => {
        if (!pdf || !canvasRef.current) return;
        
        let active = true;
        
        const processPageTransition = async () => {
            try {
                // Engage Smooth Fade Transition
                setFade(true);
                // Slight delay for animation physics
                await new Promise(resolve => setTimeout(resolve, 150));
                
                if (!active) return;

                const safePageNum = Math.max(1, Math.min(currentPage, pdf.numPages));
                const page = await pdf.getPage(safePageNum);
                
                if (!active || !canvasRef.current) return;

                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');
                
                if (context) {
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport,
                    };
                    
                    await page.render(renderContext).promise;
                }
            } catch (error) {
                console.error("Frame Render Fault:", error);
            } finally {
                if (active) {
                    setFade(false); // Restore visibility
                }
            }
        };

        processPageTransition();

        return () => { active = false; };
    }, [pdf, currentPage]);

    return (
        <div style={{ 
            width: '100%', 
            height: '100%', 
            overflow: 'auto', 
            background: '#020617', 
            display: 'flex', 
            justifyContent: 'center', 
            padding: '3rem',
            position: 'relative'
        }}>
            {!pdf && (
                <div style={{ position: 'absolute', top: '40%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <Loader2 className="animate-spin" color="#49BABA" size={48} />
                    <span style={{ color: '#94a3b8', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.1em' }}>INITIALIZING NATIVE GRAPHICS ENGINE...</span>
                </div>
            )}
            
            <div style={{
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: fade ? 0 : 1,
                transform: fade ? 'translateY(15px)' : 'translateY(0)',
                display: pdf ? 'block' : 'none',
                maxWidth: '100%'
            }}>
                <canvas 
                    ref={canvasRef} 
                    style={{ 
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)', 
                        maxWidth: '100%', 
                        height: 'auto',
                        background: 'white',
                        borderRadius: '4px'
                    }} 
                />
            </div>
        </div>
    );
};

export default AutoScrollPDFViewer;
