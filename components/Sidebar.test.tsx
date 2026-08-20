import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from './Sidebar';
import { Coordinates, MachineStatus, Tool, CuttingParams } from '../types';
import { ProgramSummary } from '../lib/gcode/parser';
import { DEFAULT_CUTTING_PARAMS } from '../constants';
import { getMaterial, midpoint } from '../lib/machine/materials';

const coords: Coordinates = { x: 1, y: 2, z: 3 };
const programSummary: ProgramSummary = {
  totalDurationMs: 45000,
  totalToolpathLengthMm: 200,
  peakSpindleRpm: 12000,
  peakFeedRateMmPerMin: 1200,
};
const status: MachineStatus = {
  spindleRpm: 0,
  feedRate: 1200,
  isSimulating: false,
  progress: 0,
  activeLineIndex: 0,
  coolant: false,
};
const activeTool: Tool = { id: 'T1', name: 'Flat End Mill', diameter: '6.0mm', length: '50mm', type: 'End Mill' };
const nextTool: Tool = { id: 'T2', name: 'Ball Nose 3mm', diameter: '3.0mm', length: '45mm', type: 'Ball Nose' };

function renderSidebar(
  statusOverride: Partial<MachineStatus> = {},
  cuttingParamsOverride: Partial<CuttingParams> = {},
  isPreparingCycle = false
) {
  const onCycleStart = vi.fn();
  const onFeedHold = vi.fn();
  const onReset = vi.fn();
  const onCuttingParamsChange = vi.fn();
  const { container } = render(
    <Sidebar
      coords={coords}
      status={{ ...status, ...statusOverride }}
      activeTool={activeTool}
      nextTool={nextTool}
      programSummary={programSummary}
      onCycleStart={onCycleStart}
      onFeedHold={onFeedHold}
      onReset={onReset}
      cuttingParams={{ ...DEFAULT_CUTTING_PARAMS, ...cuttingParamsOverride }}
      onCuttingParamsChange={onCuttingParamsChange}
      isPreparingCycle={isPreparingCycle}
    />
  );
  return { onCycleStart, onFeedHold, onReset, onCuttingParamsChange, container };
}

