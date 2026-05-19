import { useState, useRef, useCallback, useEffect } from 'react';
import { loadPdf, extractPdfPageText } from './pdfTextExtractor';

const SERVERLESS_FUNCTION_ENDPOINT = "/api/chat";
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
  

        try {
            const pdf = await loadPdf(pdfUrl);
            const totalPages = pdf.numPages;
            const chunkSize = 10; // Process in manageable chunks to allow high detail
            let accumulatedFullText = '';
            let accumulatedExplanations: AIExplanation[] = [];

            setState('summarizing');

            for (let startPage = 1; startPage <= totalPages; startPage += chunkSize) {
                const endPage = Math.min(startPage + chunkSize - 1, totalPages);
                
                let chunkText = '';
                for (let i = startPage; i <= endPage; i++) {
                    const pageText = await extractPdfPageText(pdf, i);
                    const safeText = pageText.substring(0, 3000); // More text per page
                    chunkText += `[PAGE ${i} START]\n${safeText}\n[PAGE ${i} END]\n\n`;
                }
                accumulatedFullText += chunkText;

                const prompt = `CRITICAL GOAL: You are a Virtual Tutor creating detailed lesson sections for pages ${startPage} to ${endPage} of a ${totalPages}-page document.
                
                Instructional Guidelines:
                1. DETAIL: Provide a rich, educational summary for EACH page in this chunk.
                2. FORMAT: Every page MUST use this EXACT format: SECTION TITLE: [Topic] | PAGE: [Int] | CONTENT: [Detailed Explanation]
                3. FIDELITY: Maintain high factual accuracy.
                
                Document Content (Pages ${startPage}-${endPage}):
                ${chunkText}`;

                const response = await fetch(SERVERLESS_FUNCTION_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: MODEL_NAME,
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.1,
                        max_tokens: 4096
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`AI Intelligence Error (${response.status}): ${errorData.error?.message || 'Server busy'}`);
                }

                const data = await response.json();
                const rawResponse = data.choices[0].message.content;

                const sections = rawResponse.split(/SECTION TITLE:/i).filter((s: string) => s.trim().length > 0);
                const chunkExplanations: AIExplanation[] = sections.map((s: string) => {
                    const parts = s.split('|');
                    const title = parts[0]?.trim() || 'Concept Summary';
                    const pagePart = parts[1]?.toLowerCase().replace('page:', '').trim() || '1';
                    const content = parts[2]?.replace('CONTENT:', '').trim() || s.trim();

                    return { title, content, page: parseInt(pagePart) || startPage };
                });

                accumulatedExplanations = [...accumulatedExplanations, ...chunkExplanations];
                
                // Incremental update so the user sees progress and can start listening
                setExplanations([...accumulatedExplanations]);
                explanationsRef.current = [...accumulatedExplanations];
                setFullText(accumulatedFullText);
            }

            setState('ready');

        } catch (err: any) {
            console.error('Core Intelligence failure:', err);
            setError(err.message || 'Brain connection lost.');
            setState('error');
        }
    };

    const askQuestion = async (question: string) => {
        try {

            
            const response = await fetch(SERVERLESS_FUNCTION_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: MODEL_NAME,
                    messages: [
                        { role: 'system', content: "You are the Layos Virtual Tutor. Answer clearly based on document context." },
                        { role: 'user', content: `Context: ${fullText.substring(0, 5000)}\n\nQuestion: ${question}` }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`AI Tutor busy (${response.status}): ${errorData.error?.message || 'Check connection'}`);
            }
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
