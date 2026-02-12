import React, { useState, useEffect } from 'react';
import { MedicalLesson, AppState, BoardQuestion } from './types';
import { MedicalInput } from './components/MedicalInput';
import { generateMedicalLesson } from './geminiService';
import { StepQuestion } from './components/StepQuestion';
import { Icons } from './constants';
import { Chatbot } from './components/Chatbot';

const LOADING_MESSAGES = [
  "Calibrating Clinical Focus...",
  "Synthesizing Differential Mosaics...",
  "Structuring Logic Branches...",
  "Optimizing Pathophysiology...",
  "Polishing Diagnostic Precision..."
];

const TesseraLogo: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="mosaic-tile">
    <path d="M4 6.5C4 5.5 5 4.8 6 5L26 6C27 6.1 27.5 7 27.2 8L26.5 10C26.3 11 25.5 11.5 24.5 11.5L7.5 11C6.5 11 5.8 10.2 5.8 9.2L4 6.5Z" fill="#0F172A" />
    <path d="M13.5 13L18.5 13.5C19.5 13.6 20.2 14.5 20 15.5L18.8 25C18.6 26.5 17.5 27.5 16 27.5H15.5C14 27.5 12.8 26.3 12.5 24.8L12 15.5C11.9 14.2 12.8 13.1 13.5 13Z" fill="#2563EB" />
    <path d="M21.5 13.8L24.5 14.2C25.5 14.3 26 15.2 25.8 16L24.8 19C24.5 20 23.5 20.5 22.5 20.2L20.5 19.5C19.5 19.2 19 18.2 19.2 17.2L21.5 13.8Z" fill="#7DD3FC" opacity="0.8" />
  </svg>
);

export const MarkdownText: React.FC<{ text: string | undefined }> = ({ text }) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="text-[#2563EB] font-bold">{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </>
  );
};

