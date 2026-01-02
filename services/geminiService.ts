import { GoogleGenAI } from "@google/genai";
import { UserProfile, RoutineInput, BiomechanicalAnalysis, PreAnalysisResult, PersonaId, VideoAnalysisResult } from "../types";

// Mi clave de API se inyecta desde el entorno
const apiKey = process.env.API_KEY;
if (!apiKey) throw new Error("API Key no encontrada");
const ai = new GoogleGenAI({ apiKey });

// Mi parser de confianza para asegurar que las respuestas de la IA siempre sean JSON válido
const myJsonParser = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch (e2) {
      const firstOpen = text.indexOf('{');
      const lastClose = text.lastIndexOf('}');
      if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
        return JSON.parse(text.substring(firstOpen, lastClose + 1));
      }
    }
    throw new Error("He tenido un problema al procesar la respuesta de mi IA. Reintenta.");
  }
};

const getPersonaPrompt = (id: PersonaId) => {
  switch (id) {
    case 'sara': return `PERSONAJE: Sara (Sevillana). Tono coloquial, directa, "guasona" pero técnica. Usa: illo, miarma, picha, coraje.`;
    case 'todor': return `PERSONAJE: Dr. Todor (Madrileño). Tono académico mezclado con pijo. Usa: mazo, renta, en plan, tronco.`;
    case 'raul': return `PERSONAJE: Raúl (Gallego). Bruto, directo, motivador. Usa: carallo, neno, sentidiño.`;
    default: return "Entrenador profesional.";
  }
};

export const preAnalyzeRoutine = async (routine: RoutineInput, personaId: PersonaId): Promise<PreAnalysisResult> => {
  const systemInstruction = `${getPersonaPrompt(personaId)} TAREA: Detecta objetivo y tipo de entrenamiento del input. Responde solo JSON.`;
  
  let parts: any[] = [];
  if (routine.type !== 'text') {
    parts.push({ inlineData: { mimeType: routine.mimeType || 'application/pdf', data: routine.content } });
    parts.push({ text: "Analiza este documento." });
  } else {
    parts.push({ text: routine.content });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: { systemInstruction, responseMimeType: "application/json" }
  });

  return myJsonParser(response.text || "{}");
};

export const analyzeRoutineWithGemini = async (profile: UserProfile, routine: RoutineInput, preAnalysis?: PreAnalysisResult): Promise<BiomechanicalAnalysis> => {
  const systemInstruction = `${getPersonaPrompt(profile.persona)} TAREA: Auditoría biomecánica completa. Evalúa seguridad y optimiza la rutina. Responde solo JSON.`;

  let parts: any[] = [];
  if (routine.content && routine.type !== 'text') {
    parts.push({ inlineData: { mimeType: routine.mimeType || 'application/pdf', data: routine.content } });
  } else {
    parts.push({ text: routine.content });
  }
  
  parts.push({ text: `Contexto: Nivel ${profile.experience}, Objetivo ${profile.goal}, Lesiones: ${profile.injuries}. Respuesta de usuario: ${profile.customAnswer}` });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: { systemInstruction, responseMimeType: "application/json" }
  });

  return myJsonParser(response.text || "{}");
};

export const analyzeVideoWithGemini = async (videoBase64: string, mimeType: string): Promise<VideoAnalysisResult> => {
  // Mi IA de video se comporta como un juez de powerlifting ultra preciso
  const systemInstruction = `ERES UN EXPERTO EN BIOMECÁNICA. Analiza el video. Detecta el ejercicio, cuenta repeticiones válidas, evalúa profundidad, bar path y estabilidad. Responde EXCLUSIVAMENTE en formato JSON.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { 
      parts: [
        { inlineData: { mimeType, data: videoBase64 } }, 
        { text: "Analiza mi técnica en este video de entrenamiento." }
      ] 
    },
    config: { responseMimeType: "application/json" }
  });
  
  return myJsonParser(response.text || "{}");
};