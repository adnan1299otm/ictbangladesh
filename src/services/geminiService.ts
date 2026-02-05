import { Message } from '@/types';

export interface AIResponse {
    text: string;
    sources?: { uri: string; title: string }[];
}

export const generateAIResponse = async (
    prompt: string,
    history: any[],
    systemInstruction: string,
    imageData?: { data: string; mimeType: string }
): Promise<AIResponse> => {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                history,
                systemInstruction,
                imageData
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch AI response');
        }

        return { text: data.text, sources: [] };
    } catch (error: any) {
        console.error('Client Service Error:', error);
        throw error;
    }
};

// Placeholder for transcription and speech (can be implemented later)
export const transcribeAudio = async (base64: string, mimeType: string) => {
    return "";
};

export const generateSpeech = async (text: string) => {
    return null;
};