describe('Sidebar', () => {
  it('fires onCycleStart, onFeedHold, and onReset when their buttons are clicked', async () => {
    const user = userEvent.setup();
    const { onCycleStart, onFeedHold, onReset } = renderSidebar();

    await user.click(screen.getByText('CYCLE START'));
    expect(onCycleStart).toHaveBeenCalledTimes(1);

    await user.click(screen.getByText('FEED HOLD'));
    expect(onFeedHold).toHaveBeenCalledTimes(1);

    await user.click(screen.getByText('RESET'));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('disables the CYCLE START button while the machine is simulating', () => {
    renderSidebar({ isSimulating: true });
    expect(screen.getByText('CYCLE START').closest('button')).toBeDisabled();
  });

  it('does not disable the CYCLE START button when idle', () => {
    renderSidebar({ isSimulating: false });
    expect(screen.getByText('CYCLE START').closest('button')).not.toBeDisabled();
  });

  it('sizes the spindle and feed load gauges from actual RPM/feed values, not a hardcoded fill', () => {
    // spindleRpm 6000 / max 12000 = 50%; feedRate 1500 / max 3000 = 50%
    const { container } = renderSidebar({ spindleRpm: 6000, feedRate: 1500, isSimulating: true });
    const gaugeFills = container.querySelectorAll<HTMLDivElement>('[style*="width: 50%"]');
    expect(gaugeFills.length).toBe(2);
  });

  it('shows a zero-width spindle gauge when idle even though isSimulating gating no longer forces it', () => {
    const { container } = renderSidebar({ spindleRpm: 0, isSimulating: false });
    expect(container.querySelector('[style*="width: 0%"]')).toBeInTheDocument();
  });

  it('sizes FEED HOLD and RESET to the 44px touch-target minimum', () => {
    renderSidebar();
    expect(screen.getByText('FEED HOLD').closest('button')?.className).toContain('h-11');
    expect(screen.getByText('RESET').closest('button')?.className).toContain('h-11');
  });

  it('derives the footer EST TIME from the real program duration, not a hardcoded placeholder', () => {
    // Regression test: this used to be a hardcoded "1h 45m" string,
    // unrelated to the actual (much shorter) programSummary duration.
    renderSidebar();
    expect(screen.getByText('EST TIME: 0h 1m')).toBeInTheDocument();
  });

  it('uses the chamfer-border ring technique so FEED HOLD/RESET show an outline on their diagonal edges', () => {
    // Regression test: a plain CSS `border` on a `chamfer-*` (clip-path)
    // element only ever draws on the box's four straight edges -- clip-path
    // cuts the diagonal corner away without adding a stroke along the cut,
    // so the outline was invisible on the two short diagonal edges. See the
    // `.chamfer-border` rules in index.css for the two-layer fix.
    renderSidebar();
    expect(screen.getByText('FEED HOLD').closest('button')?.className).toContain('chamfer-border');
    expect(screen.getByText('RESET').closest('button')?.className).toContain('chamfer-border');
  });

  it('disables CYCLE START during the fake-computing loading window, not just while simulating', () => {
    renderSidebar({ isSimulating: false }, {}, true);
    expect(screen.getByText('CYCLE START').closest('button')).toBeDisabled();
  });

  it('changing material patches materialId and resets Vc/feed to the new material\'s midpoint', async () => {
    const user = userEvent.setup();
    const { onCuttingParamsChange } = renderSidebar();

    await user.selectOptions(screen.getByLabelText('Workpiece material'), 'titanium');

    const titanium = getMaterial('titanium');
    expect(onCuttingParamsChange).toHaveBeenCalledWith({
      materialId: 'titanium',
      vcMPerMin: midpoint(titanium.vcRangeMPerMin),
      feedMmPerMin: midpoint(titanium.feedRangeMmPerMin),
    });
  });

  it('locks the material selector and Vc controls while simulating', () => {
    renderSidebar({ isSimulating: true });
    expect(screen.getByLabelText('Workpiece material')).toBeDisabled();
    expect(screen.getByLabelText('Cutting speed slider')).toBeDisabled();
  });

  it('locks the material selector during the fake-computing loading window too', () => {
    renderSidebar({ isSimulating: false }, {}, true);
    expect(screen.getByLabelText('Workpiece material')).toBeDisabled();
  });

  it('does not lock the material selector when idle and not preparing a cycle', () => {
    renderSidebar({ isSimulating: false }, {}, false);
    expect(screen.getByLabelText('Workpiece material')).not.toBeDisabled();
  });

  it('derives RPM and Power from the selected material and Vc, not a hardcoded value', () => {
    // aluminum default: vc = midpoint(200,400) = 300 m/min, tool diameter 6mm
    // RPM = 300*1000/(pi*6) ~= 15915; Power = 400*300/60000 = 2.00 kW
    renderSidebar();
    expect(screen.getByText('15,915')).toBeInTheDocument();
    expect(screen.getByText('2.00')).toBeInTheDocument();
  });

  it('titanium recommends a visibly lower RPM than aluminum for the same tool, avoiding the "wrong combo" scenario', () => {
    const titanium = getMaterial('titanium');
    renderSidebar({}, { materialId: 'titanium', vcMPerMin: midpoint(titanium.vcRangeMPerMin) });
    // RPM = midpoint(20,50)*1000/(pi*6) = 35*1000/(pi*6) ~= 1857 -- nowhere near aluminum's ~15,915
    expect(screen.getByText('1,857')).toBeInTheDocument();
  });

  it('shows a Cutting Power tooltip with the P = Fc x Vc / 60000 formula', () => {
    renderSidebar();
    expect(screen.getByText(/P = Fc.*Vc \/ 60000/)).toBeInTheDocument();
  });

  it('marks the Cutting Parameters panel as a concept/illustrative value, distinct from the real Cutting Result stats', () => {
    renderSidebar();
    expect(screen.getByText('Concept')).toBeInTheDocument();
  });
});
