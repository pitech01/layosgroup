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

/**
 * CONTENT CLEANING (ANTI-HEADER FILTER)
 */
function cleanLessonText(rawText: string) {
    return rawText
      .replace(/LAYOS GROUP LLC/gi, '')
      .replace(/CONFIDENTIAL TRAINING MATERIAL/gi, '')
      .replace(/Page\s\d+\sof\s\d+/gi, '')
      .replace(/\s\d+\s\|\s\d+\s/g, ' ') 
      .replace(/\b\d+\s\|\s\d+\b/g, '')  
      .replace(/\s+/g, ' ')
      .replace(/([a-z])([A-Z])/g, "$1. $2") 
      .trim();
}

const splitIntoSentences = (text: string): string[] => {
    return text.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) || [text];
};

const splitIntoChunks = (sentences: string[], maxWords = 200): string[] => {
  const out: string[] = [];
  let current: string[] = [];
  let count = 0;

  for (const s of sentences) {
    const words = s.split(/\s+/).length;
    if (count + words > maxWords && current.length > 0) {
      out.push(current.join(' '));
      current = [s];
      count = words;
    } else {
      current.push(s);
      count += words;
    }
  }
  if (current.length > 0) out.push(current.join(' '));
  return out;
};

export const cleanVoiceName = (name: string) =>
  name.replace('Microsoft ', '').replace(' Online (Natural)', '').replace(' Desktop', '');

// ── types ─────────────────────────────────────────────────────────────────────

