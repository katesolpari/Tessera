import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Icons } from '../constants';

interface MedicalImageProps {
  prompt: string;
}

export const MedicalImage: React.FC<MedicalImageProps> = ({ prompt }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const generateImage = async () => {
      if (!prompt) return;
      setLoading(true);
      setError(false);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              {
                text: `Professional high-yield medical diagram or clinical illustration of: ${prompt}. White background, clean lines, high contrast, scientific accuracy, USMLE board-style schematic.`,
              },
            ],
          },
        });

        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64EncodeString: string = part.inlineData.data;
            setImageUrl(`data:image/png;base64,${base64EncodeString}`);
            break;
          }
        }
      } catch (err) {
        console.error("Image generation failed:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    generateImage();
  }, [prompt]);

  return (
    <div className="w-full h-[400px] bg-white rounded-[2rem] border border-[#B45309]/10 overflow-hidden relative group">
      {loading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FDF2F8]/30">
          <div className="w-12 h-12 border-2 border-[#9F1239]/20 border-t-[#9F1239] rounded-full animate-spin mb-4"></div>
          <span className="text-[9px] font-black text-[#9F1239] uppercase tracking-widest animate-pulse">Illustrating Clinical Logic</span>
        </div>
      ) : error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FFF9FB]">
          <div className="text-[#B45309]/30 mb-4 scale-150">
             <Icons.Activity />
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Illustration Unavailable</span>
        </div>
      ) : (
        imageUrl && (
          <img 
            src={imageUrl} 
            alt="Medical Illustration" 
            className="w-full h-full object-contain p-4 mix-blend-multiply animate-in fade-in duration-1000"
          />
        )
      )}
      
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="px-3 py-1 bg-white/80 backdrop-blur-sm border border-[#B45309]/20 rounded-full">
           <span className="text-[8px] font-bold text-[#4C0519] uppercase tracking-widest">AI Generated Diagram</span>
        </div>
      </div>
    </div>
  );
};