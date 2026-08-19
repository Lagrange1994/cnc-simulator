import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Editor from './Editor';
import { GCodeLine } from '../types';

const lines: GCodeLine[] = [
  { id: '1', lineNum: '001', command: 'G21', comment: 'Metric Units', type: 'setup' },
  { id: '2', lineNum: '002', command: 'G90', comment: 'Absolute Positioning', type: 'setup' },
  { id: '3', lineNum: '003', command: 'G00', params: 'X0 Y0 Z10', type: 'motion' },
];

describe('Editor', () => {
  it('renders every G-code line with its command', () => {
    render(<Editor lines={lines} activeLineIndex={0} />);
    expect(screen.getByText('G21')).toBeInTheDocument();
    expect(screen.getByText('G90')).toBeInTheDocument();
    expect(screen.getByText('G00')).toBeInTheDocument();
  });

  it('highlights only the row matching activeLineIndex', () => {
    render(<Editor lines={lines} activeLineIndex={2} />);
    const activeRow = screen.getByText('G00').closest('tr');
    const inactiveRow = screen.getByText('G21').closest('tr');
    expect(activeRow?.className).toContain('bg-cds-layer-02/50');
    expect(inactiveRow?.className).not.toContain('bg-cds-layer-02/50');
  });

  it('reports the total line count in the status bar', () => {
    render(<Editor lines={lines} activeLineIndex={0} />);
    expect(screen.getByText('Total Lines: 3')).toBeInTheDocument();
  });
});
