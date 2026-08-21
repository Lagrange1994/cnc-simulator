import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import App from './App';

function completionPercent(): number {
  const text = screen.getByText(/COMPLETION/).textContent || '';
  const match = text.match(/COMPLETION\s*([\d.]+)%/);
  return match ? parseFloat(match[1]) : NaN;
}

// Clicking CYCLE START now opens a ~1.5s SimulationLoadingModal before the
// real simulation starts (see App.tsx's isCycleLoadingOpen / handleCycleStartClick).
// Every test that clicks CYCLE START and then asserts on simulation state
// must advance past this window first, or the real handleCycleStart never runs.
function clickCycleStartAndWaitForLoading() {
  fireEvent.click(screen.getByText('CYCLE START'));
  act(() => {
    vi.advanceTimersByTime(1500);
  });
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

    clickCycleStartAndWaitForLoading();
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(completionPercent()).toBeGreaterThan(0);
  });

  it('resumes from the paused progress instead of restarting after FEED HOLD -> CYCLE START', () => {
    render(<App />);

    clickCycleStartAndWaitForLoading();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    fireEvent.click(screen.getByText('FEED HOLD'));
    const pausedPercent = completionPercent();
    expect(pausedPercent).toBeGreaterThan(0);

    clickCycleStartAndWaitForLoading();
    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(completionPercent()).toBeGreaterThanOrEqual(pausedPercent);
  });

  it('marks the run complete once the full program duration elapses', () => {
    render(<App />);

    clickCycleStartAndWaitForLoading();
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

    clickCycleStartAndWaitForLoading();
    act(() => {
      vi.advanceTimersByTime(1300); // past line 004 (M03 S12000)
    });

    const occurrences = screen.getAllByText(/Executing line 004: M03 S12000/);
    expect(occurrences).toHaveLength(1);
  });

  it('preserves the last spindle RPM on lines with no S-word instead of resetting it', () => {
    render(<App />);

    clickCycleStartAndWaitForLoading();
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

    clickCycleStartAndWaitForLoading();
    act(() => {
      vi.setSystemTime(Date.now() + 1300);
      vi.advanceTimersByTime(100); // exactly one throttled tick
    });

    expect(screen.getByText(/Executing line 004: M03 S12000/)).toBeInTheDocument();
    expect(within(liveSpindleCard()).getByText('12,000')).toBeInTheDocument();
  });

  it('reaches the true final coordinates and logs the last line when a tick jumps straight past completion', () => {
    render(<App />);

    clickCycleStartAndWaitForLoading();
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

    clickCycleStartAndWaitForLoading();
    act(() => {
      vi.advanceTimersByTime(437); // an elapsed time unlikely to divide evenly
    });

    const text = screen.getByText(/COMPLETION/).textContent || '';
    const match = text.match(/COMPLETION\s*([\d.]+)%/);
    expect(match).not.toBeNull();
    const decimals = (match![1].split('.')[1] || '').length;
    expect(decimals).toBeLessThanOrEqual(1);
  });

  it('plays back 1.5x faster when the Feed Override slider is set to 150% before the run starts', () => {
    // 150% is the slider's max (OVERRIDE_PCT_MAX) -- using a value above
    // that would silently clamp in the DOM and understate the effect.
    const { unmount } = render(<App />);
    clickCycleStartAndWaitForLoading();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    const baselinePercent = completionPercent();
    unmount();

    render(<App />);
    clickCycleStartAndWaitForLoading();
    fireEvent.change(screen.getByLabelText('Feed (mm/m) override slider'), { target: { value: '150' } });
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    const fastPercent = completionPercent();

    // Expect ~1.5x, with slack for 100ms tick-boundary rounding.
    expect(fastPercent).toBeGreaterThan(baselinePercent * 1.3);
  });

  it('re-paces an in-progress run when Feed Override changes mid-cut, without resetting progress', () => {
    render(<App />);
    clickCycleStartAndWaitForLoading();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    const beforeChange = completionPercent();
    expect(beforeChange).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Feed (mm/m) override slider'), { target: { value: '50' } });
    // Re-entering the pacing effect must not restart the clock -- progress
    // should hold steady (or tick forward), never jump back toward 0.
    expect(completionPercent()).toBeGreaterThanOrEqual(beforeChange);

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(completionPercent()).toBeGreaterThanOrEqual(beforeChange);
  });
});

