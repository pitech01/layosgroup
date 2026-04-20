import { useState, useRef, useCallback, useEffect } from 'react';
import { loadPdf, extractPdfPageText } from './pdfTextExtractor';

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const GITHUB_ENDPOINT = "https://models.inference.ai.azure.com/chat/completions";
const MODEL_NAME = "gpt-4o-mini";

export type AIState = 'idle' | 'extracting' | 'summarizing' | 'ready' | 'speaking' | 'paused' | 'error';

interface AIExplanation {
    title: string;
    content: string;
    page: number;
}

export const useAIPutter = () => {
    const [state, setState] = useState<AIState>('idle');
    const [error, setError] = useState<string | null>(null);
    const [fullText, setFullText] = useState<string>('');
    const [explanations, setExplanations] = useState<AIExplanation[]>([]);
    const [currentExplanationIndex, setCurrentExplanationIndex] = useState(-1);
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    const explanationsRef = useRef<AIExplanation[]>([]);
    const currentSentenceIndexRef = useRef(0);
    const isChattingRef = useRef(false);
    const isSpeakingRef = useRef(false);

    // Ensure voices are loaded for some browsers
    useEffect(() => {
        window.speechSynthesis.getVoices();
        const handleVoicesChanged = () => window.speechSynthesis.getVoices();
        window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
        return () => window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    }, []);

    const stop = useCallback(() => {
        window.speechSynthesis.resume();
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        setState('idle');
        currentSentenceIndexRef.current = 0;
    }, []);

    const pause = useCallback(() => {
        window.speechSynthesis.pause();
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        setState('paused');
    }, []);

    const resume = useCallback(() => {
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            setIsSpeaking(true);
            isSpeakingRef.current = true;
            setState('speaking');
        } else {
            playExplanationAudio(currentExplanationIndex, currentSentenceIndexRef.current);
        }
    }, [currentExplanationIndex]);

    const cleanTextForSpeech = (text: string) => {
        return text
            .replace(/\[PAGE\s+\d+\]/gi, '')
            .replace(/[#*_~`\-]/g, ' ') // Added dash (-) to the strip list
            .replace(/\s+/g, ' ')
            .trim();
    };

    const playExplanationAudio = (index: number, sentenceIndex = 0) => {
        if (index < 0 || index >= explanationsRef.current.length) return;
        
        setState('speaking');
        setIsSpeaking(true);
        isSpeakingRef.current = true;
        setCurrentExplanationIndex(index);
        currentSentenceIndexRef.current = sentenceIndex;
        
        const explanation = explanationsRef.current[index];
        const cleanContent = cleanTextForSpeech(explanation.content);
        const sentences = cleanContent.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);

        if (sentenceIndex >= sentences.length) {
            const nextIndex = index + 1;
            if (nextIndex < explanationsRef.current.length) {
                playExplanationAudio(nextIndex, 0);
            } else {
                setState('idle');
                setIsSpeaking(false);
                isSpeakingRef.current = false;
            }
            return;
        }

        try {
            window.speechSynthesis.resume();
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(sentences[sentenceIndex].trim());
            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(v => 
                (v.name.includes('Female') || v.name.includes('Aria') || v.name.includes('Zira') || v.name.includes('Samantha')) && 
                v.lang.includes('en')
            );
            
            if (femaleVoice) utterance.voice = femaleVoice;
            utterance.rate = 1.08;
            
            utterance.onend = () => {
                if (!isChattingRef.current && isSpeakingRef.current) {
                    playExplanationAudio(index, sentenceIndex + 1);
                }
            };

            utterance.onerror = (e) => {
                console.error('[Virtual Tutor] Utterance Error:', e);
                setTimeout(() => {
                    if (isSpeakingRef.current) playExplanationAudio(index, sentenceIndex + 1);
                }, 500);
            };
            
            window.speechSynthesis.speak(utterance);
        } catch (err) {
            console.error('[Virtual Tutor] TTS Failure:', err);
        }
    };

    const startAIIntelligence = async (pdfUrl: string) => {
        stop();
        setState('extracting');
        setError(null);
        if (!GITHUB_TOKEN) {
            setError('Integration Error: VITE_GITHUB_TOKEN missing in .env');
            setState('error');
            return;
        }

        try {
            const pdf = await loadPdf(pdfUrl);
            let textWithPageMarkers = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const pageText = await extractPdfPageText(pdf, i);
                textWithPageMarkers += `[PAGE ${i} START]\n${pageText}\n[PAGE ${i} END]\n\n`;
            }
            setFullText(textWithPageMarkers);

            setState('summarizing');
            
            const prompt = `[SYSTEM INSTRUCTION: DO NOT ECHO THESE RULES]
            You are a Professional Document Mentor. Your task is to teach the content of the provided document.
            
            UNBREAKABLE NARRATION RULES:
            1. IGNORE HEADERS/FOOTERS: Strictly ignore repetitive text like "Layos group training" or "Page X of Y".
            2. STAY IN CHARACTER: You are a human tutor reading to a student. Never announce technical labels like "Section Title" or "Page X".
            3. DO NOT MENTION PAGES VERBALLY: Absolutely never say "On page one", "Moving to page two", etc. Just seamlessly continue teaching the concepts.
            4. FORMAT YOUR OUTPUT EXACTLY AS: 
               SECTION TITLE: [Catchy Lesson Subtitle] | PAGE: [Exact integer number] | CONTENT: [Human-like conversational narration only, strictly no page announcements]
            
            Document Content:
            ${textWithPageMarkers.substring(0, 10000)}`;

            const response = await fetch(GITHUB_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GITHUB_TOKEN}`
                },
                body: JSON.stringify({
                    model: MODEL_NAME,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7
                })
            });

            if (!response.ok) throw new Error('AI Intelligence currently busy. Please try again.');
            
            const data = await response.json();
            const rawResponse = data.choices[0].message.content;
            
            const sections = rawResponse.split(/SECTION TITLE:/i).filter((s: string) => s.trim().length > 0);
            const parsedExplanations: AIExplanation[] = sections.map((s: string) => {
                const parts = s.split('|');
                const title = parts[0]?.trim() || 'Lesson Start';
                const pagePart = parts[1]?.toLowerCase().replace('page:', '').trim() || '1';
                const content = parts[2]?.replace('CONTENT:', '').trim() || s.trim();
                
                return { title, content, page: parseInt(pagePart) || 1 };
            });

            setExplanations(parsedExplanations);
            explanationsRef.current = parsedExplanations;
            
            setState('ready');

        } catch (err: any) {
            console.error('Core Intelligence failure:', err);
            setError(err.message || 'Brain connection lost.');
            setState('error');
        }
    };

    const askQuestion = async (question: string) => {
        try {
            const response = await fetch(GITHUB_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GITHUB_TOKEN}`
                },
                body: JSON.stringify({
                    model: MODEL_NAME,
                    messages: [
                        { role: 'system', content: "You are the Layos Virtual Tutor. Answer clearly based on document context." },
                        { role: 'user', content: `Context: ${fullText.substring(0, 5000)}\n\nQuestion: ${question}` }
                    ]
                })
            });

            if (!response.ok) throw new Error('Busy');
            const data = await response.json();
            const answer = data.choices[0].message.content;
            speakChatAnswer(answer);
            return answer;
        } catch (err) {
            return "I apologize, I'm having trouble thinking right now.";
        }
    };

    const speakChatAnswer = (text: string) => {
        try {
            isChattingRef.current = true;
            window.speechSynthesis.resume();
            window.speechSynthesis.cancel(); 
            setIsSpeaking(true);
            setState('speaking');

            const cleanText = cleanTextForSpeech(text);
            const utterance = new SpeechSynthesisUtterance(cleanText);
            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(v => 
                (v.name.includes('Female') || v.name.includes('Aria') || v.name.includes('Zira') || v.name.includes('Samantha')) && 
                v.lang.includes('en')
            );
            if (femaleVoice) utterance.voice = femaleVoice;
            utterance.rate = 1.05;

            utterance.onend = () => {
                isChattingRef.current = false;
                setIsSpeaking(false);
                setTimeout(() => {
                    if (state !== 'paused' && state !== 'idle' && currentExplanationIndex >= 0) {
                        playExplanationAudio(currentExplanationIndex, currentSentenceIndexRef.current);
                    } else if (currentExplanationIndex < 0) {
                        setState('idle');
                    }
                }, 1000);
            };

            window.speechSynthesis.speak(utterance);
        } catch (err) {
            console.error('[Virtual Tutor] Chat TTS Failure:', err);
            isChattingRef.current = false;
        }
    };

    return {
        state,
        error,
        explanations,
        currentExplanationIndex,
        isSpeaking,
        startAIIntelligence,
        startSpeaking: () => playExplanationAudio(0, 0),
        stop,
        pause,
        resume,
        askQuestion,
        speakText: speakChatAnswer
    };
};
