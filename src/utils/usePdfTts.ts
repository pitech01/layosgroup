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

const cleanText = (text: string): string => {
    return text
      .replace(/\s+/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1. $2") // fix merged sentences
      .trim();
};

const formatTextForSpeech = (text: string): string => {
    return text
      .replace(/\./g, ". ... ")
      .replace(/,/g, ", ... ")
      .replace(/\?/g, "? ... ")
      .replace(/\!/g, "! ... ");
};

const splitIntoChunks = (text: string, size = 180): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i < words.length; i += size) {
    out.push(words.slice(i, i + size).join(' '));
  }
  return out;
};

export const cleanVoiceName = (name: string) =>
  name.replace('Microsoft ', '').replace(' Online (Natural)', '').replace(' Desktop', '');

// ── types ─────────────────────────────────────────────────────────────────────

export type TtsState = 'idle' | 'extracting' | 'playing' | 'paused' | 'done' | 'error';

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
  const [rate, _setRate] = useState(0.85); // African conversational tone priority

  const chunksRef       = useRef<string[]>([]);
  const voiceRef        = useRef<SpeechSynthesisVoice | null>(null);
  const rateRef         = useRef(rate);
  const currentIndexRef = useRef(0);
  const isPausedRef     = useRef(false);
  const isStoppedRef    = useRef(false);

  voiceRef.current = selectedVoice;
  rateRef.current  = rate;

  // ── Voice Selection (Female + Natural Priority) ───────────────────────────
  useEffect(() => {
    const load = () => {
      const all = window.speechSynthesis.getVoices();
      const eng = all.filter(v => v.lang.includes("en"));
      
      const sorted = [...eng].sort((a, b) => {
        const score = (v: SpeechSynthesisVoice) => {
          let s = 0;
          const n = v.name.toLowerCase();
          const l = v.lang.toLowerCase();
          
          if (n.includes('female')) s += 100;
          if (n.includes('natural')) s += 50;
          if (n.includes('google'))  s += 30;
          if (n.includes('microsoft')) s += 30;
          if (l.includes('en-gb')) s += 20; // Closest tone to African English
          
          return s;
        };
        return score(b) - score(a);
      });

      const uniq: SpeechSynthesisVoice[] = [];
      const seen = new Set();
      for (const v of sorted) {
        if (!seen.has(v.name)) {
          seen.add(v.name);
          uniq.push(v);
        }
        if (uniq.length >= 12) break;
      }

      setAvailableVoices(uniq);
      if (!selectedVoice && uniq.length) {
        setSelectedVoice(uniq[0]);
      }
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, [selectedVoice]);

  // ── Core Speak Function ──────────────────────────────────────────────────
  const speakAt = useCallback((index: number) => {
    if (isStoppedRef.current || isPausedRef.current) return;
    if (index >= chunksRef.current.length) {
      setTtsState('done');
      setCurrentChunk(chunksRef.current.length);
      setCurrentChunkText('');
      return;
    }

    currentIndexRef.current = index;
    const rawText = chunksRef.current[index];
    const processedText = formatTextForSpeech(rawText);
    
    const utterance = new SpeechSynthesisUtterance(processedText);
    
    utterance.rate  = rateRef.current;
    utterance.pitch = 1.05; // Slight warmth
    utterance.volume = 1;
    if (voiceRef.current) utterance.voice = voiceRef.current;

    utterance.onstart = () => {
      if (isStoppedRef.current) return;
      setTtsState('playing');
      setCurrentChunk(index + 1);
      setCurrentChunkText(rawText);
    };

    utterance.onend = () => {
      if (isStoppedRef.current || isPausedRef.current) return;
      // Small pause between chunks for human-like flow
      setTimeout(() => {
          if (!isStoppedRef.current && !isPausedRef.current) {
              speakAt(index + 1);
          }
      }, 350);
    };

    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      setTtsState('error');
      setTtsError(`Speech error: ${e.error}`);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const loadAndPlay = useCallback(async (fileUrl: string, fileName?: string) => {
    if (!('speechSynthesis' in window)) {
      setTtsState('error');
      setTtsError('TTS not supported');
      return;
    }

    // Reset state
    window.speechSynthesis.cancel();
    isStoppedRef.current = false;
    isPausedRef.current  = false;
    currentIndexRef.current = 0;
    setTtsState('extracting');
    setTtsError('');
    setCurrentChunk(0);
    setIndexingProgress(0);

    const check = isNarratableUrl(fileUrl, fileName);
    if (!check.any) {
      setTtsState('error');
      setTtsError('Format not supported');
      return;
    }

    try {
      let fullText = '';
      if (check.isPdf) {
        const pdf = await loadPdf(fileUrl);
        for (let i = 1; i <= pdf.numPages; i++) {
          const pageText = await extractPdfPageText(pdf, i);
          fullText += pageText + ' ';
          setIndexingProgress(Math.round((i / pdf.numPages) * 100));
        }
      } else {
        const ppt = await loadPptx(fileUrl);
        const slideCount = ppt.slideFiles.length;
        for (let i = 0; i < slideCount; i++) {
          const slideText = await extractPptxSlideText(ppt, i);
          fullText += slideText + ' ';
          setIndexingProgress(Math.round(((i + 1) / slideCount) * 100));
        }
      }

      const cleaned = cleanText(fullText);
      const chunks = splitIntoChunks(cleaned, 160); // Smaller chunks for better responsiveness
      chunksRef.current = chunks;
      setTotalChunks(chunks.length);
      setTtsState('playing');
      speakAt(0);
    } catch (err: any) {
      setTtsState('error');
      setTtsError('Parsing failed');
    }
  }, [speakAt]);

  const pause = useCallback(() => {
    isPausedRef.current = true;
    window.speechSynthesis.pause();
    setTtsState('paused');
  }, []);

  const resume = useCallback(() => {
    if (ttsState !== 'paused') return;
    isPausedRef.current = false;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    } else {
      speakAt(currentIndexRef.current);
    }
    setTtsState('playing');
  }, [ttsState, speakAt]);

  const stop = useCallback(() => {
    isStoppedRef.current = true;
    window.speechSynthesis.cancel();
    setTtsState('idle');
    setCurrentChunk(0);
    setCurrentChunkText('');
  }, []);

  const restart = useCallback(() => {
    window.speechSynthesis.cancel();
    isStoppedRef.current = false;
    isPausedRef.current = false;
    speakAt(0);
  }, [speakAt]);

  const play = useCallback(() => {
    if (ttsState === 'paused') {
      resume();
    } else if (ttsState === 'idle' || ttsState === 'done') {
      restart();
    }
  }, [ttsState, resume, restart]);

  const setVoice = (v: SpeechSynthesisVoice) => {
    setSelectedVoice(v);
    if (ttsState === 'playing') {
      window.speechSynthesis.cancel();
      setTimeout(() => speakAt(currentIndexRef.current), 100);
    }
  };

  const setRate = (r: number) => {
    _setRate(r);
    if (ttsState === 'playing') {
      window.speechSynthesis.cancel();
      setTimeout(() => speakAt(currentIndexRef.current), 100);
    }
  };

  const progressPct = totalChunks > 0 ? Math.round((currentChunk / totalChunks) * 100) : 0;

  return {
    ttsState, ttsError, currentChunk, totalChunks, progressPct, currentChunkText,
    availableVoices, selectedVoice, setVoice,
    rate, setRate,
    play, pause, resume, stop, restart, loadAndPlay,
    isIndexing: ttsState === 'extracting', indexingProgress
  };
}
