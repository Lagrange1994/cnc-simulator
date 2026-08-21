import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsManager from './SettingsManager';
import { DEFAULT_ACCENT_THEME, DEFAULT_UI_SCALE_PERCENT } from '../constants';
import { AccentTheme } from '../types';

function renderSettings(accentTheme: AccentTheme = DEFAULT_ACCENT_THEME, uiScalePercent = DEFAULT_UI_SCALE_PERCENT) {
  const onClose = vi.fn();
  const onAccentThemeChange = vi.fn();
  const onUiScalePercentChange = vi.fn();
  render(
    <SettingsManager
      onClose={onClose}
      accentTheme={accentTheme}
      onAccentThemeChange={onAccentThemeChange}
      uiScalePercent={uiScalePercent}
      onUiScalePercentChange={onUiScalePercentChange}
    />
  );
  return { onClose, onAccentThemeChange, onUiScalePercentChange };
}

// Only the two controls this session wired to real, app-wide state
// (Accent Color / UI Scale) are covered here -- the rest of this panel's
// controls remain decorative local state, pre-existing and out of scope.
describe('SettingsManager', () => {
  describe('Color Theme (Accent) select -- Editor Preferences tab', () => {
    function openEditorPreferences() {
      fireEvent.click(screen.getByText('EDITOR PREFERENCES'));
    }

    it('shows the current accent theme as selected', () => {
      renderSettings('classic-fanuc');
      openEditorPreferences();
      expect(screen.getByLabelText('Color Theme')).toHaveValue('classic-fanuc');
    });

    it('calls onAccentThemeChange when a different theme is picked', () => {
      const { onAccentThemeChange } = renderSettings();
      openEditorPreferences();
      fireEvent.change(screen.getByLabelText('Color Theme'), { target: { value: 'cyberpunk-neon' } });
      expect(onAccentThemeChange).toHaveBeenCalledWith('cyberpunk-neon');
    });

    it('lists all four accent options', () => {
      renderSettings();
      openEditorPreferences();
      expect(screen.getByText('Carbon Dark')).toBeInTheDocument();
      expect(screen.getByText('Cyberpunk Neon')).toBeInTheDocument();
      expect(screen.getByText('High Contrast')).toBeInTheDocument();
      expect(screen.getByText('Classic Fanuc (Green)')).toBeInTheDocument();
    });
  });

  describe('UI Scale / Density slider -- General tab', () => {
    it('shows the current percentage', () => {
      renderSettings(DEFAULT_ACCENT_THEME, 80);
      expect(screen.getByText('80%')).toBeInTheDocument();
    });

    it('calls onUiScalePercentChange when dragged', () => {
      const { onUiScalePercentChange } = renderSettings();
      fireEvent.change(screen.getByLabelText('UI Scale / Density'), { target: { value: '130' } });
      expect(onUiScalePercentChange).toHaveBeenCalledWith(130);
    });

    it('exposes the slider\'s real min/max, not the old fixed 100-150 range', () => {
      renderSettings();
      const slider = screen.getByLabelText('UI Scale / Density');
      expect(slider).toHaveAttribute('min', '80');
      expect(slider).toHaveAttribute('max', '150');
    });
  });
});