describe('CYCLE START fake-computing loading sequence', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the loading modal immediately on click, before the real simulation starts', () => {
    render(<App />);

    fireEvent.click(screen.getByText('CYCLE START'));

    expect(screen.getByText('INITIALIZING TOOLPATH SOLVER...')).toBeInTheDocument();
    expect(completionPercent()).toBe(0);
  });

  it('ignores a second click while the loading modal is still open', () => {
    render(<App />);

    fireEvent.click(screen.getByText('CYCLE START'));
    expect(screen.getByText('CYCLE START').closest('button')).toBeDisabled();

    fireEvent.click(screen.getByText('CYCLE START'));
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // Only one real cycle started: progress is mid-run, not restarted/frozen.
    expect(completionPercent()).toBe(0);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(completionPercent()).toBeGreaterThan(0);
  });

  it('closes the loading modal and seeds the real Spindle RPM from the selected material -- not the old hardcoded 12,000', () => {
    // Default material is Aluminum (see DEFAULT_CUTTING_PARAMS): Vc =
    // midpoint(200,400) = 300 m/min, tool diameter 6mm (TOOLS[0]).
    // RPM = 300*1000/(pi*6) ~= 15,915 -- nothing in this test relies on the
    // old hardcoded 12,000 value the feature replaced.
    render(<App />);

    clickCycleStartAndWaitForLoading();

    expect(screen.queryByText('INITIALIZING TOOLPATH SOLVER...')).not.toBeInTheDocument();
    expect(within(liveSpindleCard()).getByText('15,915')).toBeInTheDocument();
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

  it('also hides the app shell behind the CYCLE START loading modal', () => {
    // Outside-voice finding: the loading modal is self-contained (owns its
    // own message timer) but must still join isFullScreenModalOpen, or it
    // reintroduces the two-active-<h1> class of bug fixed for the other 3
    // modals above.
    vi.useFakeTimers();
    render(<App />);

    fireEvent.click(screen.getByText('CYCLE START'));

    const shellHeading = screen.getByText('Super High Tech');
    expect(shellHeading.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(shellHeading.closest('[inert]')).not.toBeNull();

    vi.useRealTimers();
  });
});

describe('Work Coordinate System', () => {
  it('zeroing an axis makes the DRO read 0 for it, without disturbing the other axes', () => {
    render(<App />);
    // Initial machine position is {x:0, y:0, z:10} -- Z shows raw 0010.000.
    expect(screen.getByText('0010.000')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Zero Z axis (set current position as work zero)'));

    expect(screen.queryByText('0010.000')).not.toBeInTheDocument();
    expect(screen.getAllByText('0000.000').length).toBeGreaterThanOrEqual(3); // X, Y, and now Z
  });

  it('logs the zero action with the active WCS id and axis', () => {
    render(<App />);
    fireEvent.click(screen.getByLabelText('Zero Z axis (set current position as work zero)'));
    expect(screen.getByText(/G54 Z zeroed at current position/)).toBeInTheDocument();
  });

  it('keeps each Work Coordinate System\'s offset independent -- zeroing G54 does not affect G55', () => {
    render(<App />);
    fireEvent.click(screen.getByLabelText('Zero Z axis (set current position as work zero)'));
    expect(screen.getAllByText('0000.000').length).toBeGreaterThanOrEqual(3);

    fireEvent.change(screen.getByLabelText('Active work coordinate system'), { target: { value: 'G55' } });

    // G55 was never zeroed -- Z reads the raw machine position again.
    expect(screen.getByText('0010.000')).toBeInTheDocument();
  });
});

describe('Alarm/Fault History', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('raises a spindle overspeed alarm when CYCLE START seeds an RPM above the machine\'s rated max', () => {
    // Default Cutting Parameters (Aluminum, midpoint Vc) already recommend
    // 15,915 RPM for the 6mm default tool -- above MACHINE_SPEC.maxSpindleRpm
    // (12,000) -- so this needs no override tweaking to reach.
    render(<App />);
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();

    clickCycleStartAndWaitForLoading();

    expect(screen.getByLabelText('Active alarm, open System Logs')).toBeInTheDocument();
    expect(screen.getByText(/ALM-204: Spindle speed 15,915 RPM exceeds rated maximum \(12,000 RPM\)/)).toBeInTheDocument();
  });

  it('clears the spindle overspeed alarm once the G-code\'s own M03 S12000 command takes over', () => {
    render(<App />);
    clickCycleStartAndWaitForLoading();
    expect(screen.getByLabelText('Active alarm, open System Logs')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1300); // past line 004 (M03 S12000), which sets spindle to exactly 12,000
    });

    expect(screen.queryByLabelText('Active alarm, open System Logs')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('ALM-204 cleared.')).toBeInTheDocument();
  });

  it('opens Help directly to System Logs with the active alarm listed when the bell is clicked', () => {
    render(<App />);
    clickCycleStartAndWaitForLoading();

    fireEvent.click(screen.getByLabelText('Active alarm, open System Logs'));

    expect(screen.getByText('ALM-204')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('Active alarm present')).toBeInTheDocument();
  });

  it('shows the alarm as cleared (not deleted) in System Logs after it resolves', () => {
    render(<App />);
    clickCycleStartAndWaitForLoading();
    act(() => {
      vi.advanceTimersByTime(1300);
    });

    fireEvent.click(screen.getByLabelText('Notifications'));

    expect(screen.getByText('ALM-204')).toBeInTheDocument();
    expect(screen.getByText('cleared')).toBeInTheDocument();
    expect(screen.getByText('All systems nominal')).toBeInTheDocument();
  });

  it('shows "no alarms recorded" in System Logs before any alarm has fired', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Help'));
    fireEvent.click(screen.getByText('SYSTEM LOGS'));

    expect(screen.getByText(/no alarms recorded this session/)).toBeInTheDocument();
  });
});
