import React, { useState } from 'react';

interface MedicalInputProps {
  onProcess: (text: string) => void;
  isLoading: boolean;
}

export const MedicalInput: React.FC<MedicalInputProps> = ({ onProcess, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.length < 50) {
      alert("Please provide more text for clinical deconstruction.");
      return;
    }
    onProcess(text);
  };

  return (
    <div className="w-full">
      <div className="precision-card rounded-[2.5rem] p-16 md:p-24 relative overflow-hidden bg-white">
        <div className="text-center mb-16">
          <h2 className="serif-heading text-4xl md:text-6xl font-black text-[#0F172A] tracking-tighter mb-6">Master Any Medical Topic</h2>
          <p className="text-slate-500 font-medium text-lg md:text-xl max-w-3xl mx-auto leading-relaxed italic-display opacity-80">
            Paste a textbook chapter, study article, or clinical notes to architect an interactive board-focused suite.
          </p>
        </div>
        
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Input source material here..."
            className="w-full h-[400px] p-12 md:p-16 rounded-3xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-[#2563EB] focus:ring-0 outline-none transition-all resize-none text-xl md:text-2xl leading-relaxed text-[#0F172A] font-medium placeholder:opacity-30"
            disabled={isLoading}
          />
          <div className="absolute bottom-8 right-12 text-slate-400 font-mono text-[9px] uppercase tracking-[0.3em] pointer-events-none">
            {text.length} Character Matrix
          </div>
        </div>

        <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-12 border-t border-slate-100 pt-16">
          <div className="flex items-center gap-12">
            <div className="flex flex-col">
              <span className="wide-nav opacity-50 mb-2">Scientific Focus</span>
              <span className="text-xs font-bold text-[#2563EB] uppercase tracking-[0.2em] font-mono">Precision Blue</span>
            </div>
            <div className="h-10 w-[1px] bg-slate-100"></div>
            <div className="flex flex-col">
              <span className="wide-nav opacity-50 mb-2">Cognitive Load</span>
              <span className="text-xs font-bold text-[#0F172A] uppercase tracking-[0.2em] font-mono">Optimized</span>
            </div>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={isLoading || !text.trim()}
            className={`w-full md:w-auto px-24 py-7 rounded-lg btn-focus shadow-2xl transition-all ${
              isLoading 
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                : 'bg-[#0F172A] text-white hover:bg-[#2563EB]'
            }`}
          >
            {isLoading ? 'Architecting...' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  );
};