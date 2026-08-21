
import React from 'react';
import { Coordinates, MachineStatus, Tool, CuttingParams, Overrides, WcsId } from '../types';
import { ProgramSummary } from '../lib/gcode/parser';
import { MACHINE_SPEC, loadFillPercent } from '../lib/machine/spec';
import { formatHoursMinutes } from '../lib/format';
import { MATERIALS, getMaterial, midpoint, parseToolDiameterMm, estimateRpm, estimatePowerKw } from '../lib/machine/materials';
import { OVERRIDE_PCT_MIN, OVERRIDE_PCT_MAX, OVERRIDE_PCT_STEP, WCS_IDS } from '../constants';
import CuttingResult from './CuttingResult';
import InfoTooltip from './InfoTooltip';

interface SidebarProps {
  coords: Coordinates;
  status: MachineStatus;
  activeTool: Tool;
  nextTool: Tool;
  programSummary: ProgramSummary;
  onCycleStart: () => void;
  onFeedHold: () => void;
  onReset: () => void;
  cuttingParams: CuttingParams;
  onCuttingParamsChange: (patch: Partial<CuttingParams>) => void;
  overrides: Overrides;
  onOverridesChange: (patch: Partial<Overrides>) => void;
  /** Active Work Coordinate System (G54-G59) and its stored offset. The DRO
   * shows `coords` (machine position) minus this offset ("work position");
   * onZeroAxis captures the current machine position into the offset for
   * one axis, the real touch-off workflow. */
  activeWcsId: WcsId;
  onActiveWcsIdChange: (id: WcsId) => void;
  wcsOffset: Coordinates;
  onZeroAxis: (axis: keyof Coordinates) => void;
  /** True during the ~1.5s fake-computing window between clicking CYCLE
   * START and the real simulation starting (see App.tsx's isCycleLoadingOpen). */
  isPreparingCycle: boolean;
  /** Opens the Touch-Off Wizard (probe-compensated WCS setup). */
  onOpenProbingWizard?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  coords, status, activeTool, nextTool, programSummary,
  onCycleStart, onFeedHold, onReset,
  cuttingParams, onCuttingParamsChange,
  overrides, onOverridesChange,
  activeWcsId, onActiveWcsIdChange, wcsOffset, onZeroAxis,
  isPreparingCycle, onOpenProbingWizard
}) => {
  const isCuttingLocked = status.isSimulating || isPreparingCycle;
  const selectedMaterial = getMaterial(cuttingParams.materialId);
  const toolDiameterMm = parseToolDiameterMm(activeTool.diameter);
  const estimatedRpm = estimateRpm(cuttingParams.vcMPerMin, toolDiameterMm);
  const estimatedPowerKw = estimatePowerKw(selectedMaterial.cuttingForceN, cuttingParams.vcMPerMin);
  // Effective (actual) speed shown on the DRO = programmed value x override%,
  // same relationship a physical override dial has to a real DRO reading.
  const effectiveSpindleRpm = Math.round(status.spindleRpm * overrides.spindlePct / 100);
  const effectiveFeedRate = Math.round(status.feedRate * overrides.feedPct / 100);
  // Work position = machine position minus the active WCS offset.
  const workCoords: Coordinates = {
    x: coords.x - wcsOffset.x,
    y: coords.y - wcsOffset.y,
    z: coords.z - wcsOffset.z,
  };

  const handleMaterialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const material = getMaterial(e.target.value);
    onCuttingParamsChange({
      materialId: material.id,
      vcMPerMin: midpoint(material.vcRangeMPerMin),
      feedMmPerMin: midpoint(material.feedRangeMmPerMin),
    });
  };

  const clampVc = (value: number) => {
    const [min, max] = selectedMaterial.vcRangeMPerMin;
    return Math.min(max, Math.max(min, value));
  };

  const handleVcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (Number.isNaN(value)) return;
    onCuttingParamsChange({ vcMPerMin: clampVc(value) });
  };
  return (
    <aside className="flex-1 flex flex-col bg-cds-bg border-cds-border shadow-xl z-20 overflow-hidden">
      <div className="flex-1 overflow-y-auto">

        {/* Digital Read Out (DRO) and live Status are the two values an
            operator needs without scrolling (Z depth is the #1 crash-risk
            number) — render them first so they survive short viewports
            (1280x720 laptops clip anything below ~470px here). CuttingResult
            (pre-flight summary) and Tooling detail are lower urgency, so
            they sit below and absorb the scroll. */}
        <div className="p-4 border-b border-cds-border bg-cds-layer-01">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-label font-semibold text-cds-text-03 uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-sm" aria-hidden="true">my_location</span> Coordinates
            </h2>
            {/* Active Work Coordinate System -- the DRO below is relative to
                whichever WCS is selected here, not raw machine position. */}
            <div className="flex items-center gap-1.5">
              <select
                value={activeWcsId}
                onChange={(e) => onActiveWcsIdChange(e.target.value as WcsId)}
                aria-label="Active work coordinate system"
                className="h-6 bg-black/40 border border-cds-border-str/40 px-1.5 text-[10px] font-mono text-cds-interactive outline-none focus:border-cds-interactive"
              >
                {WCS_IDS.map(id => <option key={id} value={id}>{id}</option>)}
              </select>
              <button
                type="button"
                onClick={onOpenProbingWizard}
                title="Touch-Off Wizard (probe-compensated WCS setup)"
                aria-label="Open Touch-Off Wizard"
                className="size-6 flex items-center justify-center bg-black/40 border border-cds-border-str/40 text-cds-text-04 hover:text-cds-interactive hover:border-cds-interactive transition-colors"
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">center_focus_strong</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 font-mono">
            <DROField label="X" value={workCoords.x} color="red-500" onZero={() => onZeroAxis('x')} zeroDisabled={isCuttingLocked} />
            <DROField label="Y" value={workCoords.y} color="cds-success" onZero={() => onZeroAxis('y')} zeroDisabled={isCuttingLocked} />
            <DROField label="Z" value={workCoords.z} color="cds-interactive" onZero={() => onZeroAxis('z')} zeroDisabled={isCuttingLocked} />
          </div>
        </div>

        {/* Machine Status */}
        <div className="p-4 border-b border-cds-border">
          <h2 className="text-label font-semibold text-cds-text-03 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm" aria-hidden="true">speed</span> Status
          </h2>
          {/* Override sliders are deliberately NOT gated by isCuttingLocked:
              riding the override live during a cut is the entire point of the
              dial on a real control (unlike Cutting Parameters below, which
              locks because swapping material mid-cut makes no physical sense). */}
          <div className="grid grid-cols-2 gap-3">
            <StatusCard
              label="Spindle (RPM)" value={effectiveSpindleRpm.toLocaleString()}
              fillPercent={loadFillPercent(effectiveSpindleRpm, MACHINE_SPEC.maxSpindleRpm)} color="white"
              overridePct={overrides.spindlePct} overrideLabel="OVR"
              onOverrideChange={(v) => onOverridesChange({ spindlePct: v })}
            />
            <StatusCard
              label="Feed (mm/m)" value={effectiveFeedRate}
              fillPercent={loadFillPercent(effectiveFeedRate, MACHINE_SPEC.maxFeedRateMmPerMin)} color="interactive"
              overridePct={overrides.feedPct} overrideLabel="OVR"
              onOverrideChange={(v) => onOverridesChange({ feedPct: v })}
            />
          </div>
        </div>

        <CuttingResult summary={programSummary} />

        {/* Tools Section */}
        <div className="flex-1 flex flex-col p-6">
          <h2 className="text-label font-semibold text-cds-text-03 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm" aria-hidden="true">handyman</span> Tooling
          </h2>

          {/* Active Tool – Carbon $layer-02 */}
          <div className="bg-cds-layer-01 border border-cds-border p-4 flex gap-4 items-center shrink-0">
            <div className="w-12 h-12 bg-white/5 flex items-center justify-center border border-cds-border-str/30 shrink-0">
              <span className="material-symbols-outlined text-cds-text-02" aria-hidden="true">construction</span>
            </div>
            <div className="min-w-0">
              <div className="text-cds-interactive font-semibold font-mono text-body-sm truncate">{activeTool.id}</div>
              <div className="text-cds-text-01 text-body-sm font-medium truncate">{activeTool.name}</div>
              <div className="text-cds-text-04 text-label mt-0.5 truncate">D: {activeTool.diameter} | L: {activeTool.length}</div>
            </div>
          </div>

          {/* Cutting Parameters — illustrative pre-flight values (material
              picked -> Vc/RPM/Power auto-fill via lib/machine/materials.ts),
              NOT a measured/G-code-derived stat like CuttingResult above.
              The CONCEPT badge marks that distinction explicitly. */}
          <div className="mt-4 bg-cds-layer-01 border border-cds-border p-4 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] uppercase text-cds-text-04 font-semibold px-1">Cutting Parameters</div>
              <span className="text-[8px] font-mono uppercase tracking-widest text-cds-warning bg-cds-warning/10 border border-cds-warning/30 px-1.5 py-0.5">
                Concept
              </span>
            </div>

            <select
              value={cuttingParams.materialId}
              onChange={handleMaterialChange}
              disabled={isCuttingLocked}
              aria-label="Workpiece material"
              className="w-full h-9 bg-black/40 border border-cds-border/30 px-2 text-label font-mono text-cds-text-02 outline-none focus:border-cds-interactive disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              {MATERIALS.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>

            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="vc-input" className="text-[9px] text-cds-text-04 uppercase font-semibold">Cutting Speed (Vc)</label>
                <input
                  id="vc-input"
                  type="number"
                  value={Math.round(cuttingParams.vcMPerMin)}
                  min={selectedMaterial.vcRangeMPerMin[0]}
                  max={selectedMaterial.vcRangeMPerMin[1]}
                  disabled={isCuttingLocked}
                  onChange={handleVcChange}
                  className="w-16 h-6 bg-black/40 border border-cds-border/30 text-right text-[10px] font-mono text-cds-interactive px-1 outline-none focus:border-cds-interactive disabled:opacity-50"
                />
              </div>
              <input
                type="range"
                min={selectedMaterial.vcRangeMPerMin[0]}
                max={selectedMaterial.vcRangeMPerMin[1]}
                value={cuttingParams.vcMPerMin}
                disabled={isCuttingLocked}
                onChange={handleVcChange}
                aria-label="Cutting speed slider"
                className="w-full accent-[#4589ff] disabled:opacity-50"
              />
              <div className="text-[8px] text-cds-text-04 font-mono mt-0.5">
                m/min &middot; recommended {selectedMaterial.vcRangeMPerMin[0]}&ndash;{selectedMaterial.vcRangeMPerMin[1]}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/40 p-2 border border-cds-border/20">
                <div className="text-[8px] text-cds-text-04 uppercase">Spindle Speed</div>
                <div className="text-body-sm font-mono text-cds-text-01">
                  {estimatedRpm.toLocaleString()} <span className="text-[9px] text-cds-text-04">rpm</span>
                </div>
              </div>
              <div className="bg-black/40 p-2 border border-cds-border/20">
                <div className="flex items-center gap-1 text-[8px] text-cds-text-04 uppercase">
                  Cutting Power
                  <InfoTooltip>P = Fc &times; Vc / 60000 &mdash; cutting force (Fc, N) times cutting speed (Vc, m/min), scaled to kW.</InfoTooltip>
                </div>
                <div className="text-body-sm font-mono text-cds-text-01">
                  {estimatedPowerKw.toFixed(2)} <span className="text-[9px] text-cds-text-04">kW</span>
                </div>
              </div>
            </div>
          </div>

          {/* Next Tool Preview */}
          <div className="mt-4 opacity-60 shrink-0">
            <div className="text-[10px] uppercase text-cds-text-04 font-semibold mb-2 px-1">Next Up</div>
            <div className="bg-cds-layer-01/50 border border-white/5 p-3 flex gap-3 items-center">
              <div className="w-8 h-8 bg-white/5 flex items-center justify-center border border-cds-border/30 shrink-0">
                <span className="material-symbols-outlined text-cds-text-03 text-sm" aria-hidden="true">circle</span>
              </div>
              <div className="min-w-0">
                <div className="text-cds-text-02 font-semibold font-mono text-label truncate">{nextTool.id}</div>
                <div className="text-cds-text-03 text-label font-medium truncate">{nextTool.name}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Actions – Carbon Primary / Ghost buttons */}
      <div className="p-6 bg-cds-layer-01 border-t border-cds-border shrink-0">
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Carbon Primary Button – $interactive */}
          <button
            onClick={onCycleStart}
            disabled={status.isSimulating || isPreparingCycle}
            className={`col-span-2 h-16 font-bold text-xl flex items-center justify-center gap-3 transition-all chamfer-lg active:scale-[0.98] ${
              status.isSimulating || isPreparingCycle
                ? 'bg-cds-layer-02 cursor-not-allowed opacity-50 text-cds-text-04'
                : 'bg-cds-interactive hover:bg-cds-link text-white shadow-[0_0_20px_rgba(69,137,255,0.4)]'
            }`}
          >
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">play_arrow</span>
            CYCLE START
          </button>
          {/* Carbon Ghost Button */}
          <button
            onClick={onFeedHold}
            className="h-11 relative chamfer-sm chamfer-border bg-cds-border-str/40 before:bg-cds-layer-02 hover:before:bg-cds-layer-03 text-cds-text-01 font-medium text-body-sm flex items-center justify-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-cds-warning text-[18px]" aria-hidden="true">pause</span>
            FEED HOLD
          </button>
          <button
            onClick={onReset}
            className="h-11 relative chamfer-sm chamfer-border bg-cds-border-str/40 hover:bg-cds-error/50 before:bg-cds-layer-02 hover:before:bg-red-900/30 text-cds-text-01 font-medium text-body-sm flex items-center justify-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-cds-error text-[18px]" aria-hidden="true">stop</span>
            RESET
          </button>
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-cds-border">
          <span className="text-[10px] text-cds-text-04 font-mono">EST TIME: {formatHoursMinutes(programSummary.totalDurationMs)}</span>
          <span className="text-[10px] text-cds-text-04 font-mono whitespace-nowrap">
            COOLANT: <span className={`font-semibold ${status.coolant ? 'text-cds-interactive' : 'text-cds-text-04'}`}>
              {status.coolant ? 'ON' : 'OFF'}
            </span>
          </span>
        </div>
      </div>
    </aside>
  );
};

