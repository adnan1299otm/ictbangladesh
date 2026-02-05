
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

const getClient = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) throw new Error("API Key is missing. Please check VITE_GEMINI_API_KEY in .env.local or Vercel settings.");
  return new GoogleGenAI({ apiKey: key });
};

export interface AIResponse {
  text: string;
  sources?: { uri: string; title: string }[];
}

/**
 * AI Response Generation with Search Grounding
 * Optimized for professional and balanced information delivery.
 */
export const generateAIResponse = async (
  prompt: string,
  history: { role: string; parts: any[] }[],
  systemInstruction: string,
  imageData?: { data: string; mimeType: string }
): Promise<AIResponse> => {
  // Use gemini-2.5-flash for high-quality responses and speed
  // Use gemini-1.5-flash for broad compatibility and speed
  const modelName = 'gemini-1.5-flash';

  const config: any = {
    systemInstruction,
    temperature: 0.3,
    // tools: [{ googleSearch: {} }], // Temporarily disabling search to verify basic connectivity if standard key fails
  };

  const userParts: any[] = [{ text: prompt }];
  if (imageData) {
    userParts.push({
      inlineData: {
        data: imageData.data,
        mimeType: imageData.mimeType
      }
    });
  }

  try {
    const ai = getClient();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: [
        ...history,
        { role: 'user', parts: userParts }
      ],
      config,
    });

    const text = response.text || "I'm here to help. Could you please clarify your request?";

    // Extract grounding sources
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title)
      .map((web: any) => ({ uri: web.uri, title: web.title })) || [];

    return { text, sources };
  } catch (error: any) {
    console.error(`Gemini Error:`, error);
    if (error.message.includes("API Key is missing")) {
      return { text: "System Error: API Key is missing. Please configure VITE_GEMINI_API_KEY in your Vercel settings." };
    }
    if (imageData) {
      return { text: "Sorry, I cannot analyze this image right now. Please try again later." };
    }
    return { text: "Sorry, I am unable to process your request at the moment. Please try again later or contact our support hotline." };
  }
};

/**
 * Audio Transcription
 */
export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Audio, mimeType } },
          { text: "Transcribe accurately. Return only the transcript text." }
        ]
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Transcription Error:", error);
    return "";
  }
};

/**
 * Text-to-Speech
 */
export const generateSpeech = async (text: string): Promise<string | undefined> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [{ text }] }],
      // config: { ... } // TTS configuration might need adjustment for specific models
    });
    // Placeholder return as standard models might not support direct TTS in this SDK version immediately
    // or return structure differs. For now, we return undefined to prevent crashes.
    return undefined;
  } catch (error) {
    console.error("TTS Error:", error);
    return undefined;
  }
};
