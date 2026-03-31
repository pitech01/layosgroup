import * as pdfjs from 'pdfjs-dist';
import JSZip from 'jszip';

// Configure the pdf.js worker via jsDelivr CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// @ts-ignore
const API_BASE = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000/api';
// @ts-ignore
const IS_DEV = (import.meta as any).env.DEV;

/**
 * Build a proxy URL for the given remote PDF url.
 * - In dev: uses the Vite dev-server proxy (no backend required, instant CORS bypass)
 * - In production: uses the Laravel /api/pdf-proxy backend route
 */
function buildProxyUrl(remoteUrl: string): string {
  if (IS_DEV) {
    // Vite dev-server forwards /dev-pdf-proxy?url=... to S3 server-side
    return `/dev-pdf-proxy?url=${encodeURIComponent(remoteUrl)}`;
  }
  // Production: Laravel backend proxy route
  return `${API_BASE}/pdf-proxy?url=${encodeURIComponent(remoteUrl)}`;
}

/**
 * Load a PDF document and return a handle.
 */
export const loadPdf = async (remoteUrl: string) => {
  const proxyUrl = buildProxyUrl(remoteUrl);
  console.log('[TTS] Loading PDF handle:', proxyUrl);
  const loadingTask = pdfjs.getDocument({ url: proxyUrl, verbosity: 0 });
  return await loadingTask.promise;
};

/**
 * Extract text from a single PDF page.
 */
export const extractPdfPageText = async (pdf: any, pageNum: number): Promise<string> => {
  if (pageNum < 1 || pageNum > pdf.numPages) return '';
  const page = await pdf.getPage(pageNum);
  const content = await page.getTextContent();
  // @ts-ignore
  return content.items.map((item: any) => item.str).join(' ');
};

/**
 * DEPRECATED: Old full extraction method. 
 * Kept for compatibility if needed, but we prefer lazy load now.
 */
export const extractTextFromPdf = async (
  remoteUrl: string, 
  onIncremental?: (text: string, current: number, total: number) => void
): Promise<string> => {
    const pdf = await loadPdf(remoteUrl);
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const pageText = await extractPdfPageText(pdf, i);
        fullText += pageText + ' \n';
        if (onIncremental) onIncremental(pageText, i, pdf.numPages);
    }
    return fullText.trim();
};

/**
 * Load a PPTX and return the slide texts.
 */
export const loadPptx = async (remoteUrl: string) => {
    const proxyUrl = buildProxyUrl(remoteUrl);
    const response = await fetch(proxyUrl);
    const blob = await response.blob();
    const zip = await JSZip.loadAsync(blob);
    
    const slideFiles = Object.keys(zip.files).filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'));
    slideFiles.sort((a,b) => {
        const numA = parseInt(a.match(/\d+/)?.at(0) || '0');
        const numB = parseInt(b.match(/\d+/)?.at(0) || '0');
        return numA - numB;
    });
    return { zip, slideFiles };
};

/**
 * Extract text from a single PPTX slide.
 */
export const extractPptxSlideText = async (handle: { zip: JSZip, slideFiles: string[] }, index: number): Promise<string> => {
    if (index < 0 || index >= handle.slideFiles.length) return '';
    const slideXml = await handle.zip.file(handle.slideFiles[index])?.async('string');
    if (!slideXml) return '';
    const textMatches = slideXml.match(/<a:t>([^<]+)<\/a:t>/g) || [];
    return textMatches.map(m => m.replace(/<\/?a:t>/g, '')).join(' ');
};

/**
 * DEPRECATED: Old full extraction for PPTX.
 */
export const extractTextFromPptx = async (
    remoteUrl: string,
    onIncremental?: (text: string, current: number, total: number) => void
): Promise<string> => {
    const handle = await loadPptx(remoteUrl);
    let fullText = '';
    for (let i = 0; i < handle.slideFiles.length; i++) {
        const slideText = await extractPptxSlideText(handle, i);
        fullText += slideText + ' \n\n';
        if (onIncremental) onIncremental(slideText, i + 1, handle.slideFiles.length);
    }
    return fullText.trim();
};
