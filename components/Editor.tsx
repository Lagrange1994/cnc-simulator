
import React from 'react';
import { GCodeLine } from '../types';

interface EditorProps {
  lines: GCodeLine[];
  activeLineIndex: number;
}

const Editor: React.FC<EditorProps> = ({ lines, activeLineIndex }) => {
  return (
    <aside className="flex-1 flex flex-col bg-[#141414] overflow-hidden">
      <div className="h-10 bg-[#2B2B2B]/80 flex items-center justify-between px-4 border-b border-[#404040] backdrop-blur-sm shrink-0">
        <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-[#1791cf]">code</span>
          G-Code Editor
        </h3>
        <div className="flex gap-1">
          <button className="p-1 hover:text-white text-gray-500"><span className="material-symbols-outlined text-sm">upload_file</span></button>
          <button className="p-1 hover:text-white text-gray-500"><span className="material-symbols-outlined text-sm">save</span></button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto font-mono text-sm relative">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-[#141414] border-b border-[#404040] shadow-sm">
            <tr>
              <th className="w-12 py-2 text-center text-xs text-gray-600 font-normal select-none">#</th>
              <th className="py-2 pl-4 text-xs text-gray-600 font-normal">Command</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {lines.map((line, index) => {
              const isActive = index === activeLineIndex;
              return (
                <tr 
                  key={line.id} 
                  className={`${isActive ? 'bg-[#3D3D3D]/50 text-white' : 'text-gray-400 hover:bg-white/5'} group relative`}
                >
                  <td className={`text-right pr-3 py-1.5 text-xs select-none border-r border-white/5 ${isActive ? 'text-[#1791cf] font-bold bg-[#3D3D3D]' : 'text-gray-600 bg-[#181818]'}`}>
                    {line.lineNum}
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1791cf]"></div>}
                  </td>
                  <td className="pl-4 py-1.5">
                    <span className={`${isActive ? 'text-yellow-500 font-bold' : 'text-yellow-500'}`}>{line.command}</span>
                    <span className="ml-2 font-medium">{line.params}</span>
                    {line.comment && (
                      <span className="text-gray-600 text-xs italic ml-2">({line.comment})</span>
                    )}
                    {isActive && <span className="animate-pulse inline-block w-2 h-4 bg-[#1791cf] align-middle ml-1"></span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="h-8 bg-[#111] border-t border-[#404040] flex items-center px-4 justify-between text-[10px] text-gray-500 font-mono uppercase shrink-0">
        <span>Total Lines: {lines.length}</span>
        <span>Encoding: UTF-8</span>
      </div>
    </aside>
  );
};

export default Editor;
