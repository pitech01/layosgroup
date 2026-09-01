import { useCallback, useRef, useState } from 'react';

// Same Gemini key/model/endpoint pattern as utils/useAIPutter.ts (the PDF
// Virtual Tutor) and the mobile app's ai-tutor service, but kept as its own
// lightweight client so this general-purpose assistant doesn't depend on
// PDF-extraction state.
const GEMINI_MODEL = 'gemini-3.5-flash';

const SYSTEM_INSTRUCTION =
    "You are the Layos AI Assistant, a helpful, friendly assistant embedded in the Layos Group LLC online learning platform. " +
    'Answer clearly and concisely. Use markdown (lists, bold, code blocks) when it improves readability. ' +
    "If asked something outside your knowledge or about the student's private account data, say so honestly.";

export type ChatRole = 'user' | 'model';

export interface ChatMessage {
    role: ChatRole;
    content: string;
}

interface GeminiContentPart {
    role: ChatRole;
    parts: { text: string }[];
}

const callGemini = async (history: GeminiContentPart[]) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Missing Gemini API key in environment variables.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            contents: history,
            generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 2048,
                thinkingConfig: { thinkingBudget: 0 },
            },
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`AI Assistant busy (${response.status}): ${errorData.error?.message || 'Check connection'}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
        console.error('Gemini API error details:', data);
        throw new Error('The AI Assistant could not generate a response.');
    }
    return text as string;
};

export const useAIAssistant = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const requestIdRef = useRef(0);

    const sendMessage = useCallback(async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || isSending) return;

        const requestId = ++requestIdRef.current;
        setError(null);
        setIsSending(true);

        const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
        setMessages(nextMessages);

        try {
            const reply = await callGemini(
                nextMessages.map((m) => ({ role: m.role, parts: [{ text: m.content }] }))
            );
            if (requestId !== requestIdRef.current) return;
            setMessages((prev) => [...prev, { role: 'model', content: reply }]);
        } catch (err: any) {
            if (requestId !== requestIdRef.current) return;
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            if (requestId === requestIdRef.current) setIsSending(false);
        }
    }, [messages, isSending]);

    const clear = useCallback(() => {
        requestIdRef.current++;
        setMessages([]);
        setError(null);
        setIsSending(false);
    }, []);

    return { messages, isSending, error, sendMessage, clear };
};
