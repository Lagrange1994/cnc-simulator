import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from './Sidebar';
import { Coordinates, MachineStatus, Tool } from '../types';
import { ProgramSummary } from '../lib/gcode/parser';

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

function renderSidebar(statusOverride: Partial<MachineStatus> = {}) {
  const onCycleStart = vi.fn();
  const onFeedHold = vi.fn();
  const onReset = vi.fn();
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
    />
  );
  return { onCycleStart, onFeedHold, onReset, container };
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
});
