import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CuttingResult from './CuttingResult';
import { ProgramSummary } from '../lib/gcode/parser';

describe('CuttingResult', () => {
  it('renders derived stats from the given summary', () => {
    const summary: ProgramSummary = {
      totalDurationMs: 65000,
      totalToolpathLengthMm: 100,
      peakSpindleRpm: 8000,
      peakFeedRateMmPerMin: 1200,
    };
    render(<CuttingResult summary={summary} />);

    expect(screen.getByText('Cutting Result')).toBeInTheDocument();
    expect(screen.getByText('1:05')).toBeInTheDocument(); // Est. Cycle Time
    expect(screen.getByText('100 mm')).toBeInTheDocument(); // Toolpath Length
    expect(screen.getByText('8,000')).toBeInTheDocument(); // Peak Spindle
    expect(screen.getByText('1,200')).toBeInTheDocument(); // Peak Feed
  });

  it('formats toolpath length in meters once it crosses 1000mm', () => {
    const summary: ProgramSummary = {
      totalDurationMs: 0,
      totalToolpathLengthMm: 1500,
      peakSpindleRpm: 0,
      peakFeedRateMmPerMin: 0,
    };
    render(<CuttingResult summary={summary} />);

    expect(screen.getByText('1.50 m')).toBeInTheDocument();
  });

  it('renders 0:00 cycle time without crashing for a zero-duration summary', () => {
    const summary: ProgramSummary = {
      totalDurationMs: 0,
      totalToolpathLengthMm: 0,
      peakSpindleRpm: 0,
      peakFeedRateMmPerMin: 0,
    };
    render(<CuttingResult summary={summary} />);
    expect(screen.getByText('0:00')).toBeInTheDocument();
  });
});
