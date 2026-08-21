
import React, { useState } from 'react';
import { Coordinates, WcsId, WcsOffsets } from '../types';
import { WCS_IDS, JOG_STEP_OPTIONS_MM, PROBE_TIP_DIAMETER_MIN_MM, PROBE_TIP_DIAMETER_MAX_MM } from '../constants';
import { computeTrueSurfacePosition, ProbeApproach } from '../lib/machine/probing';

interface ProbingWizardProps {
  onClose: () => void;
  coords: Coordinates;
  onJog: (axis: keyof Coordinates, deltaMm: number) => void;
  wcsId: WcsId;
  onWcsIdChange: (id: WcsId) => void;
  wcsOffsets: WcsOffsets;
  onSetOffsetAxis: (id: WcsId, axis: keyof Coordinates, value: number) => void;
  probeTipDiameterMm: number;
  onProbeTipDiameterChange: (value: number) => void;
  /** True while the machine is simulating or spinning up -- jogging/probing
   * during a live cut makes no physical sense, same gating Sidebar's DRO
   * ZERO buttons already use. */
  isLocked: boolean;
}

const AXIS_COLOR: Record<keyof Coordinates, string> = { x: 'red-500', y: 'cds-success', z: 'cds-interactive' };

const AxisPanel: React.FC<{
  axis: keyof Coordinates;
  label: string;
  liveValue: number;
  currentOffset: number;
  jogStepMm: number;
  onJog: (deltaMm: number) => void;
  onSet: () => void;
  isLocked: boolean;
  approachControl?: React.ReactNode;
}> = ({ axis, label, liveValue, currentOffset, jogStepMm, onJog, onSet, isLocked, approachControl }) => (
  <div className="bg-cds-bg/60 border border-cds-border/30 p-5 chamfer-md flex flex-col gap-4 relative overflow-hidden">
    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${AXIS_COLOR[axis]}`}></div>
    <div className="flex items-center justify-between">
      <h3 className="text-cds-text-01 font-semibold text-body-sm tracking-widest uppercase">{label} Axis</h3>
      <span className="text-[9px] font-mono text-cds-text-04 uppercase tracking-tighter">Offset: {currentOffset.toFixed(3)}mm</span>
    </div>

    {approachControl}

    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onJog(-jogStepMm)}
        disabled={isLocked}
        aria-label={`Jog ${label} negative ${jogStepMm}mm`}
        className="size-9 flex items-center justify-center bg-black/40 border border-cds-border-str/40 text-cds-text-02 hover:text-cds-interactive hover:border-cds-interactive transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <span className="material-symbols-outlined text-lg" aria-hidden="true">remove</span>
      </button>
      <div className="flex-1 bg-black/40 border border-cds-border/30 h-9 flex items-center justify-center font-mono text-body-sm text-cds-text-01 tabular-nums">
        {liveValue.toFixed(3)}
      </div>
      <button
        type="button"
        onClick={() => onJog(jogStepMm)}
        disabled={isLocked}
        aria-label={`Jog ${label} positive ${jogStepMm}mm`}
        className="size-9 flex items-center justify-center bg-black/40 border border-cds-border-str/40 text-cds-text-02 hover:text-cds-interactive hover:border-cds-interactive transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <span className="material-symbols-outlined text-lg" aria-hidden="true">add</span>
      </button>
    </div>

    <button
      type="button"
      onClick={onSet}
      disabled={isLocked}
      className="h-10 bg-cds-interactive hover:bg-cds-link text-white text-[10px] font-semibold uppercase tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      <span className="material-symbols-outlined text-sm" aria-hidden="true">adjust</span>
      Trigger Probe -- Set {label} Work Zero
    </button>
  </div>
);

const ProbingWizard: React.FC<ProbingWizardProps> = ({
  onClose, coords, onJog, wcsId, onWcsIdChange, wcsOffsets, onSetOffsetAxis,
  probeTipDiameterMm, onProbeTipDiameterChange, isLocked,
}) => {
  const [jogStepMm, setJogStepMm] = useState(1);
  const [xApproach, setXApproach] = useState<ProbeApproach>('positive');
  const [yApproach, setYApproach] = useState<ProbeApproach>('positive');

  const offsets = wcsOffsets[wcsId];

  const handleSetAxis = (axis: keyof Coordinates, approach: ProbeApproach) => {
    const trueValue = computeTrueSurfacePosition(coords[axis], probeTipDiameterMm, approach);
    onSetOffsetAxis(wcsId, axis, trueValue);
  };

  return (
    <div className="fixed inset-0 bg-cds-bg/90 backdrop-blur-2xl z-[150] flex items-center justify-center p-8 animate-in fade-in duration-300">
      <div role="dialog" aria-modal="true" aria-labelledby="probing-wizard-title" className="w-full h-full max-w-[1400px] bg-cds-layer-01 border border-cds-border/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden chamfer-lg relative">

        <div className="absolute inset-0 opacity-[0.03] pointer-events-none hex-bg"></div>

        {/* Header */}
        <div className="h-16 px-8 bg-black/40 border-b border-cds-border/30 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-cds-interactive text-2xl" aria-hidden="true">center_focus_strong</span>
            <div>
              <h1 id="probing-wizard-title" className="font-display text-cds-text-01 font-semibold text-body-sm tracking-[0.3em] uppercase leading-tight">TOUCH-OFF WIZARD</h1>
              <p className="text-[9px] text-cds-text-04 font-mono tracking-widest uppercase">Edge / Surface Probing // Work Coordinate Setup</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 bg-black/40 border border-cds-border/30 px-2 h-9">
              <span className="text-[9px] text-cds-text-04 uppercase tracking-widest shrink-0">WCS</span>
              <select
                value={wcsId}
                onChange={(e) => onWcsIdChange(e.target.value as WcsId)}
                aria-label="Work coordinate system to set"
                className="bg-transparent text-[11px] font-mono text-cds-interactive outline-none"
              >
                {WCS_IDS.map(id => <option key={id} value={id}>{id}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-1.5 bg-black/40 border border-cds-border/30 px-2 h-9">
              <span className="text-[9px] text-cds-text-04 uppercase tracking-widest shrink-0">Probe &oslash;</span>
              <input
                type="number"
                step="0.1"
                min={PROBE_TIP_DIAMETER_MIN_MM}
                max={PROBE_TIP_DIAMETER_MAX_MM}
                value={probeTipDiameterMm}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!Number.isNaN(value)) onProbeTipDiameterChange(value);
                }}
                aria-label="Probe tip diameter, mm"
                className="w-14 bg-transparent text-[11px] font-mono text-cds-text-01 outline-none"
              />
              <span className="text-[9px] text-cds-text-04 shrink-0">mm</span>
            </label>
            <button
              onClick={onClose}
              className="size-10 flex items-center justify-center bg-white/5 hover:bg-cds-error/20 hover:text-cds-error transition-all group"
              aria-label="Close Touch-Off Wizard"
            >
              <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform" aria-hidden="true">close</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8 z-10">
          {isLocked && (
            <div className="flex items-center gap-3 p-4 border border-cds-warning/30 bg-cds-warning/10 chamfer-sm mb-6">
              <span className="material-symbols-outlined text-cds-warning" aria-hidden="true">warning</span>
              <p className="text-[11px] text-cds-warning">Jog and probe controls are locked while the machine is simulating.</p>
            </div>
          )}

          <div className="mb-6 flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-cds-text-01 font-semibold text-lg tracking-[0.1em] uppercase">Probe {wcsId}</h2>
              <p className="text-[10px] text-cds-text-03 font-mono tracking-widest uppercase mt-1">
                Jog to touch, then trigger -- the true surface is one probe radius from where the ball reports contact
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-cds-text-04 uppercase tracking-widest">Jog Step</span>
              {JOG_STEP_OPTIONS_MM.map(step => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setJogStepMm(step)}
                  aria-pressed={jogStepMm === step}
                  className={`h-8 px-3 text-[10px] font-mono border transition-colors ${
                    jogStepMm === step
                      ? 'bg-cds-interactive/20 border-cds-interactive text-cds-interactive'
                      : 'bg-black/40 border-cds-border/30 text-cds-text-03 hover:border-cds-interactive/50'
                  }`}
                >
                  {step}mm
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <AxisPanel
              axis="x"
              label="X"
              liveValue={coords.x}
              currentOffset={offsets.x}
              jogStepMm={jogStepMm}
              onJog={(delta) => onJog('x', delta)}
              onSet={() => handleSetAxis('x', xApproach)}
              isLocked={isLocked}
              approachControl={
                <div className="flex border border-cds-border/30" role="group" aria-label="X probe approach direction">
                  <button
                    type="button"
                    onClick={() => setXApproach('negative')}
                    aria-pressed={xApproach === 'negative'}
                    aria-label="Set X probe approach to -X"
                    className={`flex-1 h-8 text-[10px] font-mono uppercase transition-colors ${xApproach === 'negative' ? 'bg-cds-interactive/20 text-cds-interactive' : 'text-cds-text-04 hover:text-cds-text-01'}`}
                  >
                    &larr; -X
                  </button>
                  <button
                    type="button"
                    onClick={() => setXApproach('positive')}
                    aria-pressed={xApproach === 'positive'}
                    aria-label="Set X probe approach to +X"
                    className={`flex-1 h-8 text-[10px] font-mono uppercase transition-colors border-l border-cds-border/30 ${xApproach === 'positive' ? 'bg-cds-interactive/20 text-cds-interactive' : 'text-cds-text-04 hover:text-cds-text-01'}`}
                  >
                    +X &rarr;
                  </button>
                </div>
              }
            />
            <AxisPanel
              axis="y"
              label="Y"
              liveValue={coords.y}
              currentOffset={offsets.y}
              jogStepMm={jogStepMm}
              onJog={(delta) => onJog('y', delta)}
              onSet={() => handleSetAxis('y', yApproach)}
              isLocked={isLocked}
              approachControl={
                <div className="flex border border-cds-border/30" role="group" aria-label="Y probe approach direction">
                  <button
                    type="button"
                    onClick={() => setYApproach('negative')}
                    aria-pressed={yApproach === 'negative'}
                    aria-label="Set Y probe approach to -Y"
                    className={`flex-1 h-8 text-[10px] font-mono uppercase transition-colors ${yApproach === 'negative' ? 'bg-cds-interactive/20 text-cds-interactive' : 'text-cds-text-04 hover:text-cds-text-01'}`}
                  >
                    &larr; -Y
                  </button>
                  <button
                    type="button"
                    onClick={() => setYApproach('positive')}
                    aria-pressed={yApproach === 'positive'}
                    aria-label="Set Y probe approach to +Y"
                    className={`flex-1 h-8 text-[10px] font-mono uppercase transition-colors border-l border-cds-border/30 ${yApproach === 'positive' ? 'bg-cds-interactive/20 text-cds-interactive' : 'text-cds-text-04 hover:text-cds-text-01'}`}
                  >
                    +Y &rarr;
                  </button>
                </div>
              }
            />
            <AxisPanel
              axis="z"
              label="Z"
              liveValue={coords.z}
              currentOffset={offsets.z}
              jogStepMm={jogStepMm}
              onJog={(delta) => onJog('z', delta)}
              onSet={() => handleSetAxis('z', 'negative')}
              isLocked={isLocked}
              approachControl={
                <div className="h-8 flex items-center px-2 border border-cds-border/30 text-[10px] font-mono uppercase text-cds-text-04">
                  &darr; -Z onto top surface
                </div>
              }
            />
          </div>

          <div className="bg-black/20 border border-cds-border/20 p-5 chamfer-sm">
            <h2 className="text-cds-text-01 font-semibold text-body-sm tracking-[0.1em] uppercase mb-3">How This Works</h2>
            <p className="text-[11px] text-cds-text-03 leading-relaxed">
              Jog each axis until the probe ball would just be touching the part, then trigger. A touch probe reports where its
              ball CENTER was at contact, not the true surface -- so each axis is compensated by one probe radius
              (&Oslash;{probeTipDiameterMm.toFixed(3)}mm &divide; 2 = {(probeTipDiameterMm / 2).toFixed(3)}mm) in the direction the probe was traveling. X/Y let you pick
              which side you're probing from; Z always probes downward onto a top surface. This is the same compensation a
              real edge-finder or touch-trigger probe cycle performs automatically -- more precise than the DRO's plain
              ZERO button, which assumes zero tool/probe radius.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="h-10 bg-cds-bg px-8 border-t border-cds-border/30 flex items-center justify-between text-[9px] font-mono text-cds-text-04 tracking-[0.2em] uppercase shrink-0">
          <div className="flex gap-8">
            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-cds-success"></div> PROBE_LINK: READY</span>
            <span>TIP &Oslash;{probeTipDiameterMm.toFixed(3)}mm // RADIUS {(probeTipDiameterMm / 2).toFixed(3)}mm</span>
          </div>
          <div>TARGET: {wcsId}</div>
        </div>
      </div>
    </div>
  );
};

export default ProbingWizard;
