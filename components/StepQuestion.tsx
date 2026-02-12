import React, { useState, useMemo, useEffect } from 'react';
import { BoardQuestion, VignetteAnnotation } from '../types';
import { Icons } from '../constants';
import { MarkdownText } from '../App';

interface StepQuestionProps {
  question: BoardQuestion;
  index: number;
  onAnswer: (correct: boolean) => void;
}

const MicroInsight: React.FC<{ term: string, insight: string }> = ({ term, insight }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="relative inline-block">
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onBlur={() => setIsOpen(false)}
        className="border-b border-dotted border-[#2563EB] hover:text-[#0F172A] transition-all cursor-help font-bold text-[#2563EB]"
      >
        {term}
      </button>
      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 p-5 bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl shadow-2xl z-[100] animate-in zoom-in-95 fade-in duration-200 text-left">
          <div className="flex items-center gap-2 mb-2">
             <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></div>
             <span className="wide-nav text-[9px] text-[#64748B]">Micro Insight</span>
          </div>
          <p className="text-xs font-medium leading-relaxed tracking-tight">
            <MarkdownText text={insight} />
          </p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[8px] border-transparent border-t-white"></div>
        </div>
      )}
    </span>
  );
};

export const StepQuestion: React.FC<StepQuestionProps> = ({ question, index, onAnswer }) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [maxReachedStep, setMaxReachedStep] = useState<number>(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [followUpSelected, setFollowUpSelected] = useState<number | null>(null);
  const [revealedAnalyses, setRevealedAnalyses] = useState<Set<number>>(new Set());

  useEffect(() => {
    setActiveStep(0);
    setMaxReachedStep(0);
    setSelected(null);
    setFollowUpSelected(null);
    setRevealedAnalyses(new Set());
  }, [question.id]);

  const vignetteSteps = useMemo(() => {
    const s = [{ id: 'hx', label: 'History', content: question.vignette.presentation, analysis: question.phaseAnalyses.presentation }];
    if (question.vignette.physicalExam) s.push({ id: 'pe', label: 'Exam', content: question.vignette.physicalExam, analysis: question.phaseAnalyses.physicalExam });
    if (question.vignette.labs) s.push({ id: 'labs', label: 'Labs', content: question.vignette.labs, analysis: question.phaseAnalyses.labs });
    return s;
  }, [question]);

  const totalStages = vignetteSteps.length + (question.managementFollowUp ? 2 : 1);
  const isVignettePhase = activeStep < vignetteSteps.length;
  const isQuestionPhase = activeStep === vignetteSteps.length;
  const isFollowUpPhase = activeStep === vignetteSteps.length + 1;

  const handleNext = () => {
    const next = activeStep + 1;
    setActiveStep(next);
    if (next > maxReachedStep) setMaxReachedStep(next);
  };

  const handleJump = (idx: number) => {
    if (idx <= maxReachedStep) setActiveStep(idx);
  };

  const renderAnnotatedText = (text: string) => {
    if (!question.vignetteAnnotations || question.vignetteAnnotations.length === 0) return <MarkdownText text={text} />;
    const sortedAnnotations = [...question.vignetteAnnotations].sort((a, b) => b.term.length - a.term.length);
    let parts: (string | React.ReactElement)[] = [text];
    sortedAnnotations.forEach((anno) => {
      const newParts: (string | React.ReactElement)[] = [];
      parts.forEach((part) => {
        if (typeof part !== 'string') { newParts.push(part); return; }
        const regex = new RegExp(`(${anno.term})`, 'gi');
        const splitText = part.split(regex);
        splitText.forEach((t) => {
          if (t.toLowerCase() === anno.term.toLowerCase()) newParts.push(<MicroInsight key={Math.random()} term={t} insight={anno.insight} />);
          else if (t !== "") newParts.push(t);
        });
      });
      parts = newParts;
    });
    return <>{parts.map((p, i) => (typeof p === 'string' ? <MarkdownText key={i} text={p} /> : p))}</>;
  };

  const renderLabs = (content: string) => {
    const labEntries = content.split(/[;\n]/).map(l => l.trim()).filter(l => l.includes(':'));
    return (
      <div className="bg-[#F8FAFC] p-8 rounded-xl border border-[#E2E8F0] shadow-inner text-[13px]">
        <div className="grid grid-cols-1 gap-y-3">
          {labEntries.map((entry, li) => {
            const splitPoint = entry.indexOf(':');
            return (
              <div key={li} className="flex items-center justify-between border-b border-[#E2E8F0]/50 pb-2 last:border-0 px-1 font-medium">
                <span className="text-[#64748B] wide-nav text-[9px]">{entry.substring(0, splitPoint).trim()}</span>
                <span className="text-right text-[#0F172A] mono-data uppercase font-bold">{entry.substring(splitPoint + 1).trim()}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="precision-card rounded-2xl overflow-hidden mb-16 shadow-xl">
      <div className="bg-[#0F172A] px-8 py-5 flex justify-between items-center text-white">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 bg-white text-[#0F172A] flex items-center justify-center font-black text-sm rounded-lg shadow-inner">
            {String(index + 1).padStart(2, '0')}
          </div>
          <div className="flex flex-col">
            <span className="wide-nav opacity-50 text-[9px] tracking-[0.3em]">Module Sequence</span>
            <span className="wide-nav text-[11px] mt-1 tracking-[0.2em] font-black">{question.yieldTag}</span>
          </div>
        </div>
        <div className="flex gap-2">
           {Array.from({length: totalStages}).map((_, i) => (
             <div key={i} className={`h-1.5 w-10 rounded-full transition-all duration-700 ${i <= maxReachedStep ? (i === activeStep ? 'bg-[#2563EB]' : 'bg-white/40') : 'bg-white/10'}`}></div>
           ))}
        </div>
      </div>

      <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-8 py-5 flex items-center gap-5 overflow-x-auto no-scrollbar">
        {vignetteSteps.map((s, idx) => (
          <button key={s.id} onClick={() => handleJump(idx)} disabled={idx > maxReachedStep} className={`wide-nav px-5 py-2.5 rounded transition-all border font-black ${activeStep === idx ? 'bg-[#0F172A] text-white border-[#0F172A]' : idx <= maxReachedStep ? 'bg-white text-[#0F172A] border-[#E2E8F0]' : 'text-[#94A3B8] border-transparent opacity-50'}`}>{s.label}</button>
        ))}
        <button onClick={() => handleJump(vignetteSteps.length)} disabled={vignetteSteps.length > maxReachedStep} className={`wide-nav px-5 py-2.5 rounded transition-all border font-black ${activeStep === vignetteSteps.length ? 'bg-[#0F172A] text-white border-[#0F172A]' : vignetteSteps.length <= maxReachedStep ? 'bg-white text-[#0F172A] border-[#E2E8F0]' : 'text-[#94A3B8] border-transparent opacity-50'}`}>ANALYSIS</button>
        {question.managementFollowUp && (
          <button onClick={() => handleJump(vignetteSteps.length + 1)} disabled={vignetteSteps.length + 1 > maxReachedStep} className={`wide-nav px-5 py-2.5 rounded transition-all border font-black ${activeStep === vignetteSteps.length + 1 ? 'bg-[#0F172A] text-white border-[#0F172A]' : vignetteSteps.length + 1 <= maxReachedStep ? 'bg-white text-[#0F172A] border-[#E2E8F0]' : 'text-[#94A3B8] border-transparent opacity-50'}`}>MANAGEMENT</button>
        )}
      </div>

      <div className="p-10 md:p-20 min-h-[400px]">
        {isVignettePhase ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-8">
              <span className="wide-nav text-[#2563EB] opacity-70 tracking-[0.3em]">Evidence Stream &gt; {vignetteSteps[activeStep].label}</span>
              {vignetteSteps[activeStep].id === 'labs' ? renderLabs(vignetteSteps[activeStep].content) : (
                <div className="serif-heading text-2xl md:text-3xl lg:text-4xl leading-tight text-[#0F172A] font-black">{renderAnnotatedText(vignetteSteps[activeStep].content)}</div>
              )}
            </div>
            <div onClick={() => !revealedAnalyses.has(activeStep) && setRevealedAnalyses(prev => new Set(prev).add(activeStep))} className={`bg-[#F8FAFC] border border-[#E2E8F0] p-10 rounded-2xl transition-all flex flex-col justify-center min-h-[220px] ${!revealedAnalyses.has(activeStep) ? 'cursor-pointer hover:bg-white hover:border-[#2563EB]/40 group' : 'shadow-inner'}`}>
              {!revealedAnalyses.has(activeStep) ? (
                <div className="text-center space-y-4">
                   <p className="wide-nav text-[#0F172A] tracking-[0.4em] group-hover:text-[#2563EB]">DECONSTRUCT LOGIC</p>
                </div>
              ) : (
                <p className="italic-subtitle text-[#1E293B] text-xl border-l-4 border-[#2563EB] pl-8 leading-relaxed animate-in fade-in zoom-in-95 font-medium"><MarkdownText text={vignetteSteps[activeStep].analysis} /></p>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <span className="wide-nav text-[#2563EB] block mb-6 tracking-[0.5em]">{isFollowUpPhase ? "Sequential Decision" : "Differential Matrix"}</span>
              <h3 className="serif-heading text-3xl md:text-5xl font-black text-[#0F172A] leading-tight max-w-3xl mx-auto tracking-tighter">"{isFollowUpPhase ? question.managementFollowUp?.questionText : question.questionText}"</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-5">
              {(isFollowUpPhase ? question.managementFollowUp?.options : question.options)?.map((option, idx) => {
                const currentSel = isFollowUpPhase ? followUpSelected : selected;
                const correctIdx = isFollowUpPhase ? question.managementFollowUp?.correctIndex : question.correctIndex;
                const rationales = isFollowUpPhase ? question.managementFollowUp?.optionRationales : question.optionRationales;
                const isCorrect = idx === correctIdx;
                const isSelected = currentSel === idx;
                
                let style = "border border-[#E2E8F0] bg-white hover:border-[#2563EB] hover:shadow-md";
                if (currentSel !== null) {
                   if (isCorrect) style = "border-[#2563EB] bg-[#F0F9FF] shadow-inner ring-1 ring-[#2563EB]/10";
                   else if (isSelected) style = "border-rose-200 bg-rose-50/50 opacity-90";
                   else style = "opacity-20 pointer-events-none border-transparent grayscale";
                }
                
                return (
                  <div key={idx} className="flex flex-col">
                    <button disabled={currentSel !== null} onClick={() => isFollowUpPhase ? setFollowUpSelected(idx) : setSelected(idx)} className={`w-full text-left p-7 rounded-xl transition-all flex items-center gap-10 ${style}`}>
                      <span className={`wide-nav w-10 h-10 rounded-lg border flex items-center justify-center transition-all font-black text-xs ${isSelected ? 'bg-[#0F172A] text-white border-[#0F172A]' : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]'}`}>{String.fromCharCode(65 + idx)}</span>
                      <span className="serif-heading font-black text-xl md:text-2xl tracking-tight leading-none">{option}</span>
                    </button>
                    {isSelected && (
                      <div className={`mt-3 p-8 rounded-xl border-l-4 border-[#2563EB] text-sm font-medium leading-relaxed animate-in slide-in-from-top-2 bg-[#F8FAFC] shadow-sm`}>
                        <span className="wide-nav text-[#2563EB] text-[10px] block mb-4 tracking-[0.3em]">Clinical Counter-Logic</span>
                        <MarkdownText text={rationales?.[idx]} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {((isQuestionPhase && selected !== null) || (isFollowUpPhase && followUpSelected !== null)) && (
              <div className="mt-20 p-12 border-2 border-[#0F172A] rounded-2xl shadow-2xl animate-in slide-in-from-bottom-8 bg-white relative">
                <div className="absolute -top-4 left-10 px-6 py-1 bg-[#0F172A] text-white wide-nav text-[9px] rounded-full">Definitive Pathophysiology</div>
                <p className="text-lg font-medium leading-relaxed mb-12 text-[#1E293B]"><MarkdownText text={isFollowUpPhase ? question.managementFollowUp?.explanation : question.explanation} /></p>
                {!isFollowUpPhase && (
                  <div className="pt-12 border-t border-[#E2E8F0] text-center">
                    <span className="wide-nav text-[#2563EB] text-[10px] block mb-4 tracking-[0.3em]">Board Mosaic Pearl</span>
                    <p className="italic-subtitle text-3xl font-black text-[#0F172A] leading-tight tracking-tighter">"{question.keyLearningPoint}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-12 pt-0 flex justify-end">
        {activeStep < totalStages - 1 && (
          <button onClick={handleNext} disabled={(isQuestionPhase && selected === null)} className="btn-focus px-12 py-5 bg-[#0F172A] text-white rounded-lg disabled:opacity-30 flex items-center gap-8 shadow-xl">
            {activeStep === vignetteSteps.length - 1 ? 'Go to Question' : 'Advance Phase'}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        )}
      </div>
    </div>
  );
};