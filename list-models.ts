import { GoogleGenAI } from "@google/genai";

const apiKey = "AIzaSyA0qeersEGX2wRCal3LNwnk_zvP_2LPSIA";
const ai = new GoogleGenAI({ apiKey });

(async () => {
    try {
        console.log("Listing models...");
        // @google/genai SDK listing models might differ, trying standard GET request to be sure
        // Using fetch because sometimes SDK methods for listing aren't obvious in quick documentation
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach((m: any) => console.log(`- ${m.name} (${m.displayName})`));
        } else {
            console.log("No models found or error:", data);
            // Fallback to SDK if I can find the method, but fetch is reliable for REST API
        }

    } catch (error) {
        console.error("Error:", error);
    }
})();
