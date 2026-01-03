import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// System instructions for the Analyst
const SYSTEM_INSTRUCTION = `
You are the "C-Force AI Analyst", an elite cybersecurity assistant integrated into a threat intelligence platform. 
Your goal is to assist security analysts by:
1. Explaining complex IOCs (Indicators of Compromise), CVEs, and network anomalies in simple terms.
2. Correlating OSINT data with potential threats.
3. Suggesting defensive actions and remediation steps.
4. Providing educational context for junior analysts.

Maintain a professional, concise, and authoritative yet helpful tone. 
If the user provides raw data (JSON, logs), interpret it immediately.
`;

/**
 * Uses Gemini 3 Pro for complex chat and reasoning.
 */
export const sendChatMessage = async (
  message: string, 
  history: { role: 'user' | 'model'; content: string }[]
): Promise<string> => {
  if (!apiKey) return "Error: API Key is missing.";

  try {
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }]
      }))
    });

    const result = await chat.sendMessage({ message });
    return result.text || "No response generated.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "I encountered an error processing your request. Please check your connection or API key.";
  }
};

/**
 * Uses Gemini 3 Flash for fast, low-latency analysis of specific data points.
 */
export const quickAnalyze = async (dataContext: string, promptType: 'explain' | 'risk' | 'correlate'): Promise<string> => {
  if (!apiKey) return "Error: API Key is missing.";

  let prompt = "";
  switch (promptType) {
    case 'explain':
      prompt = `Briefly explain this data point in the context of cybersecurity: ${dataContext}`;
      break;
    case 'risk':
      prompt = `Analyze the risk level of this indicator. Return ONLY: Risk Level (Low/Med/High) and a 1-sentence reason. Data: ${dataContext}`;
      break;
    case 'correlate':
      prompt = `What common attack campaigns or APT groups are associated with this type of artifact? Data: ${dataContext}`;
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Corrected from invalid model name
      contents: prompt,
      config: {
        systemInstruction: "You are a fast, precise security tool. Be concise."
      }
    });
    return response.text || "Analysis failed.";
  } catch (error) {
    console.error("Quick Analysis Error:", error);
    return "Analysis temporarily unavailable.";
  }
};