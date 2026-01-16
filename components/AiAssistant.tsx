
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GCodeLine } from '../types';

interface AiAssistantProps {
  currentGCode: GCodeLine[];
}

const AiAssistant: React.FC<AiAssistantProps> = ({ currentGCode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const analyzeGCode = async () => {
    setLoading(true);
    setIsOpen(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const gcodeStr = currentGCode.map(l => `${l.command} ${l.params || ''}`).join('\n');
      
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this G-Code for errors, potential collisions, or optimizations. Be concise and professional.
        
        G-Code:
        ${gcodeStr}`,
        config: {
          systemInstruction: "You are an expert CNC Machinist AI assistant. You help users debug G-Code and optimize toolpaths."
        }
      });

      setResponse(res.text || "No analysis available.");
    } catch (err) {
      setResponse("Error connecting to Gemini AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute bottom-20 left-4 z-50">
      <button 
        onClick={analyzeGCode}
        className="bg-[#1791cf] text-white p-3 shadow-lg hover:scale-105 transition-transform flex items-center justify-center group chamfer-sm"
      >
        <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">psychology</span>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap px-0 group-hover:px-2 text-sm font-bold uppercase">Ask AI Assistant</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-16 left-0 w-80 bg-[#2B2B2B] border border-[#404040] shadow-2xl overflow-hidden flex flex-col max-h-[400px] chamfer-accent">
          <div className="p-3 bg-[#1A1A1A] border-b border-[#404040] flex justify-between items-center">
            <span className="text-xs font-bold text-[#1791cf] tracking-widest uppercase">Gemini Copilot</span>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white"><span className="material-symbols-outlined text-sm">close</span></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 text-xs font-sans leading-relaxed text-gray-200">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="w-8 h-8 border-2 border-[#1791cf] border-t-transparent animate-spin"></div>
                <span className="text-gray-500 font-mono animate-pulse">ANALYZING GEOMETRY...</span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap">{response}</div>
            )}
          </div>
          <div className="p-2 bg-[#1a1a1a] border-t border-[#404040] text-[10px] text-gray-600 text-center uppercase tracking-tighter">
            Powered by Gemini 3 Flash
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAssistant;
