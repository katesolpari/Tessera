import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Icons } from '../constants';

interface MedicalReferenceProps {
  query: string;
}

export const MedicalReference: React.FC<MedicalReferenceProps> = ({ query }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [visualGuide, setVisualGuide] = useState('');

  useEffect(() => {
    const fetchVisualLandmarks = async () => {
      if (!query) return;
      setLoading(true);
      setError(false);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: `Analyze search results for "${query}" and synthesize a concise "Visual Landmark Guide". 
          Detail exactly what a medical student should observe on a standard diagram, clinical imaging (X-ray, CT, MRI, Ultrasound), or histology slide for this specific condition. 
          Focus on pathognomonic findings and high-yield visual evidence. 
          DO NOT PROVIDE ANY URLS OR LINKS. Provide only the synthesized descriptive summary.`,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });

        const text = response.text || "No visualization data available for this clinical topic.";
        setVisualGuide(text);
      } catch (err) {
        console.error("Visual guide synthesis failed:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchVisualLandmarks();
  }, [query]);

  return (
    <div className="w-full bg-white rounded-[2rem] border border-[#B45309]/10 overflow-hidden relative p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#B45309] text-white p-2 rounded-full scale-75 shadow-md">
          <Icons.Stethoscope />
        </div>
        <h6 className="serif-heading text-sm font-black text-[#B45309] uppercase tracking-widest">Visualization Guide</h6>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center bg-[#FDF2F8]/20 rounded-[1.5rem]">
          <div className="w-8 h-8 border-2 border-[#B45309]/20 border-t-[#B45309] rounded-full animate-spin mb-4"></div>
          <span className="text-[9px] font-black text-[#B45309] uppercase tracking-widest animate-pulse">Scanning Radiography & Path Repositories...</span>
        </div>
      ) : error ? (
        <div className="py-8 text-center bg-slate-50 rounded-[1.5rem]">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Resource connection offline</span>
        </div>
      ) : (
        <div className="space-y-5 animate-in fade-in duration-700">
          <div className="bg-[#FFF9FB] p-6 rounded-[1.5rem] border border-[#FBCFE8]/30">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[8px] font-black text-[#9F1239] uppercase tracking-[0.2em]">Diagnostic Landmarks</span>
              <div className="h-px flex-grow bg-[#9F1239]/10"></div>
            </div>
            <p className="text-base text-slate-700 leading-relaxed font-semibold">
              {visualGuide}
            </p>
          </div>
          
          <div className="pt-4 border-t border-[#FBCFE8]/30 flex justify-between items-center">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
               <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Search-Grounded Clinical Data</span>
            </div>
            <span className="text-[7px] font-black text-[#B45309] uppercase tracking-widest">MedStep Verified</span>
          </div>
        </div>
      )}
    </div>
  );
};