const HighYieldBullet: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex gap-4 p-5 rounded-sm border-l-2 border-[#2563EB] bg-white items-start hover:bg-slate-50 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
    <div className="flex-shrink-0 mt-1 text-[#2563EB] scale-75"><Icons.CheckCircle /></div>
    <span className="font-medium text-[#334155] text-sm md:text-base leading-snug tracking-tight"><MarkdownText text={text} /></span>
  </div>
);

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [lesson, setLesson] = useState<MedicalLesson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    let interval: any;
    if (state === AppState.GENERATING) {
      interval = setInterval(() => setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length), 2500);
    }
    return () => clearInterval(interval);
  }, [state]);

  const handleProcess = async (text: string) => {
    setState(AppState.GENERATING);
    setError(null);
    try {
      const generatedLesson = await generateMedicalLesson(text);
      setLesson(generatedLesson);
      setState(AppState.VIEWING_LESSON);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || "Synthesis failure. Refine input and retry.");
      setState(AppState.IDLE);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 px-10 py-8 border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-20">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setState(AppState.IDLE)}>
              <TesseraLogo />
              <h1 className="serif-heading text-2xl font-black text-[#0F172A]">Tessera.</h1>
            </div>
            <nav className="hidden lg:flex items-center gap-12 wide-nav">
              <span className="hover:text-[#2563EB] cursor-pointer transition-colors">Curricula</span>
              <span className="hover:text-[#2563EB] cursor-pointer transition-colors">Vignettes</span>
              <span className="hover:text-[#2563EB] cursor-pointer transition-colors">Mosaics</span>
            </nav>
          </div>
          
          <div className="flex items-center gap-10">
            {state === AppState.VIEWING_LESSON ? (
              <button onClick={() => setState(AppState.IDLE)} className="wide-nav text-[#0F172A] border-b border-[#0F172A] pb-0.5 hover:text-[#2563EB] hover:border-[#2563EB] transition-all">New Study</button>
            ) : (
              <span className="wide-nav text-[#0F172A] cursor-pointer hover:text-[#2563EB] transition-colors">Library</span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-20 md:py-32 transition-all duration-700">
        {state === AppState.IDLE && (
          <div className="animate-in fade-in duration-1000 max-w-5xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="serif-heading text-6xl md:text-9xl font-black text-[#0F172A] tracking-tighter mb-8 uppercase leading-none">Tessera</h2>
            </div>
            <MedicalInput onProcess={handleProcess} isLoading={false} />
          </div>
        )}

        {state === AppState.GENERATING && (
          <div className="flex flex-col items-center justify-center py-48">
            <div className="relative mb-12">
              <div className="w-24 h-24 border border-slate-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-24 h-24 border-2 border-[#2563EB] rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div className="text-center">
              <h3 className="serif-heading text-4xl font-black text-[#0F172A] mb-4">Structuring Logic</h3>
              <p className="italic-display text-[#64748B] text-2xl animate-pulse">{LOADING_MESSAGES[loadingMsgIdx]}</p>
            </div>
          </div>
        )}

        {state === AppState.VIEWING_LESSON && lesson && (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 space-y-32">
            <div className="text-center space-y-10">
              <div className="flex justify-center gap-6 mb-4 wide-nav">
                <span className="text-[#2563EB]">{lesson.difficulty}</span>
                <span className="opacity-20">/</span>
                <span>{lesson.category}</span>
              </div>
              <h1 className="serif-heading text-6xl md:text-8xl font-black text-[#0F172A] tracking-tighter leading-[0.9]">{lesson.title}</h1>
              <p className="italic-display text-2xl md:text-4xl text-slate-500 max-w-4xl mx-auto leading-tight"><MarkdownText text={lesson.overview} /></p>
            </div>

            <div className="grid grid-cols-1 gap-20">
              {lesson.sections.map((s, i) => (
                <section key={i} className="max-w-4xl mx-auto">
                  <div className="flex items-baseline gap-6 mb-12">
                    <span className="wide-nav opacity-40">Section {String(i + 1).padStart(2, '0')}</span>
                    <h3 className="serif-heading text-4xl font-black text-[#0F172A] flex-grow">{s.title}</h3>
                  </div>
                  <div className="mb-16">
                    <p className="text-slate-700 text-xl md:text-2xl leading-relaxed whitespace-pre-wrap font-medium tracking-tight"><MarkdownText text={s.content} /></p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {s.highYieldBullets.map((b, bi) => <HighYieldBullet key={bi} text={b} />)}
                  </div>
                </section>
              ))}
            </div>

            <div className="pt-24">
              <div className="mb-20 flex items-center justify-center gap-10">
                 <div className="h-[1px] flex-grow bg-slate-200"></div>
                 <h2 className="wide-nav tracking-[0.5em]">Clinical Synthesis</h2>
                 <div className="h-[1px] flex-grow bg-slate-200"></div>
              </div>
              <div className="space-y-24">
                {lesson.questions.map((q, i) => <StepQuestion key={q.id} question={q} index={i} onAnswer={() => {}} />)}
              </div>
            </div>

            <div className="pt-20 pb-40">
               <div className="precision-card bg-[#0F172A] rounded-[3rem] p-20 md:p-32 text-center border-none relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#2563EB] rounded-full blur-[180px] opacity-10 pointer-events-none"></div>
                  <p className="wide-nav text-[#64748B] mb-12 tracking-[0.6em]">Final Verification</p>
                  <h2 className="serif-heading text-white text-5xl md:text-7xl font-black tracking-tighter mb-20 leading-none">Diagnostic Mosaic Pearls</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto text-left">
                     {lesson.pearls.map((pearl, pi) => (
                       <div key={pi} className="flex items-start gap-8 p-10 bg-white/5 border border-white/10 rounded-2xl group transition-all hover:bg-white/10">
                          <span className="wide-nav text-[#2563EB] font-black mt-2 text-sm tracking-[0.3em]">[{String(pi + 1).padStart(2, '0')}]</span>
                          <p className="text-white text-2xl md:text-3xl font-medium leading-snug tracking-tight pearl-content"><MarkdownText text={pearl} /></p>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>
      <Chatbot currentLesson={lesson} />
    </div>
  );
};

export default App;