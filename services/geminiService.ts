
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, GameState } from '../types';

// Generate simulated chat messages from AI users
export const generateAIBillboardChat = async (history: ChatMessage[]): Promise<ChatMessage> => {
  // Fix: Initializing GoogleGenAI inside the function as per best practices
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `You are playing a music industry simulator game. There is a global chat room.
    The current chat history is: ${history.slice(-5).map(m => `${m.user}: ${m.text}`).join('\n')}
    Generate 1 short message from a random player name (e.g. DJ_Kaleb, StarGirl99) talking about the charts, a new song, or just saying hi. Keep it casual.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            user: { type: Type.STRING },
            text: { type: Type.STRING }
          },
          required: ["user", "text"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return {
      id: `chat-${Date.now()}`,
      user: data.user,
      text: data.text,
      timestamp: Date.now(),
      isAI: true
    };
  } catch (e) {
    return { id: 'err', user: 'System', text: 'Charts are heating up!', timestamp: Date.now() };
  }
};

// Generate random weekly industry events based on the current artist state
export const getIndustryEvent = async (state: GameState) => {
  // Fix: Initializing GoogleGenAI inside the function as per best practices
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const save = state.currentSave;
  const prompt = `You are the Game Master for a Music Superstar simulator.
  Current Player: ${save?.artistName || 'Unknown'}, Fans: ${save?.fans || 0}, Money: $${save?.funds || 0}.
  Generate a random weekly event. 
  It could be: Viral TikTok trend, Scandal, Collaboration offer, Award nomination, or Equipment failure.
  Return JSON with: message, type (success, scandal, opportunity), impact (funds, fans, hype, reputation).`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          message: { type: Type.STRING },
          type: { type: Type.STRING },
          impact: {
            type: Type.OBJECT,
            properties: {
              funds: { type: Type.NUMBER },
              fans: { type: Type.NUMBER },
              hype: { type: Type.NUMBER },
              reputation: { type: Type.NUMBER }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text);
};
