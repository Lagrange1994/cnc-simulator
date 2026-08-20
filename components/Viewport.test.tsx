import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Viewport from './Viewport';
import { Coordinates, GCodeLine } from '../types';

const coords: Coordinates = { x: 0, y: 0, z: 0 };
const lines: GCodeLine[] = [];

describe('Viewport', () => {
  it('renders a work envelope anchor so the canvas is never an empty void', () => {
    render(<Viewport isSimulating={false} progress={0} coords={coords} lines={lines} />);
    expect(screen.getByText('WORK ENVELOPE')).toBeInTheDocument();
  });
});
