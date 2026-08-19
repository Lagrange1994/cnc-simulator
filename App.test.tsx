import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';

function completionPercent(): number {
  const text = screen.getByText(/COMPLETION/).textContent || '';
  const match = text.match(/COMPLETION\s*([\d.]+)%/);
  return match ? parseFloat(match[1]) : NaN;
}

// fireEvent (not userEvent) is used throughout: userEvent's pointer-delay
// machinery deadlocks against vi's fake timers, since both are trying to
// drive the same clock. fireEvent dispatches synchronously and plays
// cleanly with act() + vi.advanceTimersByTime().
describe('App simulation loop', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('advances progress as the interval ticks after CYCLE START', () => {
    render(<App />);

    fireEvent.click(screen.getByText('CYCLE START'));
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(completionPercent()).toBeGreaterThan(0);
  });

  it('resumes from the paused progress instead of restarting after FEED HOLD -> CYCLE START', () => {
    render(<App />);

    fireEvent.click(screen.getByText('CYCLE START'));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    fireEvent.click(screen.getByText('FEED HOLD'));
    const pausedPercent = completionPercent();
    expect(pausedPercent).toBeGreaterThan(0);

    fireEvent.click(screen.getByText('CYCLE START'));
    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(completionPercent()).toBeGreaterThanOrEqual(pausedPercent);
  });

  it('marks the run complete once the full program duration elapses', () => {
    render(<App />);

    fireEvent.click(screen.getByText('CYCLE START'));
    act(() => {
      vi.advanceTimersByTime(20000);
    });

    expect(screen.getByText('COMPLETION 100%')).toBeInTheDocument();
    expect(screen.getByText('CYCLE START')).not.toBeDisabled();
  });

  it('logs each executed line exactly once, not twice', () => {
    // Regression test for the impure setStatus updater bug: addLog was
    // called from inside setStatus's updater, which React.StrictMode
    // double-invokes in dev, producing duplicate log lines.
    render(<App />);

    fireEvent.click(screen.getByText('CYCLE START'));
    act(() => {
      vi.advanceTimersByTime(1300); // past line 004 (M03 S12000)
    });

    const occurrences = screen.getAllByText(/Executing line 004: M03 S12000/);
    expect(occurrences).toHaveLength(1);
  });

  it('preserves the last spindle RPM on lines with no S-word instead of resetting it', () => {
    render(<App />);

    fireEvent.click(screen.getByText('CYCLE START'));
    // Line 004 (M03 S12000) sets spindle to 12,000; line 005-006 have no
    // S-word and should not reset it back to 0.
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText('12,000')).toBeInTheDocument();
  });
});
