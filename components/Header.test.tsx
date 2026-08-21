import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from './Header';

const baseProps = {
  onOpenFileMenu: vi.fn(),
  onOpenEditMenu: vi.fn(),
  onOpenViewMenu: vi.fn(),
  onOpenHelpMenu: vi.fn(),
};

describe('Header Simulation tab active state', () => {
  it('renders the Simulation tab as active when no other tab is open', () => {
    render(<Header {...baseProps} />);
    expect(screen.getByText('Simulation').className).toContain('bg-cds-interactive/20');
  });

  it('renders the Simulation tab as inactive when the Edit tab is active', () => {
    render(<Header {...baseProps} isEditActive />);
    expect(screen.getByText('Simulation').className).not.toContain('bg-cds-interactive/20');
  });

  it('renders the Simulation tab as inactive when the View tab is active', () => {
    render(<Header {...baseProps} isViewActive />);
    expect(screen.getByText('Simulation').className).not.toContain('bg-cds-interactive/20');
  });

  it('renders the Simulation tab as inactive when the Help tab is active', () => {
    render(<Header {...baseProps} isHelpActive />);
    expect(screen.getByText('Simulation').className).not.toContain('bg-cds-interactive/20');
  });
});

describe('Header alarm bell', () => {
  it('shows the idle blue dot and "Notifications" label when there is no active alarm', () => {
    render(<Header {...baseProps} hasActiveAlarm={false} />);
    const bell = screen.getByLabelText('Notifications');
    expect(bell.querySelector('.bg-cds-interactive')).toBeInTheDocument();
    expect(bell.querySelector('.bg-cds-error')).not.toBeInTheDocument();
  });

  it('swaps to a pulsing red dot and an alarm-specific label when an alarm is active', () => {
    render(<Header {...baseProps} hasActiveAlarm />);
    const bell = screen.getByLabelText('Active alarm, open System Logs');
    expect(bell.querySelector('.bg-cds-error.animate-pulse')).toBeInTheDocument();
  });

  it('calls onOpenAlarms when the bell is clicked', async () => {
    const onOpenAlarms = vi.fn();
    const user = userEvent.setup();
    render(<Header {...baseProps} onOpenAlarms={onOpenAlarms} hasActiveAlarm />);
    await user.click(screen.getByLabelText('Active alarm, open System Logs'));
    expect(onOpenAlarms).toHaveBeenCalledTimes(1);
  });
});
