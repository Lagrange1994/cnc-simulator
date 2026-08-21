import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Editor from './Editor';
import { GCodeLine, ExecutionModifiers } from '../types';
import { DEFAULT_EXECUTION_MODIFIERS } from '../constants';

const lines: GCodeLine[] = [
  { id: '1', lineNum: '001', command: 'G21', comment: 'Metric Units', type: 'setup' },
  { id: '2', lineNum: '002', command: 'G90', comment: 'Absolute Positioning', type: 'setup' },
  { id: '3', lineNum: '003', command: 'G00', params: 'X0 Y0 Z10', type: 'motion' },
];

function renderEditor(
  activeLineIndex = 0,
  execModifiersOverride: Partial<ExecutionModifiers> = {},
  isCuttingLocked = false,
  linesOverride: GCodeLine[] = lines
) {
  const onExecModifiersChange = vi.fn();
  render(
    <Editor
      lines={linesOverride}
      activeLineIndex={activeLineIndex}
      execModifiers={{ ...DEFAULT_EXECUTION_MODIFIERS, ...execModifiersOverride }}
      onExecModifiersChange={onExecModifiersChange}
      isCuttingLocked={isCuttingLocked}
    />
  );
  return { onExecModifiersChange };
}

describe('Editor', () => {
  it('renders every G-code line with its command', () => {
    renderEditor();
    expect(screen.getByText('G21')).toBeInTheDocument();
    expect(screen.getByText('G90')).toBeInTheDocument();
    expect(screen.getByText('G00')).toBeInTheDocument();
  });

  it('highlights only the row matching activeLineIndex', () => {
    renderEditor(2);
    const activeRow = screen.getByText('G00').closest('tr');
    const inactiveRow = screen.getByText('G21').closest('tr');
    expect(activeRow?.className).toContain('bg-cds-layer-02/50');
    expect(inactiveRow?.className).not.toContain('bg-cds-layer-02/50');
  });

  it('reports the total line count in the status bar', () => {
    renderEditor();
    expect(screen.getByText('Total Lines: 3')).toBeInTheDocument();
  });

  it('sizes the toolbar icon buttons to the 44px touch-target minimum', () => {
    renderEditor();
    const uploadButton = screen.getByLabelText('Upload G-code file');
    const saveButton = screen.getByLabelText('Save G-code file');
    expect(uploadButton.className).toContain('size-11');
    expect(saveButton.className).toContain('size-11');
  });

  describe('Execution Modifiers', () => {
    it('renders all four toggles, inactive by default', () => {
      renderEditor();
      ['SNGL BLK', 'DRY RUN', 'OPT STOP', 'BLK SKIP'].forEach(label => {
        expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'false');
      });
    });

    it('shows an active toggle as pressed', () => {
      renderEditor(0, { singleBlock: true });
      expect(screen.getByRole('button', { name: 'SNGL BLK' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('calls onExecModifiersChange with the toggled key when clicked', async () => {
      const user = userEvent.setup();
      const { onExecModifiersChange } = renderEditor();
      await user.click(screen.getByRole('button', { name: 'DRY RUN' }));
      expect(onExecModifiersChange).toHaveBeenCalledWith({ dryRun: true });
    });

    it('locks Dry Run and Block Skip while cutting, but not Single Block or Optional Stop', () => {
      renderEditor(0, {}, true);
      expect(screen.getByRole('button', { name: 'DRY RUN' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'BLK SKIP' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'SNGL BLK' })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: 'OPT STOP' })).not.toBeDisabled();
    });

    it('does not lock any toggle when idle', () => {
      renderEditor(0, {}, false);
      ['SNGL BLK', 'DRY RUN', 'OPT STOP', 'BLK SKIP'].forEach(label => {
        expect(screen.getByRole('button', { name: label })).not.toBeDisabled();
      });
    });
  });

  describe('Block Skip line marking', () => {
    const linesWithSkip: GCodeLine[] = [
      ...lines,
      { id: '4', lineNum: '004', command: 'M08', comment: 'Optional Coolant Blast', type: 'system', blockSkip: true },
    ];

    it('marks a blockSkip line with a "/" prefix regardless of the toggle state', () => {
      renderEditor(0, {}, false, linesWithSkip);
      expect(screen.getByTitle('Block Skip line')).toBeInTheDocument();
    });

    it('shows the "skipped" label and strikes the row only when Block Skip is enabled', () => {
      const { rerender } = render(
        <Editor
          lines={linesWithSkip}
          activeLineIndex={0}
          execModifiers={{ ...DEFAULT_EXECUTION_MODIFIERS, blockSkip: false }}
          onExecModifiersChange={vi.fn()}
          isCuttingLocked={false}
        />
      );
      expect(screen.queryByText('skipped')).not.toBeInTheDocument();

      rerender(
        <Editor
          lines={linesWithSkip}
          activeLineIndex={0}
          execModifiers={{ ...DEFAULT_EXECUTION_MODIFIERS, blockSkip: true }}
          onExecModifiersChange={vi.fn()}
          isCuttingLocked={false}
        />
      );
      expect(screen.getByText('skipped')).toBeInTheDocument();
    });
  });
});
