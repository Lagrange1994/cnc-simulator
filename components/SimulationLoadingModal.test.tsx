import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import SimulationLoadingModal from './SimulationLoadingModal';

// fireEvent/fake-timers only, no userEvent -- matches App.test.tsx's documented
// convention (userEvent's pointer-delay machinery deadlocks against vi's fake timers).
describe('SimulationLoadingModal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when closed', () => {
    const { container } = render(<SimulationLoadingModal isOpen={false} onComplete={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the first message immediately when opened', () => {
    render(<SimulationLoadingModal isOpen={true} onComplete={vi.fn()} />);
    expect(screen.getByText('INITIALIZING TOOLPATH SOLVER...')).toBeInTheDocument();
  });

  it('advances through messages in sequence', () => {
    render(<SimulationLoadingModal isOpen={true} onComplete={vi.fn()} />);

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByText('CALCULATING TOOL DEFLECTION...')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByText('ESTIMATING SURFACE ROUGHNESS Ra...')).toBeInTheDocument();
  });

  it('calls onComplete exactly once, ~1.5s after opening', () => {
    const onComplete = vi.fn();
    render(<SimulationLoadingModal isOpen={true} onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(1499);
    });
    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('cleans up timers when closed mid-sequence, without calling onComplete late', () => {
    const onComplete = vi.fn();
    const { rerender } = render(<SimulationLoadingModal isOpen={true} onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(700);
    });
    rerender(<SimulationLoadingModal isOpen={false} onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('resets to the first message the next time it is reopened', () => {
    const { rerender } = render(<SimulationLoadingModal isOpen={true} onComplete={vi.fn()} />);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByText('CALCULATING TOOL DEFLECTION...')).toBeInTheDocument();

    rerender(<SimulationLoadingModal isOpen={false} onComplete={vi.fn()} />);
    rerender(<SimulationLoadingModal isOpen={true} onComplete={vi.fn()} />);
    expect(screen.getByText('INITIALIZING TOOLPATH SOLVER...')).toBeInTheDocument();
  });
});
