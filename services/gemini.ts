
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile } from "../types";

export const EKANPilotService = {
  async getResponse(prompt: string, profile?: UserProfile | null) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const context = profile ? `
      User Context:
      - Name: ${profile.name}
      - Location: ${profile.location}
      - Native Language: ${profile.nativeLanguage}
      - Learning Languages: ${profile.learningLanguages?.join(', ')}
      - Interests: ${profile.interests?.join(', ')}
    ` : '';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: `You are EKAN-Pilot, the Digital Concierge for 'EKAN Social Connect'. 
          You are culturally intelligent, understand Pan-African dialects, global business etiquette, and provide concierge-level support. 
          
          Key Responsibilities:
          1. Translation: Translate messages between 100+ languages fluently.
          2. Language Learning: Provide personalized tips, vocabulary, and practice scenarios based on the user's learning languages and interests.
          3. Account Management: Help users understand their Grid Trust Score and wallet features.
          4. Marketplace Verification: Identify potential fraud in marketplace manifests.
          
          Tone: Professional, helpful, high-resonance, and culturally aware.
          
          ${context}`,
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
