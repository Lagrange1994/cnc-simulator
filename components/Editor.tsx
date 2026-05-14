
import React from 'react';
import { GCodeLine } from '../types';

interface EditorProps {
  lines: GCodeLine[];
  activeLineIndex: number;
}

const Editor: React.FC<EditorProps> = ({ lines, activeLineIndex }) => {
  return (
    <aside className="flex-1 flex flex-col bg-cds-bg overflow-hidden">
      {/* Carbon $layer-01 toolbar */}
      <div className="h-10 bg-cds-layer-01 flex items-center justify-between px-4 border-b border-cds-border shrink-0">
        <h3 className="text-body-sm font-semibold text-cds-text-01 uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-cds-interactive">code</span>
          G-Code Editor
        </h3>
        <div className="flex gap-1">
          <button className="p-1 hover:text-cds-text-01 text-cds-text-03 transition-colors">
            <span className="material-symbols-outlined text-sm">upload_file</span>
          </button>
          <button className="p-1 hover:text-cds-text-01 text-cds-text-03 transition-colors">
            <span className="material-symbols-outlined text-sm">save</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto font-mono text-body-sm relative">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-cds-bg border-b border-cds-border shadow-sm">
            <tr>
              <th className="w-12 py-2 text-center text-label text-cds-text-04 font-normal select-none">#</th>
              <th className="py-2 pl-4 text-label text-cds-text-04 font-normal">Command</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cds-border/20">
            {lines.map((line, index) => {
              const isActive = index === activeLineIndex;
              return (
                <tr
                  key={line.id}
                  className={`${isActive ? 'bg-cds-layer-02/50 text-cds-text-01' : 'text-cds-text-03 hover:bg-white/5'} group relative`}
                >
                  {/* Line number gutter – Carbon $layer-01 */}
                  <td className={`text-right pr-3 py-1.5 text-label select-none border-r border-cds-border/20 ${
                    isActive ? 'text-cds-interactive font-semibold bg-cds-layer-02' : 'text-cds-text-04 bg-cds-layer-01'
                  }`}>
                    {line.lineNum}
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cds-interactive"></div>}
                  </td>
                  <td className="pl-4 py-1.5">
                    {/* G-code command tokens – keep yellow syntax highlight */}
                    <span className="text-cds-warning font-semibold">{line.command}</span>
                    <span className="ml-2 font-medium text-cds-text-02">{line.params}</span>
                    {line.comment && (
                      <span className="text-cds-text-04 text-label italic ml-2">({line.comment})</span>
                    )}
                    {isActive && (
                      <span className="animate-pulse inline-block w-2 h-4 bg-cds-interactive align-middle ml-1"></span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Status bar – Carbon $layer-01 */}
      <div className="h-8 bg-cds-layer-01 border-t border-cds-border flex items-center px-4 justify-between text-[10px] text-cds-text-04 font-mono uppercase shrink-0">
        <span>Total Lines: {lines.length}</span>
        <span>Encoding: UTF-8</span>
      </div>
    </aside>
  );
};

export default Editor;
