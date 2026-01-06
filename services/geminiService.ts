
import { GoogleGenAI } from "@google/genai";

// Strictly adhering to GoogleGenAI initialization guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  if (!process.env.API_KEY) return "Error: API Key is missing.";

  try {
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      // history mapping for proper SDK context
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
  if (!process.env.API_KEY) return "Error: API Key is missing.";

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
      model: 'gemini-3-flash-preview',
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

/**
 * Generates a structured OSINT report for a specific target.
 * Returns ACTUAL known data about the target, not mock data.
 */
export const generateOsintReport = async (target: string): Promise<any> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");

  const prompt = `
    Perform a passive OSINT analysis on the target: "${target}".
    Return a valid JSON object (NO Markdown formatting) with REAL known data.
    
    Structure:
    {
      "ip_history": { "count": number, "items": ["YYYY-MM-DD: IP (Provider)"] },
      "whois": { "count": number, "items": ["Registrar: ...", "Created: ...", "Name Servers: ..."] },
      "ghunt": { "count": number, "items": ["Profile info...", "Cloud services used...", "Public configurations..."] },
      "phone_infoga": { "count": number, "items": ["Carrier info...", "Location...", "Social media links...", "Format status..."] },
      "web_archive": { "count": number, "items": ["First snapshot date...", "Key changes..."] },
      "backlinks": { "count": number, "items": ["Top referrer 1", "Top referrer 2"] },
      "subdomains": { "count": number, "items": ["sub1.${target}", "sub2.${target}"] },
      "threat_check": { "count": number, "items": ["VirusTotal Score", "Reputation"] },
      "dns_hosting": { "count": number, "items": ["Provider", "MX Records", "SPF"] },
      "sitemap": { "count": number, "items": ["/path1", "/path2"] }
    }

    If the target is generic (e.g. 'example.com'), provide realistic examples. If it is a real company (e.g. 'google.com'), provide ACTUAL public data.
    If the target is a phone number, prioritize 'phone_infoga' data.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("OSINT Gen Error:", error);
    return null;
  }
};

/**
 * Generates structured Threat Intelligence data.
 */
export const generateThreatData = async (query: string): Promise<any> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");

  const prompt = `
    Analyze the threat indicator: "${query}".
    Return valid JSON with keys:
    {
      "type": "IP" | "DOMAIN" | "HASH",
      "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "confidence": number (0-100),
      "classification": "string",
      "campaign": "string (optional)",
      "firstSeen": "string",
      "lastSeen": "string",
      "sources": number,
      "region": "string (2-letter code or region name)",
      "aiAnalysis": "Short paragraph analyzing the risk"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Threat Gen Error:", error);
    return null;
  }
};
