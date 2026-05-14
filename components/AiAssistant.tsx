
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
      {/* Carbon Primary Button – floating action */}
      <button
        onClick={analyzeGCode}
        className="bg-cds-interactive text-white p-3 shadow-lg hover:scale-105 transition-transform flex items-center justify-center group chamfer-sm"
      >
        <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">psychology</span>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap px-0 group-hover:px-2 text-body-sm font-semibold uppercase">
          Ask AI Assistant
        </span>
      </button>

      {isOpen && (
        /* Carbon Popover / Panel */
        <div className="absolute bottom-16 left-0 w-80 bg-cds-layer-01 border border-cds-border shadow-2xl overflow-hidden flex flex-col max-h-[400px] chamfer-accent">
          <div className="p-3 bg-cds-bg border-b border-cds-border flex justify-between items-center">
            <span className="text-label font-semibold text-cds-interactive tracking-widest uppercase">Gemini Copilot</span>
            <button onClick={() => setIsOpen(false)} className="text-cds-text-03 hover:text-cds-text-01 transition-colors">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 text-label font-sans leading-relaxed text-cds-text-02">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                {/* Carbon Loading Spinner */}
                <div className="w-8 h-8 border-2 border-cds-interactive border-t-transparent animate-spin"></div>
                <span className="text-cds-text-03 font-mono animate-pulse">ANALYZING GEOMETRY...</span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap">{response}</div>
            )}
          </div>
          <div className="p-2 bg-cds-bg border-t border-cds-border text-[10px] text-cds-text-04 text-center uppercase tracking-tighter">
            Powered by Gemini 3 Flash
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAssistant;