/** Fixed-width DRO string, sign-aware: padStart on a signed toFixed() string
 * would push zeros in front of the minus sign ("-5.000" -> "00-5.000").
 * Work coordinates go negative routinely once a WCS offset is set (Zero X
 * on one side of the part puts the other side below zero), so this isn't a
 * hypothetical -- format the magnitude, then prepend the sign. */
function formatDroValue(value: number): string {
  const sign = value < 0 ? '-' : '';
  return sign + Math.abs(value).toFixed(3).padStart(sign ? 7 : 8, '0');
}

const DROField: React.FC<{
  label: string; value: number; color: string;
  onZero?: () => void; zeroDisabled?: boolean;
}> = ({ label, value, color, onZero, zeroDisabled }) => (
  <div className="flex items-center justify-between bg-black/40 border border-cds-border/30 p-2 relative overflow-hidden group">
    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${color}`}></div>
    <span className="text-cds-text-03 text-base font-semibold">{label}</span>
    <span className={`text-2xl font-medium tracking-tight text-cds-text-01 group-hover:text-${color} transition-colors tabular-nums font-mono`}>
      {formatDroValue(value)}
    </span>
    <span className="text-label text-cds-text-03">mm</span>
    {onZero && (
      <button
        type="button"
        onClick={onZero}
        disabled={zeroDisabled}
        aria-label={`Zero ${label} axis (set current position as work zero)`}
        title={`Zero ${label}`}
        className="ml-1.5 shrink-0 text-[9px] font-mono px-1 py-0.5 border border-cds-border-str/40 text-cds-text-04 hover:text-cds-text-01 hover:border-cds-interactive transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ZERO
      </button>
    )}
  </div>
);

/** Status card showing a live DRO value (Spindle/Feed) plus, when
 * `overridePct`/`onOverrideChange` are given, a compact override slider
 * paired directly under it -- one card per metric, not a separate row, so
 * this stays inside the sidebar's above-the-fold budget (see Sidebar's
 * component-level comment on DRO/Status ordering). Deliberately has no
 * `disabled` prop on the slider: riding the override live during a cut is
 * the entire point of the dial on a real control. */
const StatusCard: React.FC<{
  label: string; value: string | number; fillPercent: number; color: string;
  overridePct?: number; overrideLabel?: string; onOverrideChange?: (value: number) => void;
}> = ({ label, value, fillPercent, color, overridePct, overrideLabel, onOverrideChange }) => {
  const isModified = overridePct !== undefined && overridePct !== 100;
  return (
    <div className="bg-cds-layer-02 p-2 border border-cds-border/30 overflow-hidden">
      <div className="text-[10px] uppercase text-cds-text-03 mb-0.5 truncate">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-mono text-cds-text-01 tabular-nums">{value}</span>
      </div>
      <div className="w-full bg-black/40 h-1 mt-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${color === 'interactive' ? 'bg-cds-interactive' : 'bg-cds-text-01'}`}
          style={{ width: `${fillPercent}%` }}
        ></div>
      </div>
      {overridePct !== undefined && onOverrideChange && (
        <div className="mt-1.5 pt-1.5 border-t border-white/5 flex items-center gap-1.5">
          <span className="text-[8px] uppercase text-cds-text-04 shrink-0">{overrideLabel}</span>
          <input
            type="range"
            min={OVERRIDE_PCT_MIN}
            max={OVERRIDE_PCT_MAX}
            step={OVERRIDE_PCT_STEP}
            value={overridePct}
            onChange={(e) => onOverrideChange(Number(e.target.value))}
            aria-label={`${label} override slider`}
            className="w-full accent-[#4589ff]"
          />
          <span className={`text-[10px] font-mono tabular-nums shrink-0 ${isModified ? 'text-cds-warning' : 'text-cds-text-04'}`}>
            {overridePct}%
          </span>
          <button
            type="button"
            onClick={() => onOverrideChange(100)}
            disabled={!isModified}
            aria-label={`Reset ${label} override to 100%`}
            className="text-[8px] font-mono px-1 shrink-0 border border-cds-border-str/40 text-cds-text-04 hover:text-cds-text-01 hover:border-cds-interactive transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            100%
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
