import { GoogleGenAI } from "@google/genai";

const apiKey = "AIzaSyA0qeersEGX2wRCal3LNwnk_zvP_2LPSIA";
const ai = new GoogleGenAI({ apiKey });

(async () => {
    try {
        console.log("Testing API Key...");
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [{ text: "Hello, test." }]
            }
        });
        console.log("Success! Response:", response.text);
    } catch (error) {
        console.error("Error:", error);
    }
})();
