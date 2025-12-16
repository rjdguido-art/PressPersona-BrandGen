import { GoogleGenAI, Type } from "@google/genai";
import { LogoConcept } from "../types";

// Initialize Gemini Client
// The API key is guaranteed to be available in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates textual logo concepts using Gemini 2.5 Flash.
 */
export const generateLogoConcepts = async (
  companyName: string,
  description: string,
  industry: string
): Promise<LogoConcept[]> => {
  const prompt = `
    You are a world-class brand identity designer. 
    Client Name: "${companyName}"
    Industry: "${industry}"
    Description: "${description}"

    Please develop 3 distinct, high-quality logo concepts for this client.
    For each concept, provide:
    1. A creative title for the concept.
    2. A rationale explaining why this fits the brand.
    3. A color palette (list of hex codes).
    4. A typography style suggestion.
    5. A highly detailed image generation prompt that describes a flat, vector-style logo on a white background. 
       The image prompt should be optimized for an AI image generator. 
       Do not include text inside the logo image itself if possible, focus on the icon/symbol.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              rationale: { type: Type.STRING },
              colorPalette: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              typographySuggestion: { type: Type.STRING },
              imagePrompt: { type: Type.STRING },
            },
            required: ["title", "rationale", "colorPalette", "typographySuggestion", "imagePrompt"],
          },
        },
      },
    });

    const rawConcepts = JSON.parse(response.text || "[]");
    
    // Add IDs and initial state
    return rawConcepts.map((c: any, index: number) => ({
      ...c,
      id: `concept-${Date.now()}-${index}`,
      isLoadingImage: true, // We will load images immediately after
    }));

  } catch (error) {
    console.error("Error generating text concepts:", error);
    throw new Error("Failed to generate brand concepts.");
  }
};

/**
 * Generates a logo image using Gemini 2.5 Flash Image (Nano Banana).
 */
export const generateLogoImage = async (prompt: string): Promise<string | null> => {
  try {
    // We append specific style instructions to ensure consistency
    const enhancedPrompt = `${prompt}, minimalist vector logo, professional design, white background, high resolution, 4k, no realistic photo effects, flat design`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: enhancedPrompt,
      config: {
        // Nano banana models do not support responseMimeType or responseSchema
        // We just ask for the content
      }
    });

    // Iterate through parts to find the inline image data
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const base64Data = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || "image/png";
          return `data:${mimeType};base64,${base64Data}`;
        }
      }
    }
    
    console.warn("No image data found in response");
    return null;

  } catch (error) {
    console.error("Error generating logo image:", error);
    return null; // Return null on failure so UI can show a placeholder or error state
  }
};
