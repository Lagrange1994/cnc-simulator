import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Terminal from './Terminal';
import { LogMessage } from '../types';

describe('Terminal', () => {
  it('shows a waiting placeholder when there are no logs', () => {
    render(<Terminal logs={[]} />);
    expect(screen.getByText('Waiting for machine connection...')).toBeInTheDocument();
  });

  it('renders each log line with its level and text', () => {
    const logs: LogMessage[] = [
      { id: '1', timestamp: '00:00:01', level: 'info', text: 'Executing line 001: G21' },
      { id: '2', timestamp: '00:00:02', level: 'error', text: 'Soft limit exceeded' },
    ];
    render(<Terminal logs={logs} />);
    expect(screen.getByText('Executing line 001: G21')).toBeInTheDocument();
    expect(screen.getByText('Soft limit exceeded')).toBeInTheDocument();
  });

  it('sizes the Clear/Export toolbar buttons to the 44px touch-target minimum', () => {
    render(<Terminal logs={[]} />);
    expect(screen.getByText('Clear').className).toContain('h-11');
    expect(screen.getByText('Export').className).toContain('h-11');
  });
});
