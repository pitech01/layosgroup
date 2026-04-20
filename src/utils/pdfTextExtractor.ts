import * as pdfjs from 'pdfjs-dist';
import JSZip from 'jszip';

// Configure the pdf.js worker using Vite's local loader
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

// @ts-ignore
const API_BASE = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000/api';
// @ts-ignore
const IS_DEV = (import.meta as any).env.DEV;

/**
 * Build a proxy URL for the given remote PDF url.
 * - In dev: uses the Vite dev-server proxy (no backend required, instant CORS bypass)
 * - In production: uses the Laravel /api/pdf-proxy backend route
 */
export function buildProxyUrl(remoteUrl: string): string {
  if (!remoteUrl) return '';
  
  let finalUrl = remoteUrl;
  
  // Normalize internal backend paths often found in database records
  if (finalUrl.includes('backend/storage/app/public/')) {
      finalUrl = finalUrl.replace('backend/storage/app/public/', 'storage/');
  } else if (finalUrl.includes('storage/app/public/')) {
      finalUrl = finalUrl.replace('storage/app/public/', 'storage/');
  }

  // If the URL is relative (e.g. storage/...) prepend the production backend URL
  if (!finalUrl.startsWith('http')) {
      const base = API_BASE.replace('/api', '');
      finalUrl = `${base}/${finalUrl.startsWith('/') ? finalUrl.substring(1) : finalUrl}`;
  }

  return `${API_BASE}/pdf-proxy?url=${encodeURIComponent(finalUrl)}`;
}

/**
 * Load a PDF document and return a handle.
 */
export const loadPdf = async (remoteUrl: string) => {
  const proxyUrl = buildProxyUrl(remoteUrl);
  const loadingTask = pdfjs.getDocument({ url: proxyUrl, verbosity: 0 });
  return await loadingTask.promise;
};

/**
 * Extract text from a single PDF page with cleaning for better TTS.
 */
export const extractPdfPageText = async (pdf: any, pageNum: number): Promise<string> => {
    if (!pdf || pageNum < 1 || pageNum > pdf.numPages) return '';
    try {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        
        // SAFE ACCESS: Fix "Cannot read properties of undefined (reading '3')"
        const viewBox = page?.viewBox || [0, 0, 0, 842]; // Default A4 height if missing
        const pageHeight = viewBox?.[3] || 842;

        // Filter out potential headers/footers and noisy fragments
        const items = (content?.items || [])
            .filter((item: any) => {
                if (!item?.str || item.str.trim().length === 0) return false;
                // Filter short numbers (e.g. page numbers)
                if (/^\d+$/.test(item.str.trim()) && item.str.length < 4) return false;
                // Simple heuristic for headers/footers
                const y = item.transform?.[5] || 0;
                if (y < 20 || y > pageHeight - 20) return false;
                return true;
            })
            .map((item: any) => item.str);

        // Join and fix broken line merges (hyphenated word at end of line)
        return (items || []).join(' ')
            .replace(/-\s+/g, '') // Merge hyphenated- words
            .replace(/\s+/g, ' '); // Normalize spaces
    } catch (err) {
        console.error('[PDF Extract] Error on page', pageNum, err);
        return '';
    }
};

/**
 * Load a PPTX and return the slide handle.
 */
export const loadPptx = async (remoteUrl: string) => {
    const proxyUrl = buildProxyUrl(remoteUrl);
    const response = await fetch(proxyUrl);
    const blob = await response.blob();
    const zip = await JSZip.loadAsync(blob);
    
    // Find all slides and sort numerically
    const slideFiles = Object.keys(zip.files).filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'));
    slideFiles.sort((a,b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
    });
    return { zip, slideFiles };
};

/**
 * Extract text from a single PPTX slide.
 */
export const extractPptxSlideText = async (handle: { zip: any, slideFiles: string[] }, index: number): Promise<string> => {
    if (index < 0 || index >= handle.slideFiles.length) return '';
    const slideXml = await handle.zip.file(handle.slideFiles[index])?.async('string');
    if (!slideXml) return '';
    
    // Parse slide XML for text runs (<a:t>)
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(slideXml, "text/xml");
    const tElements = xmlDoc.getElementsByTagName("a:t");
    
    let slideText = "";
    for (let i = 0; i < tElements.length; i++) {
        slideText += tElements[i].textContent + " ";
    }
    
    return slideText.replace(/\s+/g, ' ').trim();
};
