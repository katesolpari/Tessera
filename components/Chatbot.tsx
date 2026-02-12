import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Icons } from '../constants';
import { MedicalLesson } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatbotProps {
  currentLesson: MedicalLesson | null;
}

export const Chatbot: React.FC<ChatbotProps> = ({ currentLesson }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const chatRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const initChat = () => {
    if (chatRef.current) return chatRef.current;
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemInstruction = `You are the Tessera Clinical Mentor, an elite USMLE architect.
    Help students master complex pathophysiology and clinical reasoning for Step 1 and Step 2 CK.
    Current Context: "${currentLesson?.title || 'General Medicine'}".
    Focus on WHY and elimination logic. Be concise, sharp, and board-centric.`;

    chatRef.current = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });
    return chatRef.current;
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isTyping) return;

    const userMessage: Message = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const chat = initChat();
      const streamResponse = await chat.sendMessageStream({ message: textToSend });
      
      let fullResponse = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of streamResponse) {
        const c = chunk as GenerateContentResponse;
        fullResponse += c.text || '';
        
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'model', text: fullResponse };
          return newMessages;
        });
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Logic stream disconnected. Re-engaging..." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100]">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-[#0F172A] text-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-105 transition-all hover:bg-[#2563EB]"
        >
          <Icons.Chat />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#2563EB] border-2 border-white rounded-full"></div>
        </button>
      ) : (
        <div className="w-[480px] max-w-[95vw] h-[720px] max-h-[85vh] bg-white border border-[#E2E8F0] rounded-[2rem] shadow-[0_40px_120px_-20px_rgba(15,23,42,0.2)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="bg-[#0F172A] p-8 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 rounded-xl bg-white text-[#0F172A] flex items-center justify-center shadow-lg">
                <Icons.Activity />
              </div>
              <div>
                <h4 className="serif-heading text-white font-black text-base leading-none">Tessera Mentor</h4>
                <span className="wide-nav text-[8px] text-[#2563EB] tracking-[0.3em] mt-2 block">Logic Stream Active</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div 
            ref={scrollRef}
            className="flex-grow overflow-y-auto p-10 space-y-8 bg-[#F8FAFC] no-scrollbar"
          >
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                <div className="mb-6 scale-[3] text-[#CBD5E1]"><Icons.Stethoscope /></div>
                <p className="serif-heading text-xl font-black text-[#0F172A]">Clinical Mentorship</p>
                <div className="mt-12 w-full space-y-4">
                   {['Clarify pathophysiology', 'Analyze management steps'].map((q) => (
                     <button key={q} onClick={() => handleSend(q)} className="w-full py-4 px-6 bg-white border border-[#E2E8F0] rounded-xl wide-nav text-[9px] text-[#0F172A] hover:border-[#2563EB] transition-all text-left">{q}</button>
                   ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-400`}>
                <div className={`max-w-[85%] p-6 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-[#0F172A] text-white rounded-br-none shadow-xl' 
                    : 'bg-white text-[#0F172A] border border-[#E2E8F0] rounded-bl-none shadow-sm'
                }`}>
                  <p className="text-base font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-8 bg-white border-t border-[#E2E8F0]">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Mentor..."
                className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-xl py-5 pl-8 pr-16 focus:border-[#2563EB] focus:outline-none transition-all font-medium text-sm"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="absolute right-3 top-3 w-12 h-12 bg-[#0F172A] text-white rounded-lg flex items-center justify-center hover:bg-[#2563EB] transition-all disabled:opacity-40"
              >
                <Icons.Send />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};