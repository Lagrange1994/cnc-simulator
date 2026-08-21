import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from './Sidebar';
import { Coordinates, MachineStatus, Tool, CuttingParams, Overrides, WcsId } from '../types';
import { ProgramSummary } from '../lib/gcode/parser';
import { DEFAULT_CUTTING_PARAMS, DEFAULT_OVERRIDES, DEFAULT_ACTIVE_WCS } from '../constants';
import { getMaterial, midpoint } from '../lib/machine/materials';

const zeroOffset: Coordinates = { x: 0, y: 0, z: 0 };

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
const activeTool: Tool = { id: 'T1', name: 'Flat End Mill', diameter: '6.0mm', length: '50mm', type: 'End Mill', lengthOffset: 125.4, diameterOffset: 6.015, lifeUses: 42, lifeMaxUses: 200 };
const nextTool: Tool = { id: 'T2', name: 'Ball Nose 3mm', diameter: '3.0mm', length: '45mm', type: 'Ball Nose', lengthOffset: 118.75, diameterOffset: 3.008, lifeUses: 15, lifeMaxUses: 150 };

function renderSidebar(
  statusOverride: Partial<MachineStatus> = {},
  cuttingParamsOverride: Partial<CuttingParams> = {},
  isPreparingCycle = false,
  overridesOverride: Partial<Overrides> = {},
  wcs: { activeWcsId?: WcsId; wcsOffset?: Coordinates } = {}
) {
  const onCycleStart = vi.fn();
  const onFeedHold = vi.fn();
  const onReset = vi.fn();
  const onCuttingParamsChange = vi.fn();
  const onOverridesChange = vi.fn();
  const onActiveWcsIdChange = vi.fn();
  const onZeroAxis = vi.fn();
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
      overrides={{ ...DEFAULT_OVERRIDES, ...overridesOverride }}
      onOverridesChange={onOverridesChange}
      activeWcsId={wcs.activeWcsId ?? DEFAULT_ACTIVE_WCS}
      onActiveWcsIdChange={onActiveWcsIdChange}
      wcsOffset={wcs.wcsOffset ?? zeroOffset}
      onZeroAxis={onZeroAxis}
      isPreparingCycle={isPreparingCycle}
    />
  );
  return { onCycleStart, onFeedHold, onReset, onCuttingParamsChange, onOverridesChange, onActiveWcsIdChange, onZeroAxis, container };
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

  describe('Feed/Spindle override', () => {
    it('scales the displayed Spindle/Feed values by the override percentage', () => {
      renderSidebar(
        { spindleRpm: 6000, feedRate: 1500 },
        {},
        false,
        { spindlePct: 50, feedPct: 200 }
      );
      // 6000 * 50% = 3000; 1500 * 200% = 3000
      expect(within(liveCard('Spindle (RPM)')).getByText('3,000')).toBeInTheDocument();
      expect(within(liveCard('Feed (mm/m)')).getByText('3000')).toBeInTheDocument();
    });

    it('calls onOverridesChange with the new percentage when a slider moves', () => {
      const { onOverridesChange } = renderSidebar();
      fireEvent.change(screen.getByLabelText('Spindle (RPM) override slider'), { target: { value: '75' } });
      expect(onOverridesChange).toHaveBeenCalledWith({ spindlePct: 75 });

      fireEvent.change(screen.getByLabelText('Feed (mm/m) override slider'), { target: { value: '125' } });
      expect(onOverridesChange).toHaveBeenCalledWith({ feedPct: 125 });
    });

    it('resets an override to 100% when its reset button is clicked, and disables that button at 100%', async () => {
      const user = userEvent.setup();
      const { onOverridesChange } = renderSidebar({}, {}, false, { spindlePct: 60 });

      const spindleReset = screen.getByLabelText('Reset Spindle (RPM) override to 100%');
      expect(spindleReset).not.toBeDisabled();
      await user.click(spindleReset);
      expect(onOverridesChange).toHaveBeenCalledWith({ spindlePct: 100 });

      // Feed override is still at the default 100% -> its reset button is disabled.
      expect(screen.getByLabelText('Reset Feed (mm/m) override to 100%')).toBeDisabled();
    });

    it('does not disable the override sliders while simulating, unlike the Cutting Parameters controls', () => {
      renderSidebar({ isSimulating: true });
      expect(screen.getByLabelText('Spindle (RPM) override slider')).not.toBeDisabled();
      expect(screen.getByLabelText('Feed (mm/m) override slider')).not.toBeDisabled();
    });
  });

  describe('Work Coordinate System', () => {
    it('shows machine position unchanged when the active WCS offset is zero', () => {
      // coords = {x:1, y:2, z:3}, default offset {0,0,0} -> work position == machine position.
      renderSidebar();
      expect(screen.getByText('0001.000')).toBeInTheDocument();
      expect(screen.getByText('0002.000')).toBeInTheDocument();
      expect(screen.getByText('0003.000')).toBeInTheDocument();
    });

    it('subtracts the active WCS offset from machine position to show work position', () => {
      // coords = {x:1, y:2, z:3}, offset {x:1, y:0, z:5} -> work = {0, 2, -2}.
      renderSidebar({}, {}, false, {}, { wcsOffset: { x: 1, y: 0, z: 5 } });
      expect(screen.getByText('0000.000')).toBeInTheDocument(); // X
      expect(screen.getByText('0002.000')).toBeInTheDocument(); // Y
      expect(screen.getByText('-002.000')).toBeInTheDocument(); // Z, negative
    });

    it('formats a negative work coordinate with the sign before the digits, not before a padding zero', () => {
      // Regression test: naive `value.toFixed(3).padStart(8,'0')` on a
      // negative number pads zeros in FRONT of the minus sign ("00-2.000").
      renderSidebar({}, {}, false, {}, { wcsOffset: { x: 0, y: 0, z: 5 } });
      expect(screen.queryByText('00-2.000')).not.toBeInTheDocument();
      expect(screen.getByText('-002.000')).toBeInTheDocument();
    });

    it('calls onActiveWcsIdChange when a different WCS is selected', async () => {
      const user = userEvent.setup();
      const { onActiveWcsIdChange } = renderSidebar();
      await user.selectOptions(screen.getByLabelText('Active work coordinate system'), 'G55');
      expect(onActiveWcsIdChange).toHaveBeenCalledWith('G55');
    });

    it('defaults the active WCS selector to G54', () => {
      renderSidebar();
      expect(screen.getByLabelText<HTMLSelectElement>('Active work coordinate system').value).toBe('G54');
    });

    it('calls onZeroAxis with the correct axis when a ZERO button is clicked', async () => {
      const user = userEvent.setup();
      const { onZeroAxis } = renderSidebar();

      await user.click(screen.getByLabelText('Zero X axis (set current position as work zero)'));
      expect(onZeroAxis).toHaveBeenCalledWith('x');

      await user.click(screen.getByLabelText('Zero Y axis (set current position as work zero)'));
      expect(onZeroAxis).toHaveBeenCalledWith('y');

      await user.click(screen.getByLabelText('Zero Z axis (set current position as work zero)'));
      expect(onZeroAxis).toHaveBeenCalledWith('z');
    });

    it('disables the ZERO buttons while simulating, unlike the override sliders', () => {
      renderSidebar({ isSimulating: true });
      expect(screen.getByLabelText('Zero X axis (set current position as work zero)')).toBeDisabled();
      expect(screen.getByLabelText('Zero Y axis (set current position as work zero)')).toBeDisabled();
      expect(screen.getByLabelText('Zero Z axis (set current position as work zero)')).toBeDisabled();
    });

    it('disables the ZERO buttons during the fake-computing loading window too', () => {
      renderSidebar({ isSimulating: false }, {}, true);
      expect(screen.getByLabelText('Zero X axis (set current position as work zero)')).toBeDisabled();
    });

    it('does not disable the ZERO buttons when idle', () => {
      renderSidebar({ isSimulating: false }, {}, false);
      expect(screen.getByLabelText('Zero X axis (set current position as work zero)')).not.toBeDisabled();
    });
  });
});

/** Scopes to a live Status card (Spindle/Feed) by its label text, so
 * assertions don't accidentally match the same number elsewhere (e.g. the
 * Cutting Result panel's Peak Spindle stat). */
function liveCard(label: string) {
  return screen.getByText(label).closest('div')!.parentElement!;
}
