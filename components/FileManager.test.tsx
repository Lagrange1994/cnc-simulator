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
});
