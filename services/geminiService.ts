
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Use gemini-3-flash-preview for high-quality search grounding and professional tone
  const modelName = 'gemini-3-flash-preview';
  
  const config: any = {
    systemInstruction,
    temperature: 0.4, // Balanced for professional yet natural conversation
    tools: [{ googleSearch: {} }], 
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
  } catch (error) {
    console.error(`Gemini Error:`, error);
    if (imageData) {
      return { text: "দুঃখিত, এই মুহূর্তে ছবিটি বিশ্লেষণ করা সম্ভব হচ্ছে না। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।" };
    }
    return { text: "দুঃখিত, প্রযুক্তিগত সমস্যার কারণে আমি তথ্যটি খুঁজে পাচ্ছি না। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন বা সরাসরি আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।" };
  }
};

/**
 * Audio Transcription
 */
export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Audio, mimeType } },
          { text: "Transcribe accurately. Return only the transcript text." }
        ]
      }
    });
    return response.text || "";
  } catch {
    return "";
  }
};

/**
 * Text-to-Speech
 */
export const generateSpeech = async (text: string): Promise<string | undefined> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch {
    return undefined;
  }
};
