import React from 'react';

interface InfoTooltipProps {
  children: React.ReactNode;
}

/* Carbon Tooltip — info glyph that reveals an explanation on hover/focus, for terms a
   non-specialist viewer wouldn't know without derailing the layout with inline copy */
const InfoTooltip: React.FC<InfoTooltipProps> = ({ children }) => (
  <span className="relative inline-flex group/tooltip">
    <button
      type="button"
      tabIndex={0}
      className="text-cds-text-04 hover:text-cds-interactive focus:text-cds-interactive transition-colors"
      aria-label="More information"
    >
      <span className="material-symbols-outlined text-sm align-middle">info</span>
    </button>
    <span className="pointer-events-none absolute left-1/2 bottom-full -translate-x-1/2 mb-2 w-64 bg-black border border-cds-border-str/50 text-cds-text-02 text-[9px] leading-relaxed p-3 chamfer-sm shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:visible transition-opacity z-30 normal-case tracking-normal font-normal">
      {children}
    </span>
  </span>
);

export default InfoTooltip;