export type TtsState = 'idle' | 'extracting' | 'processing' | 'playing' | 'paused' | 'done' | 'error';
export type TtsEngine = 'native';

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
  pitch: number;
  setPitch: (p: number) => void;
  engine: TtsEngine;
  setEngine: (e: TtsEngine) => void;
  language: string;
  setLanguage: (l: string) => void;
  isTeachingMode: boolean;
  setIsTeachingMode: (mode: boolean) => void;
  play:        () => void;
  pause:       () => void;
  resume:      () => void;
  stop:        () => void;
  restart:     () => void;
  loadAndPlay: (url: string, name?: string) => void;
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
  const [rate, _setRate] = useState(0.9);
  const [pitch, _setPitch] = useState(1.0);
  const [engine, setEngine] = useState<TtsEngine>('native');
  const [language, setLanguage] = useState('en-ZA');
  const [isTeachingMode, setIsTeachingMode] = useState(false); 

  const chunksRef       = useRef<string[]>([]);
  const voiceRef        = useRef<SpeechSynthesisVoice | null>(null);
  const rateRef         = useRef(rate);
  const pitchRef        = useRef(pitch);
  const currentIndexRef = useRef(0);
  const isPausedRef     = useRef(false);
  const isStoppedRef    = useRef(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  voiceRef.current = selectedVoice;
  rateRef.current  = rate;
  pitchRef.current = pitch;

  // ── Voice Management ──────────────────────────────────────────────────────────

  const updateVoices = useCallback(() => {
    const list = window.speechSynthesis.getVoices();
    setAvailableVoices(list);

    const sorted = [...list].sort((a, b) => {
        let scA = 0; let scB = 0;
        if (a.lang === 'en-ZA') scA += 1000;
        if (b.lang === 'en-ZA') scB += 1000;
        if (a.name.includes('Neural') || a.name.includes('Natural')) scA += 500;
        if (b.name.includes('Neural') || b.name.includes('Natural')) scB += 500;
        return scB - scA;
    });

    if (sorted.length > 0 && !voiceRef.current) {
        setSelectedVoice(sorted[0]);
        voiceRef.current = sorted[0];
    }
  }, []);

  useEffect(() => {
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, [updateVoices]);

  // ── Native Speech Logic ───────────────────────────────────────────────────────

  const speakWithNative = async (text: string): Promise<boolean> => {
      if (!text || typeof text !== 'string') return false;
      if (!window.speechSynthesis) return false;

      window.speechSynthesis.cancel();
      
      return new Promise((resolve) => {
          const utter = new SpeechSynthesisUtterance(text);
          if (voiceRef.current) utter.voice = voiceRef.current;
          utter.rate = rateRef.current;
          utter.pitch = pitchRef.current;

          utter.onstart = () => {
              setTtsState('playing');
              setCurrentChunkText(text);
          };

          utter.onend = () => {
            if (!isStoppedRef.current && !isPausedRef.current) {
                setTtsState('done');
            }
            resolve(true);
          };

          utter.onerror = (e) => {
              console.error('[Native TTS] Error:', e);
              setTtsState('error');
              resolve(false);
          };

          window.speechSynthesis.speak(utter);
      });
  };

  // ── Lifecycle Actions ─────────────────────────────────────────────────────────

  const stop = useCallback(() => {
    isStoppedRef.current = true;
    isPausedRef.current = false;
    window.speechSynthesis.cancel();
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setTtsState('idle');
  }, []);

  const pause = useCallback(() => {
    isPausedRef.current = true;
    window.speechSynthesis.pause();
    setTtsState('paused');
  }, []);

  const resume = useCallback(() => {
    isPausedRef.current = false;
    window.speechSynthesis.resume();
    setTtsState('playing');
  }, []);

  const loadAndPlay = useCallback(async (url: string, name?: string) => {
    stop();
    setTtsState('extracting');
    setTtsError('');
    currentIndexRef.current = 0;
    isStoppedRef.current = false;

    try {
      const info = isNarratableUrl(url, name);
      let text = '';

      if (info.isPdf) {
        const pdf = await loadPdf(url);
        let extracted = '';
        const total = pdf.numPages;
        for (let i = 1; i <= total; i++) {
          const pageTxt = await extractPdfPageText(pdf, i);
          extracted += pageTxt + ' ';
          setIndexingProgress(Math.round((i / total) * 100));
        }
        text = extracted;
    } else if (info.isPpt) {
        const ppt = await loadPptx(url);
        let extracted = '';
        const total = ppt.slideFiles.length;
        for (let i = 0; i < total; i++) {
          const slideTxt = await extractPptxSlideText(ppt, i);
          extracted += slideTxt + ' ';
          setIndexingProgress(Math.round(((i + 1) / total) * 100));
        }
        text = extracted;
      } else {
          // Fallback or Image? Maybe just treat it as narratable text if provided?
          text = name || "";
      }

      if (!text || text.trim().length < 5) {
        throw new Error('This resource contains no legible text for narration.');
      }

      const cleaned = cleanLessonText(text);
      const sentences = splitIntoSentences(cleaned);
      chunksRef.current = splitIntoChunks(sentences);
      setTotalChunks(chunksRef.current.length);
      
      setCurrentChunk(1);
      await speakWithNative(chunksRef.current[0]);

    } catch (err: any) {
      console.error('[TTS Load Error]:', err);
      setTtsError(err.message || 'Failed to prepare audio.');
      setTtsState('error');
    }
  }, [stop]);

  // Public Result Object
  return {
    ttsState, ttsError, currentChunk, totalChunks,
    progressPct: totalChunks > 0 ? (currentChunk / totalChunks) * 100 : 0,
    currentChunkText, availableVoices, selectedVoice,
    setVoice: (v) => { setSelectedVoice(v); voiceRef.current = v; },
    rate, setRate: (r) => { _setRate(r); rateRef.current = r; },
    pitch, setPitch: (p) => { _setPitch(p); pitchRef.current = p; },
    engine, setEngine, 
    language, setLanguage,
    isTeachingMode, setIsTeachingMode,
    play: () => {
        if (chunksRef.current.length > 0) speakWithNative(chunksRef.current[currentIndexRef.current]);
    },
    pause, resume, stop,
    restart: () => {
        currentIndexRef.current = 0;
        setCurrentChunk(1);
        speakWithNative(chunksRef.current[0]);
    },
    loadAndPlay,
    isIndexing: ttsState === 'extracting',
    indexingProgress
  };
}
