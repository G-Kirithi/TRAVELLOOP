import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function suggestActivities(city: string, tripTheme: string = 'balanced') {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest 5 popular activities in ${city} for a trip themed as ${tripTheme}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              estimatedCost: { type: Type.NUMBER },
              description: { type: Type.STRING }
            },
            required: ["name", "category", "estimatedCost", "description"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return [];
  }
}

export async function getCityInsights(city: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide local travel insights for ${city}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            costLevel: { type: Type.STRING, description: "Budget level from $ to $$$$" },
            bestSeason: { type: Type.STRING },
            topVibe: { type: Type.STRING },
            safetyIndex: { type: Type.NUMBER, description: "Safety rating from 1 to 10" }
          },
          required: ["costLevel", "bestSeason", "topVibe", "safetyIndex"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return null;
  }
}
