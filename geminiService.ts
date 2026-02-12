import { GoogleGenAI, Type } from "@google/genai";
import { MedicalLesson } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateMedicalLesson(text: string): Promise<MedicalLesson> {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `You are a Senior USMLE Content Architect specializing in Step 1 (Pathophysiology) and Step 2 CK (Clinical Management). 
    
    Transform the input text into a high-density clinical suite.
    
    CRITICAL INSTRUCTIONS:
    1. TARGET AUDIENCE: Students aiming for 270+ on Step 2 CK. Focus on "Next Best Step" and "Most Likely Diagnosis" intertwined with basic science mechanisms.
    2. MULTIPART ELITE CASES: Generate 4-5 complex cases. Every case MUST be multipart (Diagnosis -> Management OR Mechanism).
    3. DISTRACTOR DECONSTRUCTION: This is the CORE feature. For "optionRationales", provide a sharp, technical explanation for EVERY option. 
       - Explain exactly why the distractor is plausible but wrong based on specific vignette clues.
    4. NO STEP 3 CONTENT: Focus strictly on Step 1 foundational knowledge and Step 2 CK clinical reasoning.
    5. FORMATTING: Extremely compact. Use professional medical jargon. Format labs with reference ranges.
    6. NO REVEAL ON SUMMARY: Summary sections/pearls must be static and permanent.

    Input Text:
    ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          category: { type: Type.STRING },
          difficulty: { type: Type.STRING, enum: ["Step 1", "Step 2 CK", "Comprehensive"] },
          overview: { type: Type.STRING },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                highYieldBullets: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["title", "content", "highYieldBullets"]
            }
          },
          equations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                formula: { type: Type.STRING },
                variables: { type: Type.ARRAY, items: { type: Type.STRING } },
                clinicalUtility: { type: Type.STRING }
              },
              required: ["name", "formula", "variables", "clinicalUtility"]
            }
          },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                vignette: {
                  type: Type.OBJECT,
                  properties: {
                    presentation: { type: Type.STRING },
                    physicalExam: { type: Type.STRING },
                    labs: { type: Type.STRING }
                  },
                  required: ["presentation", "physicalExam", "labs"]
                },
                phaseAnalyses: {
                  type: Type.OBJECT,
                  properties: {
                    presentation: { type: Type.STRING },
                    physicalExam: { type: Type.STRING },
                    labs: { type: Type.STRING }
                  },
                  required: ["presentation", "physicalExam", "labs"]
                },
                vignetteAnnotations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      term: { type: Type.STRING },
                      insight: { type: Type.STRING }
                    },
                    required: ["term", "insight"]
                  }
                },
                questionText: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                optionRationales: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
                keyLearningPoint: { type: Type.STRING },
                yieldTag: { type: Type.STRING, enum: ['Step 1 Foundational', 'Step 2 CK High-Yield', 'Board Classic', 'Score Optimizer'] },
                managementFollowUp: {
                  type: Type.OBJECT,
                  properties: {
                    questionText: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.INTEGER },
                    explanation: { type: Type.STRING },
                    optionRationales: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["questionText", "options", "correctIndex", "explanation", "optionRationales"]
                }
              },
              required: ["id", "vignette", "phaseAnalyses", "vignetteAnnotations", "questionText", "options", "optionRationales", "correctIndex", "explanation", "keyLearningPoint", "yieldTag"]
            }
          },
          pearls: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["title", "category", "difficulty", "overview", "sections", "questions", "pearls"]
      }
    }
  });

  try {
    const textResult = response.text || "{}";
    return JSON.parse(textResult) as MedicalLesson;
  } catch (error) {
    console.error("JSON Parsing Error:", error);
    throw new Error("Clinical synthesis failure. Ensure input is medically dense.");
  }
}