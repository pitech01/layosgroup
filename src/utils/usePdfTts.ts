import { useState, useEffect, useRef, useCallback } from 'react';
import { loadPdf, extractPdfPageText, loadPptx, extractPptxSlideText } from './pdfTextExtractor';

// ── helpers ───────────────────────────────────────────────────────────────────

const getUrlPath = (url: string) => {
  try { return new URL(url).pathname; } catch { return url; }
};
const isNarratableUrl = (url?: string, fileName?: string) => {
  const isPdf = (url && getUrlPath(url).toLowerCase().endsWith('.pdf')) || (fileName && fileName.toLowerCase().endsWith('.pdf'));
  const isPpt = (url && url.toLowerCase().match(/\.pptx?([?#]|$)/i)) || (fileName && fileName.toLowerCase().match(/\.pptx?$/i));
  return { isPdf, isPpt, any: isPdf || isPpt };
};
const splitIntoChunks = (text: string, size = 220): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i < words.length; i += size) out.push(words.slice(i, i + size).join(' '));
  return out;
};

export const cleanVoiceName = (name: string) =>
  name.replace('Microsoft ', '').replace(' Online (Natural)', '').replace(' Desktop', '');

// ── types ─────────────────────────────────────────────────────────────────────

export type TtsState = 'idle' | 'extracting' | 'playing' | 'paused' | 'done' | 'error' | 'switching';

export interface UsePdfTtsResult {
  ttsState: TtsState;
  ttsError: string;
  currentChunk: number;
  totalChunks: number;
  progressPct: number;
  currentChunkText: string;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setVoice: (v: SpeechSynthesisVoice) => void;
  rate: number;
  setRate: (r: number) => void;
  play:        () => void;
  pause:       () => void;
  resume:      () => void;
  stop:        () => void;
  restart:     () => void;
  loadAndPlay: (url: string, name?: string, onChunk?: (i: number, t: number) => void) => void;
  cancelLoad:  () => void;
  isIndexing:  boolean;
  indexingProgress: number;
}

export function usePdfTts(): UsePdfTtsResult {
  const [ttsState, setTtsState]       = useState<TtsState>('idle');
  const [ttsError, setTtsError]       = useState('');
  const [currentChunk, setCurrentChunk] = useState(0);
  const [totalChunks, setTotalChunks]   = useState(0);
  const [currentChunkText, setCurrentChunkText] = useState('');
  const [indexingProgress, setIndexingProgress] = useState(0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice]     = useState<SpeechSynthesisVoice | null>(null);
  const [rate, _setRate] = useState(1.0);

  const chunksRef       = useRef<string[]>([]);
  const utteranceRef    = useRef<SpeechSynthesisUtterance | null>(null);
  const cancelledRef    = useRef(false);
  const isPausedRef     = useRef(false);
  const voiceRef        = useRef<SpeechSynthesisVoice | null>(null);
  const rateRef         = useRef(rate);
  const onChunkRef      = useRef<((i: number, t: number) => void) | undefined>(undefined);
  const currentIndexRef = useRef(0);
  const currentPageRef  = useRef(1);
  const totalPagesRef   = useRef(0);
  const docHandleRef    = useRef<any>(null);
  const docTypeRef      = useRef<'pdf' | 'ppt' | null>(null);
  const nextTextCacheRef = useRef<string | null>(null);

  voiceRef.current = selectedVoice;
  rateRef.current  = rate;

  // ── English voices only ───────────────────────────────────────────────────
  useEffect(() => {
    const load = () => {
      const all = window.speechSynthesis.getVoices();
      const eng = all.filter(v => v.lang.startsWith('en-'));
      const seen = new Set<string>();
      const uniq: SpeechSynthesisVoice[] = [];
      // Prefer Natural/Online voices if available
      const sorted = [...eng].sort((a, b) => (b.name.includes('Natural') ? 1 : 0) - (a.name.includes('Natural') ? 1 : 0));
      for (const v of sorted) {
        if (!seen.has(v.name)) { seen.add(v.name); uniq.push(v); }
        if (uniq.length >= 12) break; // Offer more variety
      }
      setAvailableVoices(uniq);
      if (!selectedVoice && uniq.length) {
        const preferred = uniq.find(v => v.name.includes('Natural')) || uniq[0];
        setSelectedVoice(preferred);
      }
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, [selectedVoice]);

  useEffect(() => {
    return () => { cancelledRef.current = true; window.speechSynthesis.cancel(); };
  }, []);

  const speakAt = useCallback((index: number) => {
    if (cancelledRef.current || isPausedRef.current) return;
    if (index >= chunksRef.current.length) {
      setTtsState('done');
      setCurrentChunk(chunksRef.current.length);
      setCurrentChunkText('');
      onChunkRef.current?.(chunksRef.current.length, chunksRef.current.length);
      return;
    }

    currentIndexRef.current = index;
    window.speechSynthesis.cancel();

    const text = chunksRef.current[index];
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    utterance.rate  = rateRef.current;
    utterance.pitch = 1.0;
    if (voiceRef.current) utterance.voice = voiceRef.current;

    utterance.onstart = () => {
      if (cancelledRef.current) return;
      setTtsState('playing');
      setCurrentChunk(index + 1);
      setCurrentChunkText(text);
      onChunkRef.current?.(index + 1, chunksRef.current.length);
    };

    utterance.onend = () => {
      if (cancelledRef.current || isPausedRef.current || ttsState === 'switching') return;
      speakAt(index + 1);
    };

    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      if (!cancelledRef.current) {
        setTtsState('error');
        setTtsError(`Speech error: ${e.error}`);
      }
    };

    setTimeout(() => {
      if (!cancelledRef.current && !isPausedRef.current) {
        window.speechSynthesis.speak(utterance);
      }
    }, 50);

    return new Promise<void>((resolve) => {
       utterance.onend = () => {
         if (cancelledRef.current || isPausedRef.current || ttsState === 'switching') return;
         resolve();
       };
    });
  }, [ttsState]);

  const speakTextInChunks = useCallback(async (text: string) => {
      const pageChunks = splitIntoChunks(text, 180); // Small safe chunks
      setTotalChunks(pageChunks.length);
      chunksRef.current = pageChunks;
      
      for (let i = 0; i < pageChunks.length; i++) {
          if (cancelledRef.current || isPausedRef.current) break;
          await speakAt(i);
      }
  }, [speakAt]);

  const readSequentially = useCallback(async (startPage: number) => {
      if (!docHandleRef.current) return;
      
      const total = totalPagesRef.current;
      for (let p = startPage; p <= total; p++) {
          if (cancelledRef.current || isPausedRef.current) {
              currentPageRef.current = p;
              break;
          }

          setTtsState('playing');
          currentPageRef.current = p;
          onChunkRef.current?.(p, total); // Use callback to sync scroll
          
          let text = nextTextCacheRef.current;
          if (!text) {
              text = docTypeRef.current === 'pdf' 
                ? await extractPdfPageText(docHandleRef.current, p)
                : await extractPptxSlideText(docHandleRef.current, p - 1);
          }
          nextTextCacheRef.current = null;

          // Preload next page while speaking
          if (p < total) {
              (async () => {
                 nextTextCacheRef.current = docTypeRef.current === 'pdf'
                    ? await extractPdfPageText(docHandleRef.current, p + 1)
                    : await extractPptxSlideText(docHandleRef.current, p);
              })();
          }

          await speakTextInChunks(text);
          
          if (p === total) setTtsState('done');
      }
  }, [speakTextInChunks]);

  const setVoice = useCallback((v: SpeechSynthesisVoice) => {
    setSelectedVoice(v);
    voiceRef.current = v;
    if (ttsState === 'playing') {
       window.speechSynthesis.cancel();
       readSequentially(currentPageRef.current);
    }
  }, [ttsState, readSequentially]);

  const setRate = useCallback((r: number) => {
    _setRate(r);
    rateRef.current = r;
    if (ttsState === 'playing') {
       window.speechSynthesis.cancel();
       readSequentially(currentPageRef.current);
    }
  }, [ttsState, readSequentially]);

  const loadAndPlay = useCallback(async (
    fileUrl: string,
    fileName?: string,
    onChunk?: (i: number, t: number) => void,
  ) => {
    if (!('speechSynthesis' in window)) {
      setTtsState('error');
      setTtsError('Browser not supported.');
      return;
    }
    cancelledRef.current = true;
    isPausedRef.current  = false;
    window.speechSynthesis.cancel();
    onChunkRef.current = onChunk;

    const check = isNarratableUrl(fileUrl, fileName);
    if (!check.any) {
      setTtsState('error');
      setTtsError('Format not supported for narration.');
      return;
    }

    setTtsState('extracting');
    setTtsError('');
    setCurrentChunk(0);
    setTotalChunks(0);
    setCurrentChunkText('');
    chunksRef.current = [];

    try {
      setTtsState('extracting');
      setIndexingProgress(1);

      if (check.isPdf) {
         const pdf = await loadPdf(fileUrl);
         docHandleRef.current = pdf;
         docTypeRef.current = 'pdf';
         totalPagesRef.current = pdf.numPages;
      } else {
         const ppt = await loadPptx(fileUrl);
         docHandleRef.current = ppt;
         docTypeRef.current = 'ppt';
         totalPagesRef.current = ppt.slideFiles.length;
      }

      setTotalChunks(totalPagesRef.current);
      setIndexingProgress(100);
      cancelledRef.current = false;
      readSequentially(1);
    } catch (err: any) {
      setTtsState('error');
      setTtsError('Failed to load document.');
    }
  }, [readSequentially]);

  const pause = useCallback(() => {
    if (ttsState !== 'playing') return;
    isPausedRef.current = true;
    window.speechSynthesis.pause();
    setTtsState('paused');
  }, [ttsState]);

  const resume = useCallback(() => {
    if (ttsState !== 'paused') return;
    isPausedRef.current = false;
    window.speechSynthesis.resume();
    setTtsState('playing');
  }, [ttsState]);

  const stop = useCallback(() => {
    cancelledRef.current = true;
    isPausedRef.current  = false;
    window.speechSynthesis.cancel();
    setTtsState(chunksRef.current.length ? 'done' : 'idle');
    setCurrentChunkText('');
  }, []);

  const restart = useCallback(() => {
    cancelledRef.current = false;
    isPausedRef.current = false;
    window.speechSynthesis.cancel();
    nextTextCacheRef.current = null;
    readSequentially(1);
  }, [readSequentially]);

  const play = useCallback(() => {
    cancelledRef.current = false;
    isPausedRef.current = false;
    window.speechSynthesis.cancel();
    readSequentially(currentPageRef.current || 1);
  }, [readSequentially]);

  const cancelLoad = useCallback(() => {
    cancelledRef.current = true;
    isPausedRef.current = false;
    window.speechSynthesis.cancel();
    setTtsState('idle');
    setCurrentChunk(0);
    setTotalChunks(0);
    setCurrentChunkText('');
    chunksRef.current = [];
  }, []);

  const progressPct = totalChunks > 0 ? Math.round((currentChunk / totalChunks) * 100) : 0;

  return {
    ttsState, ttsError, currentChunk, totalChunks, progressPct, currentChunkText,
    availableVoices, selectedVoice, setVoice,
    rate, setRate,
    play, pause, resume, stop, restart, loadAndPlay, cancelLoad,
    isIndexing: ttsState === 'extracting', indexingProgress
  };
}
