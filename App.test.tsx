import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import App from './App';

function completionPercent(): number {
  const text = screen.getByText(/COMPLETION/).textContent || '';
  const match = text.match(/COMPLETION\s*([\d.]+)%/);
  return match ? parseFloat(match[1]) : NaN;
}

// Scopes to the live SPINDLE (RPM) status card, not the Cutting Result
// panel's "Peak Spindle" stat -- both can show the same number.
function liveSpindleCard() {
  // The label renders as "Spindle (RPM)" in the DOM; ALL CAPS is CSS only.
  return screen.getByText('Spindle (RPM)').closest('div')!.parentElement!;
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

    expect(within(liveSpindleCard()).getByText('12,000')).toBeInTheDocument();
  });

  it('catches up a skipped S-word when a throttled tab makes one tick span multiple lines', () => {
    // Regression test for the adversarial-review finding: browsers throttle
    // setInterval to ~1/sec in backgrounded tabs, so a single tick can span
    // several 150-300ms line windows. Simulate that by jumping the clock
    // far forward and firing exactly one 100ms tick, skipping past line 004
    // (M03 S12000) without ever landing on it directly.
    render(<App />);

    fireEvent.click(screen.getByText('CYCLE START'));
    act(() => {
      vi.setSystemTime(Date.now() + 1300);
      vi.advanceTimersByTime(100); // exactly one throttled tick
    });

    expect(screen.getByText(/Executing line 004: M03 S12000/)).toBeInTheDocument();
    expect(within(liveSpindleCard()).getByText('12,000')).toBeInTheDocument();
  });

  it('reaches the true final coordinates and logs the last line when a tick jumps straight past completion', () => {
    render(<App />);

    fireEvent.click(screen.getByText('CYCLE START'));
    act(() => {
      vi.setSystemTime(Date.now() + 60000); // one huge throttled jump
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByText('COMPLETION 100%')).toBeInTheDocument();
    expect(screen.getByText(/Executing line 013: M30/)).toBeInTheDocument();
    // Final program state: G00 Z10 (line 011) returns to X0 Y0 Z10.
    expect(screen.getAllByText('0000.000')).toHaveLength(2); // X and Y
    expect(screen.getByText('0010.000')).toBeInTheDocument(); // Z
  });

  it('renders progress as a clean rounded percentage, not a long float', () => {
    render(<App />);

    fireEvent.click(screen.getByText('CYCLE START'));
    act(() => {
      vi.advanceTimersByTime(437); // an elapsed time unlikely to divide evenly
    });

    const text = screen.getByText(/COMPLETION/).textContent || '';
    const match = text.match(/COMPLETION\s*([\d.]+)%/);
    expect(match).not.toBeNull();
    const decimals = (match![1].split('.')[1] || '').length;
    expect(decimals).toBeLessThanOrEqual(1);
  });
});

describe('App shell accessibility while a full-screen modal is open', () => {
  // Regression test: FileManager/HelpManager/SettingsManager each mount their
  // own <h1> as a local document root, but the app shell's <h1> (in Header)
  // used to stay mounted behind them, unhidden -- two active H1s at once.
  it('hides the app shell (and its <h1>) behind the FileManager modal', () => {
    render(<App />);

    fireEvent.click(screen.getByText('File'));

    expect(screen.getByText('FILE SYSTEM MANAGER')).toBeInTheDocument();
    const shellHeading = screen.getByText('Super High Tech');
    expect(shellHeading.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(shellHeading.closest('[inert]')).not.toBeNull();
  });

  it('does not hide the app shell when no modal is open', () => {
    render(<App />);

    const shellHeading = screen.getByText('Super High Tech');
    expect(shellHeading.closest('[aria-hidden="true"]')).toBeNull();
    expect(shellHeading.closest('[inert]')).toBeNull();
  });
});
