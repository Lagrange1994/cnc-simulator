import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileManager from './FileManager';

describe('FileManager', () => {
  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<FileManager onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows an empty state when switching to a tab with no content', async () => {
    const user = userEvent.setup();
    render(<FileManager onClose={vi.fn()} />);

    expect(screen.queryByText('ACCESS_DENIED_OR_EMPTY')).not.toBeInTheDocument();
    await user.click(screen.getByText('CLOUD DRIVE'));
    expect(screen.getByText('ACCESS_DENIED_OR_EMPTY')).toBeInTheDocument();
  });

  it('nests file card titles as H3 under the H2 catalog heading, not H4 (no heading-level skip)', () => {
    render(<FileManager onClose={vi.fn()} />);

    expect(screen.getByRole('heading', { level: 2, name: 'WORKSPACE CATALOG' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'PROJECT_ALPHA_V2.NC' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 4 })).not.toBeInTheDocument();
  });

  it('exposes itself as a labelled modal dialog', () => {
    render(<FileManager onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleName('FILE SYSTEM MANAGER');
  });

  it('gives the active nav item the chamfer-border ring so its outline shows on the diagonal edges', () => {
    // Regression test: see index.css's `.chamfer-border` comment -- a plain
    // `border` on a chamfer-* (clip-path) element is invisible along the
    // two short diagonal edges.
    render(<FileManager onClose={vi.fn()} />);
    expect(screen.getByText('RECENT WORK').closest('button')?.className).toContain('chamfer-border');
  });
});
