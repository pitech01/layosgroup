import { useState, useEffect, useRef, useCallback } from 'react';
import { loadPdf, extractPdfPageText, loadPptx, extractPptxSlideText } from './pdfTextExtractor';

// Declare Puter for the hook to use
declare const puter: any;

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
      .replace(/\s\d+\s\|\s\d+\s/g, ' ') // 1 | 10 format with spaces
      .replace(/\b\d+\s\|\s\d+\b/g, '')  // 1 | 10 format
      .replace(/\s+/g, ' ')
      .replace(/([a-z])([A-Z])/g, "$1. $2") // fix merged sentences
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
export type TtsEngine = 'native' | 'ai';

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
  const [pitch, _setPitch] = useState(1.1);
  const [engine, setEngine] = useState<TtsEngine>('ai');
  const [language, setLanguage] = useState('eng');
  const [isTeachingMode, setIsTeachingMode] = useState(true); // Always on African Tone Engine

  const chunksRef       = useRef<string[]>([]);
  const voiceRef        = useRef<SpeechSynthesisVoice | null>(null);
  const rateRef         = useRef(rate);
  const pitchRef        = useRef(pitch);
  const currentIndexRef = useRef(0);
  const isPausedRef     = useRef(false);
  const isStoppedRef    = useRef(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const puterCacheRef   = useRef<Record<string, string>>({});

  voiceRef.current = selectedVoice;
  rateRef.current  = rate;
  pitchRef.current = pitch;

  // ── Puter AI "Teaching Mode" Logic ─────────────────────────────────────────
  
  const generateTeachingExplanation = async (rawText: string): Promise<string> => {
      if (!rawText) return "";
      try {
          const puterObj = (window as any).puter;
          if (!puterObj || !puterObj.ai) {
            console.warn('[AI] Puter.js AI Not Ready');
            return rawText;
          }
          
          const shortText = rawText.slice(0, 1500); 
          console.log('[AI] Generating Teaching Content...');

          // Promise with Timeout to prevent "Infinite Loading"
          const chatPromise = puterObj.ai.chat(`
            You are a friendly African teacher.
            Explain this lesson in a simple, human way.
            Lesson:
            ${shortText}
          `);

          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('AI Request Timeout')), 4000)
          );

          const response: any = await Promise.race([chatPromise, timeoutPromise]);
          const teachingContent = response?.message?.content || response?.toString() || rawText;
          
          return teachingContent;
      } catch (err) {
          console.error('[Puter AI] Chat Error/Timeout:', err);
          return rawText; // SILENT FALLBACK to original text
      }
  };

  const speakWithPuter = async (text: string): Promise<boolean> => {
      if (!text || typeof text !== 'string') return false;

      try {
          const puterObj = (window as any).puter;
          if (!puterObj || !puterObj.ai || !puterObj.ai.txt2speech) {
              console.warn('[Puter TTS] AI not available on window.puter');
              return false;
          }
          
          console.log('[Puter TTS] Converting to neural speech...');
          
          // Promise with Timeout to avoid hang on auth popup
          const ttsPromise = puterObj.ai.txt2speech(text, {
              voice: "Ayanda",
              engine: "neural",
              language: "en-ZA"
          });

          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('TTS Engine Timeout')), 4000)
          );

          const audio: any = await Promise.race([ttsPromise, timeoutPromise]);

          if (currentAudioRef.current) {
              currentAudioRef.current.pause();
              currentAudioRef.current = null;
          }

          if (audio && typeof audio.play === 'function') {
              currentAudioRef.current = audio;
              audio.onended = () => {
                  if (!isStoppedRef.current && !isPausedRef.current) {
                      setTtsState('done');
                  }
              };
              audio.play();
              setTtsState('playing');
              setCurrentChunkText(text);
              return true;
          }
          return false;
      } catch (err) {
          console.error('[Puter TTS] Neural Error/Timeout:', err);
          return false; // Triggers Native Fallback
      }
  };

  // ── Native Fallback ─────────────────────────────────────────────────────────

  const speakAtNative: (index: number) => Promise<void> = useCallback(async (index: number) => {
    if (isStoppedRef.current || isPausedRef.current) return;
    
    const chunks = chunksRef.current;
    if (!chunks || index >= chunks.length) {
      setTtsState('done');
      return;
    }

    currentIndexRef.current = index;
    const rawText = chunks[index];
    if (!rawText) return;
    
    const utterance = new SpeechSynthesisUtterance(rawText);
    utterance.rate  = rateRef.current;
    utterance.pitch = pitchRef.current;
    if (voiceRef.current) utterance.voice = voiceRef.current;

    utterance.onstart = () => {
      if (isStoppedRef.current) return;
      setTtsState('playing');
      setCurrentChunk(index + 1);
      setCurrentChunkText(rawText);
    };

    utterance.onend = () => {
      if (isStoppedRef.current || isPausedRef.current) return;
      setTimeout(() => speakAtNative(index + 1), 350);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // ── Main Launch Logic ───────────────────────────────────────────────────────

  const loadAndPlay = useCallback(async (fileUrl: string, fileName?: string) => {
    if (!fileUrl) return;
    
    window.speechSynthesis.cancel();
    if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
    }

    isStoppedRef.current = false;
    isPausedRef.current  = false;
    currentIndexRef.current = 0;
    setTtsState('extracting');
    setTtsError('');
    setCurrentChunk(0);
    setIndexingProgress(0);

    try {
      const check = isNarratableUrl(fileUrl, fileName);
      if (!check?.any) {
        setTtsState('error');
        setTtsError('Format not supported (Only PDF/PPTX)');
        return;
      }

      let fullRawText = '';
      if (check.isPdf) {
        const pdf = await loadPdf(fileUrl).catch(e => { throw new Error('PDF failed to load or proxy blocked'); });
        if (!pdf) throw new Error('Invalid PDF handle');
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const pageText = await extractPdfPageText(pdf, i);
          fullRawText += pageText + ' ';
          setIndexingProgress(Math.round((i / pdf.numPages) * 100));
        }
      } else {
        const ppt = await loadPptx(fileUrl).catch(e => { throw new Error('PPTX failed to load'); });
        const slideCount = ppt?.slideFiles?.length || 0;
        for (let i = 0; i < slideCount; i++) {
          const slideText = await extractPptxSlideText(ppt, i);
          fullRawText += slideText + ' ';
          setIndexingProgress(Math.round(((i + 1) / slideCount) * 100));
        }
      }

      if (!fullRawText.trim()) throw new Error('No readable text found in document');

      const cleaned = cleanLessonText(fullRawText);
      console.log('[TTS] Cleaned Raw Text:', cleaned.slice(0, 50) + '...');
      
      setTtsState('processing'); // Show "Preparing lesson..."

      // STEP 1: Generate AI Teaching Text
      const teachingText = await generateTeachingExplanation(cleaned);

      // STEP 2: Convert to Speech via Puter (Primary)
      const success = await speakWithPuter(teachingText).catch((e) => {
          console.error('[Puter TTS] Promise Error:', e);
          return false;
      });

      // STEP 3: Fallback to Native if Puter fails
      if (!success) {
          console.warn('[TTS] Puter Neural TTS failed, falling back to Native.');
          const sentences = splitIntoSentences(teachingText);
          const chunks = splitIntoChunks(sentences, 200);
          chunksRef.current = chunks;
          setTotalChunks(chunks?.length || 0);
          speakAtNative(0);
      } else {
          setTotalChunks(1);
          setCurrentChunk(1);
      }

    } catch (err: any) {
      console.error('[TTS] Preparation Error:', err);
      setTtsState('error');
      setTtsError(err.message || 'Preparation failed');
    }
  }, [speakAtNative]);

  const pause = useCallback(() => {
    isPausedRef.current = true;
    if (currentAudioRef.current) currentAudioRef.current.pause();
    else window.speechSynthesis.pause();
    setTtsState('paused');
  }, []);

  const resume = useCallback(() => {
    if (ttsState !== 'paused') return;
    isPausedRef.current = false;
    if (currentAudioRef.current) currentAudioRef.current.play();
    else if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    else speakAtNative(currentIndexRef.current);
    setTtsState('playing');
  }, [ttsState, speakAtNative]);

  const stop = useCallback(() => {
    isStoppedRef.current = true;
    if (currentAudioRef.current) { currentAudioRef.current.pause(); currentAudioRef.current = null; }
    window.speechSynthesis.cancel();
    setTtsState('idle');
  }, []);

  const restart = useCallback(() => {
    stop();
    setTimeout(() => {
        isStoppedRef.current = false;
        isPausedRef.current = false;
        // This is a bit tricky for Puter Audio object, simplifying for now
        setTtsState('idle'); 
    }, 100);
  }, [stop]);

  // Handle voice/rate/pitch state updates (for native fallback)
  useEffect(() => {
    const load = () => {
      const all = window.speechSynthesis.getVoices();
      const sorted = [...all].sort((a, b) => {
        const score = (v: SpeechSynthesisVoice) => {
          let s = 0;
          const l = v.lang.toLowerCase();
          if (l.includes('en-za')) s += 1000;
          if (v.name.toLowerCase().includes('female')) s += 500;
          if (l.includes('en-gb')) s += 200;
          return s;
        };
        return score(b) - score(a);
      });
      setAvailableVoices(sorted.slice(0, 30));
      if (!selectedVoice && sorted.length) setSelectedVoice(sorted[0]);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, [selectedVoice]);

  const progressPct = totalChunks > 0 ? Math.round((currentChunk / totalChunks) * 100) : 0;

  return {
    ttsState, ttsError, currentChunk, totalChunks, progressPct, currentChunkText,
    availableVoices, selectedVoice, setVoice: setSelectedVoice,
    rate, setRate: _setRate, pitch, setPitch: _setPitch,
    engine, setEngine, language, setLanguage,
    isTeachingMode, setIsTeachingMode,
    play: () => ttsState === 'paused' ? resume() : restart(),
    pause, resume, stop, restart, loadAndPlay,
    isIndexing: ttsState === 'extracting' || ttsState === 'processing', 
    indexingProgress
  };
}
