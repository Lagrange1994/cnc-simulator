import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import InfoTooltip from './InfoTooltip';

describe('InfoTooltip', () => {
  it('renders its children inside the tooltip content', () => {
    render(<InfoTooltip>P = Fc x Vc / 60000</InfoTooltip>);
    expect(screen.getByText('P = Fc x Vc / 60000')).toBeInTheDocument();
  });

  it('exposes an accessible label on the trigger button', () => {
    render(<InfoTooltip>Some explanation</InfoTooltip>);
    expect(screen.getByRole('button', { name: 'More information' })).toBeInTheDocument();
  });
});
