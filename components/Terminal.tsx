
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
      className="bg-cds-bg flex flex-col font-mono text-[11px] shrink-0 overflow-hidden"
      style={{ height: `${height}px` }}
    >
      {/* Carbon $layer-01 toolbar */}
      <div className="h-6 bg-cds-layer-01 flex items-center px-3 border-b border-cds-border justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-cds-interactive"></span>
          <span className="text-cds-text-02 font-semibold uppercase tracking-tighter">Machine Console Output</span>
        </div>
        <div className="flex gap-2">
          <button className="text-cds-text-04 hover:text-cds-text-02 transition-colors">Clear</button>
          <button className="text-cds-text-04 hover:text-cds-text-02 transition-colors">Export</button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {logs.length === 0 && (
          <div className="text-cds-text-04 italic">Waiting for machine connection...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 group">
            <span className="text-cds-text-04 shrink-0">[{log.timestamp}]</span>
            <span className={`
              ${log.level === 'info'    ? 'text-cds-interactive' : ''}
              ${log.level === 'success' ? 'text-cds-success'     : ''}
              ${log.level === 'warn'    ? 'text-cds-warning'     : ''}
              ${log.level === 'error'   ? 'text-cds-error'       : ''}
            `}>
              {log.level.toUpperCase()}:
            </span>
            <span className="text-cds-text-02">{log.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Terminal;
