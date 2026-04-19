import puter from '@heyputer/puter.js';

export interface AISummaryChunk {
    originalText: string;
    summary: string;
}

export const summarizePdfText = async (text: string): Promise<AISummaryChunk[]> => {
    // Split into chunks of ~2000 characters
    const chunkSize = 2000;
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.substring(i, i + chunkSize));
    }

    const summaries: AISummaryChunk[] = [];

    for (const chunk of chunks) {
        try {
            const prompt = `You are a professional teacher. Explain the following content in a simple, engaging, and easy-to-understand way for students. Break it into clear explanations:

${chunk}`;
            const response = await puter.ai.chat(prompt);
            summaries.push({
                originalText: chunk,
                summary: response.toString(),
            });
        } catch (error) {
            console.error('AI Summarization error:', error);
            summaries.push({
                originalText: chunk,
                summary: 'Error summarizing this section.',
            });
        }
    }

    return summaries;
};

export const generateAudio = async (text: string): Promise<HTMLAudioElement> => {
    try {
        const audio = await puter.ai.txt2speech(text);
        return audio as HTMLAudioElement;
    } catch (error) {
        console.error('TTS generation error:', error);
        throw error;
    }
};

export const askQuestionAboutPdf = async (question: string, context: string): Promise<string> => {
    try {
        const prompt = `You are the Layos Virtual Tutor. Answer the student's question based only on the provided learning material.

Material:
${context}

Question:
${question}

Answer clearly and in a teaching style.`;
        const response = await puter.ai.chat(prompt);
        return response.toString();
    } catch (error) {
        console.error('AI Chat error:', error);
        return 'I am sorry, I am having trouble answering that right now.';
    }
};
