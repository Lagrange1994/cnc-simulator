import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileManager from './FileManager';

function renderFileManager() {
  const onClose = vi.fn();
  const onImportFile = vi.fn();
  render(<FileManager onClose={onClose} onImportFile={onImportFile} />);
  return { onClose, onImportFile };
}

describe('FileManager', () => {
  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const { onClose } = renderFileManager();

    await user.click(screen.getByRole('button', { name: 'close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows an empty state when switching to a tab with no content', async () => {
    const user = userEvent.setup();
    renderFileManager();

    expect(screen.queryByText('ACCESS_DENIED_OR_EMPTY')).not.toBeInTheDocument();
    await user.click(screen.getByText('CLOUD DRIVE'));
    expect(screen.getByText('ACCESS_DENIED_OR_EMPTY')).toBeInTheDocument();
  });

  it('nests file card titles as H3 under the H2 catalog heading, not H4 (no heading-level skip)', () => {
    renderFileManager();

    expect(screen.getByRole('heading', { level: 2, name: 'WORKSPACE CATALOG' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'PROJECT_ALPHA_V2.NC' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 4 })).not.toBeInTheDocument();
  });

  it('exposes itself as a labelled modal dialog', () => {
    renderFileManager();

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleName('FILE SYSTEM MANAGER');
  });

  it('gives the active nav item the chamfer-border ring so its outline shows on the diagonal edges', () => {
    // Regression test: see index.css's `.chamfer-border` comment -- a plain
    // `border` on a chamfer-* (clip-path) element is invisible along the
    // two short diagonal edges.
    renderFileManager();
    expect(screen.getByText('RECENT WORK').closest('button')?.className).toContain('chamfer-border');
  });

  describe('Import G-Code tab', () => {
    it('shows the browse/drop zone, not the generic empty state', async () => {
      const user = userEvent.setup();
      renderFileManager();
      await user.click(screen.getByText('IMPORT G-CODE'));
      expect(screen.getByText('Import G-Code')).toBeInTheDocument();
      expect(screen.queryByText('ACCESS_DENIED_OR_EMPTY')).not.toBeInTheDocument();
    });

    it('imports a file picked via Browse Files and closes the panel', async () => {
      const user = userEvent.setup();
      const { onImportFile, onClose } = renderFileManager();
      await user.click(screen.getByText('IMPORT G-CODE'));
      const file = new File(['G21\nG90'], 'part.nc', { type: 'text/plain' });
      const input = screen.getByText('BROWSE FILES').parentElement!.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(input, file);
      expect(onImportFile).toHaveBeenCalledWith(file);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('imports a file dropped onto the zone', () => {
      const { onImportFile, onClose } = renderFileManager();
      fireEvent.click(screen.getByText('IMPORT G-CODE'));
      const file = new File(['G21\nG90'], 'dropped.nc', { type: 'text/plain' });
      const dropZone = screen.getByText(/Drag & drop/).closest('div')!.parentElement!;
      fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });
      expect(onImportFile).toHaveBeenCalledWith(file);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onImportFile or onClose while just dragging over', () => {
      const { onImportFile, onClose } = renderFileManager();
      fireEvent.click(screen.getByText('IMPORT G-CODE'));
      const dropZone = screen.getByText(/Drag & drop/).closest('div')!.parentElement!;
      fireEvent.dragOver(dropZone);
      expect(onImportFile).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
