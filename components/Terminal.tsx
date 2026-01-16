
import React, { useEffect, useRef } from 'react';
import { LogMessage } from '../types';

interface TerminalProps {
  logs: LogMessage[];
  height?: number;
}

const Terminal: React.FC<TerminalProps> = ({ logs, height = 160 }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div 
      className="bg-[#0a0a0a] flex flex-col font-mono text-[11px] shrink-0 overflow-hidden"
      style={{ height: `${height}px` }}
    >
      <div className="h-6 bg-[#1a1a1a] flex items-center px-3 border-b border-[#404040] justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#1791cf]"></span>
          <span className="text-gray-400 font-bold uppercase tracking-tighter">Machine Console Output</span>
        </div>
        <div className="flex gap-2">
          <button className="text-gray-600 hover:text-gray-300">Clear</button>
          <button className="text-gray-600 hover:text-gray-300">Export</button>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin">
        {logs.length === 0 && <div className="text-gray-700 italic">Waiting for machine connection...</div>}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 group">
            <span className="text-gray-600 shrink-0">[{log.timestamp}]</span>
            <span className={`
              ${log.level === 'info' ? 'text-blue-400' : ''}
              ${log.level === 'success' ? 'text-green-400' : ''}
              ${log.level === 'warn' ? 'text-yellow-400' : ''}
              ${log.level === 'error' ? 'text-red-400' : ''}
            `}>
              {log.level.toUpperCase()}:
            </span>
            <span className="text-gray-300">{log.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Terminal;
