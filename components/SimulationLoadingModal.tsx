import React, { useEffect, useState } from 'react';

const LOADING_MESSAGES = [
  'INITIALIZING TOOLPATH SOLVER...',
  'CALCULATING TOOL DEFLECTION...',
  'ESTIMATING SURFACE ROUGHNESS Ra...',
];

const TOTAL_DURATION_MS = 1500;
const MESSAGE_INTERVAL_MS = TOTAL_DURATION_MS / LOADING_MESSAGES.length;

interface SimulationLoadingModalProps {
  isOpen: boolean;
  /** Fires exactly once, ~1.5s after isOpen becomes true. */
  onComplete: () => void;
}

/**
 * Brief "computing" theater shown between CYCLE START and the real
 * simulation starting -- self-contained (owns its own message-sequencing
 * timer internally), but its isOpen boolean is lifted to App.tsx so it can
 * participate in the same isFullScreenModalOpen background-hiding pattern
 * as FileManager/HelpManager/SettingsManager.
 */
const SimulationLoadingModal: React.FC<SimulationLoadingModalProps> = ({ isOpen, onComplete }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setMessageIndex(0);
      return;
    }

    const messageTimer = setInterval(() => {
      setMessageIndex(prev => Math.min(prev + 1, LOADING_MESSAGES.length - 1));
    }, MESSAGE_INTERVAL_MS);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, TOTAL_DURATION_MS);

    return () => {
      clearInterval(messageTimer);
      clearTimeout(completeTimer);
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-cds-bg/90 backdrop-blur-md z-[200] flex items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="w-80 bg-cds-layer-01 border border-cds-interactive/40 chamfer-lg p-8 flex flex-col items-center gap-4 shadow-[0_0_40px_rgba(69,137,255,0.2)]">
        {/* No rounded-full: this app's global `* { border-radius: 0 }` industrial
            aesthetic already turns every spinner into a rotating square frame
            (see AiAssistant.tsx's loading spinner for the same pattern). */}
        <div className="w-10 h-10 border-2 border-cds-interactive border-t-transparent animate-spin" />
        <span className="text-cds-text-02 text-[11px] font-mono uppercase tracking-widest text-center">
          {LOADING_MESSAGES[messageIndex]}
        </span>
      </div>
    </div>
  );
};

export default SimulationLoadingModal;
