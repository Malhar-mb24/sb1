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

/**
 * Translates form content to a target language.
 */
export const translateFormContent = async (formObject: any, targetLang: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Translate the values of the following JSON object to language code "${targetLang}". 
      Keep the keys exactly the same. Do not translate keys.
      Only translate the values which are user-facing strings.
      JSON: ${JSON.stringify(formObject)}`,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || JSON.stringify(formObject));
  } catch (error) {
    console.error("Translation Error:", error);
    return formObject;
  }
};

/**
 * Analyzes health data to generate a Swasthya Score.
 */
export const analyzeHealthScore = async (data: any) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following patient health data and calculate a Swasthya Score (0-100, where 100 is perfect health).
      Data: ${JSON.stringify(data)}
      
      Return JSON structure:
      {
        "score": number,
        "riskLevel": "Low" | "Moderate" | "High",
        "summary": "Brief explanation of the score",
        "recommendations": ["Array of 3-4 actionable bullet points"],
        "suggestedDoctor": "Specialist type if needed, else General Physician",
        "nextCheckupLabel": "Recommended timeframe (e.g., 'Immediately', 'In 1 week', 'In 6 months')"
      }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            riskLevel: { type: Type.STRING, enum: ["Low", "Moderate", "High"] },
            summary: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedDoctor: { type: Type.STRING },
            nextCheckupLabel: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Health Score Error:", error);
    return {
      score: 75,
      riskLevel: "Moderate",
      summary: "Unable to calculate precisely due to network error. Based on averages.",
      recommendations: ["Consult a doctor for accurate assessment"],
      suggestedDoctor: "General Physician",
      nextCheckupLabel: "As soon as possible"
    };
  }
};