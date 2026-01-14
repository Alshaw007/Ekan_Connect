
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const EKANPilotService = {
  async getResponse(prompt: string, context?: string) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "You are EKAN-Pilot, the Digital Concierge for 'EKAN Social Connect'. You are culturally intelligent, understand Pan-African dialects, global business etiquette, and provide concierge-level support. You help users summarize feeds, draft messages in foreign languages, and identify marketplace fraud.",
          temperature: 0.7,
        },
      });
      return response.text;
    } catch (error) {
      console.error("EKAN-Pilot Error:", error);
      return "EKAN-Pilot is momentarily unavailable. I'm working to reconnect you to the world.";
    }
  },

  async translateMessage(text: string, targetLang: string = 'English') {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate this message to ${targetLang}: "${text}". Only provide the translated text.`,
      });
      return response.text;
    } catch (error) {
      return text;
    }
  },

  async transcribeAudio(dummyAudioData?: string) {
    return "Transcribed by EKAN-Pilot: [Simulated Voice-to-Text]";
  }
};
