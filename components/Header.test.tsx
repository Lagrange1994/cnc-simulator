import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
