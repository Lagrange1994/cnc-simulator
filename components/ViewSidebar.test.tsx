import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ViewSidebar from './ViewSidebar';
import { ViewSettings } from '../types';
import { DEFAULT_VIEW_SETTINGS } from '../constants';

function renderViewSidebar(settingsOverride: Partial<ViewSettings> = {}) {
  const onClose = vi.fn();
  const onSettingsChange = vi.fn();
  render(
    <ViewSidebar
      onClose={onClose}
      settings={{ ...DEFAULT_VIEW_SETTINGS, ...settingsOverride }}
      onSettingsChange={onSettingsChange}
    />
  );
  return { onClose, onSettingsChange };
}

describe('ViewSidebar', () => {
  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const { onClose } = renderViewSidebar();
    await user.click(screen.getByRole('button', { name: 'close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('flips a scene-visibility toggle by patching just that key', async () => {
    const user = userEvent.setup();
    const { onSettingsChange } = renderViewSidebar({ machineHousing: true });
    const toggle = screen.getByText('Machine Housing').closest('div')!.querySelector('button')!;
    await user.click(toggle);
    expect(onSettingsChange).toHaveBeenCalledWith({ machineHousing: false });
  });

  it('sets renderMode when a Render Style option is clicked', async () => {
    const user = userEvent.setup();
    const { onSettingsChange } = renderViewSidebar();
    await user.click(screen.getByText('WIREFRAME').closest('button')!);
    expect(onSettingsChange).toHaveBeenCalledWith({ renderMode: 'WIREFRAME' });
  });

  it('sets projection when a View Projection option is clicked', async () => {
    const user = userEvent.setup();
    const { onSettingsChange } = renderViewSidebar();
    await user.click(screen.getByText('ORTHOGRAPHIC'));
    expect(onSettingsChange).toHaveBeenCalledWith({ projection: 'ORTHOGRAPHIC' });
  });

  it('sets gridOpacity when the Floor Grid Intensity slider moves', () => {
    const { onSettingsChange } = renderViewSidebar();
    fireEvent.change(screen.getByRole('slider'), { target: { value: '75' } });
    expect(onSettingsChange).toHaveBeenCalledWith({ gridOpacity: 75 });
  });

  it('reflects the current settings instead of owning its own local state', () => {
    renderViewSidebar({ gridOpacity: 65, renderMode: 'X-RAY', projection: 'ORTHOGRAPHIC' });
    expect(screen.getByText('65%')).toBeInTheDocument();
    expect(screen.getByRole('slider')).toHaveValue('65');
  });
});
