import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Viewport from './Viewport';
import { Coordinates, GCodeLine, ViewSettings } from '../types';
import { DEFAULT_VIEW_SETTINGS } from '../constants';

const coords: Coordinates = { x: 0, y: 0, z: 0 };
const lines: GCodeLine[] = [
  { id: '1', lineNum: '001', command: 'G00', params: 'X10 Y0', type: 'motion' },
  { id: '2', lineNum: '002', command: 'G01', params: 'X10 Y10', type: 'motion' },
];

function renderViewport(settingsOverride: Partial<ViewSettings> = {}, progress = 0) {
  return render(
    <Viewport
      isSimulating={false}
      progress={progress}
      coords={coords}
      lines={lines}
      totalDurationMs={0}
      viewSettings={{ ...DEFAULT_VIEW_SETTINGS, ...settingsOverride }}
    />
  );
}

describe('Viewport', () => {
  it('renders a work envelope anchor so the canvas is never an empty void', () => {
    renderViewport();
    expect(screen.getByText('WORK ENVELOPE')).toBeInTheDocument();
  });

  it('derives RUN TIME and EST from the real program duration, not a hardcoded placeholder', () => {
    // Regression test: RUN TIME used to be `progress * 0.45` (a made-up
    // formula) and EST was a hardcoded "00:00:45" string, both ignoring the
    // real timeline duration already computed by summarizeProgram().
    render(
      <Viewport
        isSimulating={false}
        progress={50}
        coords={coords}
        lines={lines}
        totalDurationMs={120000}
        viewSettings={DEFAULT_VIEW_SETTINGS}
      />
    );
    expect(screen.getByText('RUN TIME: 00:01:00')).toBeInTheDocument();
    expect(screen.getByText('EST: 00:02:00')).toBeInTheDocument();
  });

  it('scales the floor grid opacity with the gridOpacity setting instead of a fixed value', () => {
    const { container: low } = renderViewport({ gridOpacity: 0 });
    const { container: high } = renderViewport({ gridOpacity: 100 });
    // First <g> in the SVG is the grid floor group.
    expect(low.querySelector('svg > g')?.getAttribute('opacity')).toBe('0');
    expect(high.querySelector('svg > g')?.getAttribute('opacity')).toBe('0.3');
  });

  it('shows the machine housing frame only when that scene-visibility toggle is on', () => {
    const { container: on } = renderViewport({ machineHousing: true });
    const { container: off } = renderViewport({ machineHousing: false });
    expect(on.querySelector('rect[stroke-dasharray="10,6"]')).not.toBeNull();
    expect(off.querySelector('rect[stroke-dasharray="10,6"]')).toBeNull();
  });

  it('shows fixture/clamp markers only when that scene-visibility toggle is on', () => {
    const { container: on } = renderViewport({ fixturesClamps: true });
    const { container: off } = renderViewport({ fixturesClamps: false });
    expect(on.querySelectorAll('rect[fill="#f1c21b"]').length).toBe(4);
    expect(off.querySelectorAll('rect[fill="#f1c21b"]').length).toBe(0);
  });

  it('hides the shadow/planned toolpath overlays when toolpathHistory is off', () => {
    const { container: on } = renderViewport({ toolpathHistory: true });
    const { container: off } = renderViewport({ toolpathHistory: false });
    expect(on.querySelector('path[stroke="#222"]')).not.toBeNull();
    expect(off.querySelector('path[stroke="#222"]')).toBeNull();
  });

  it('only renders the rapid (G00) move overlay when the Rapid Lines toggle is on', () => {
    const { container: on } = renderViewport({ rapidLines: true });
    const { container: off } = renderViewport({ rapidLines: false });
    expect(on.querySelector('path[stroke="#f1c21b"]')).not.toBeNull();
    expect(off.querySelector('path[stroke="#f1c21b"]')).toBeNull();
  });

  it('renders the tool as outline-only (no fill) in WIREFRAME render mode', () => {
    const { container } = renderViewport({ renderMode: 'WIREFRAME' });
    const toolRect = container.querySelector('rect[width="8"][height="120"]');
    expect(toolRect?.getAttribute('fill')).toBe('none');
  });

  it('sets CSS perspective to none in ORTHOGRAPHIC projection', () => {
    const { container } = renderViewport({ projection: 'ORTHOGRAPHIC' });
    const section = container.querySelector('section');
    expect(section?.getAttribute('style')).toContain('perspective: none');
  });

  it('keeps perspective in PERSPECTIVE projection', () => {
    const { container } = renderViewport({ projection: 'PERSPECTIVE' });
    const section = container.querySelector('section');
    expect(section?.getAttribute('style')).toContain('perspective: 1200px');
  });
});
