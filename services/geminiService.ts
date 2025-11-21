import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes symptoms and returns a triage level and advice.
 */
export const analyzeSymptoms = async (symptoms: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a medical triage AI assistant. Analyze these symptoms: "${symptoms}".
      Determine a Triage Level (GREEN = Safe/Home Care, YELLOW = See Doctor Soon, RED = Emergency).
      Provide a short, reassuring advice in plain English.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            triageLevel: { type: Type.STRING, enum: ["GREEN", "YELLOW", "RED"] },
            advice: { type: Type.STRING },
            recommendedSpecialist: { type: Type.STRING }
          }
        }
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      triageLevel: "YELLOW",
      advice: "AI service unavailable. Please consult a doctor.",
      recommendedSpecialist: "General Physician"
    };
  }
};

/**
 * Formats raw text/dictation into structured clinical notes.
 */
export const formatClinicalNotes = async (rawText: string, vitals: any) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Format the following raw doctor's dictation into structured clinical notes.
      
      Vitals Context: ${JSON.stringify(vitals)}
      Raw Dictation: "${rawText}"
      
      Format as:
      Subjective: (Patient's complaint)
      Objective: (Observations based on vitals and text)
      Assessment: (Potential diagnosis)
      Plan: (Immediate actions)`,
      config: {
        temperature: 0.3
      }
    });
    return response.text;
  } catch (error) {
    console.error("Scribing Error:", error);
    return rawText;
  }
};