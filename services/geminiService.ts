
import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const askAssistant = async (message: string, history: {role: string, parts: {text: string}[]}[], lang: string) => {
  const ai = getAIClient();
  
  const systemInstruction = `Jsi expert na španělské reality a investiční poradenství pro společnost PRENAS INVERSIONES S.L.
  Tvé úkoly:
  1. Odpovídat na dotazy ohledně nákupu nemovitostí ve Španělsku (proces, daně, hypotéky).
  2. Prezentovat služby PRENAS INVERSIONES (vyhledávání nemovitostí, právní servis, bankovní koordinace).
  3. Komunikovat v jazyce: ${lang === 'cz' ? 'Čeština' : 'Španělština'}.
  4. Být profesionální, uctivý a věcný.
  
  Informace o firmě:
  - Zaměření: Španělské reality pro české klienty.
  - Služby: Kompletní servis od výběru po zápis do katastru.
  - Ceny: Individuální dle rozsahu, základní konzultace zdarma.
  - Partneři: Spolupracujeme s bankami jako BBVA, Santander a místními notáři.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [...history, { role: 'user', parts: [{ text: message }] }],
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
    },
  });

  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const generateLogoConcepts = async (companyName: string) => {
  const ai = getAIClient();
  const prompt = `A professional, luxury, minimalist logo design for a Spanish real estate investment company called "${companyName}". 
  The style should be clean, high-end, using colors like gold (#c5a059), deep navy blue, and white. 
  Include a sophisticated emblem (like a stylized P or house/investment icon) and elegant typography. 
  The image should be on a clean dark or white background. Modern, vector-style aesthetic.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (part?.inlineData) {
    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  }
  throw new Error("No image generated");
};
