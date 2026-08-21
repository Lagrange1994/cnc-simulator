import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EditSidebar from './EditSidebar';
import { GCodeLine, Tool } from '../types';

const lines: GCodeLine[] = [
  { id: '1', lineNum: '001', command: 'G21', comment: 'Metric Units' },
  { id: '2', lineNum: '002', command: 'G90', comment: 'Absolute Positioning' },
  { id: '3', lineNum: '003', command: 'M06', params: 'T1', comment: 'Tool Swap' }, // no "g" -- keeps the "g" query below to exactly the 3 G-lines
  { id: '4', lineNum: '004', command: 'G01', params: 'X50 Y0 F1200' },
];

const tools: Tool[] = [
  { id: 'T1', name: 'Flat End Mill', diameter: '6.0mm', length: '50mm', type: 'End Mill', lengthOffset: 125.4, diameterOffset: 6.015, lifeUses: 42, lifeMaxUses: 200 },
];

function renderEditSidebar(linesOverride: GCodeLine[] = lines) {
  const onClose = vi.fn();
  const onUpdateTool = vi.fn();
  const onHighlightLine = vi.fn();
  render(
    <EditSidebar
      onClose={onClose}
      tools={tools}
      onUpdateTool={onUpdateTool}
      lines={linesOverride}
      onHighlightLine={onHighlightLine}
    />
  );
  return { onClose, onUpdateTool, onHighlightLine };
}

describe('EditSidebar', () => {
  describe('Find', () => {
    it('highlights the first match as soon as a query has any matches', () => {
      const { onHighlightLine } = renderEditSidebar();
      fireEvent.click(screen.getByRole('button', { name: /FIND/ }));
      fireEvent.change(screen.getByLabelText('Find in G-code'), { target: { value: 'g' } });
      expect(onHighlightLine).toHaveBeenLastCalledWith('1'); // G21 is the first match
      expect(screen.getByText('1 of 3')).toBeInTheDocument(); // G21, G90, G01
    });

    it('cycles forward and back through matches', () => {
      const { onHighlightLine } = renderEditSidebar();
      fireEvent.click(screen.getByRole('button', { name: /FIND/ }));
      fireEvent.change(screen.getByLabelText('Find in G-code'), { target: { value: 'g' } });

      fireEvent.click(screen.getByLabelText('Next match'));
      expect(screen.getByText('2 of 3')).toBeInTheDocument();
      expect(onHighlightLine).toHaveBeenLastCalledWith('2'); // G90

      fireEvent.click(screen.getByLabelText('Next match'));
      fireEvent.click(screen.getByLabelText('Next match')); // wraps back to match 1
      expect(screen.getByText('1 of 3')).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText('Previous match')); // wraps to the last match
      expect(screen.getByText('3 of 3')).toBeInTheDocument();
    });

    it('pressing Enter in the search box advances to the next match', () => {
      renderEditSidebar();
      fireEvent.click(screen.getByRole('button', { name: /FIND/ }));
      const input = screen.getByLabelText('Find in G-code');
      fireEvent.change(input, { target: { value: 'g' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(screen.getByText('2 of 3')).toBeInTheDocument();
    });

    it('shows "No matches" and clears the highlight for a query that matches nothing', () => {
      const { onHighlightLine } = renderEditSidebar();
      fireEvent.click(screen.getByRole('button', { name: /FIND/ }));
      fireEvent.change(screen.getByLabelText('Find in G-code'), { target: { value: 'zzz' } });
      expect(screen.getByText('No matches')).toBeInTheDocument();
      expect(onHighlightLine).toHaveBeenLastCalledWith(null);
    });

    it('clears the query and the highlight when Find is toggled closed', () => {
      const { onHighlightLine } = renderEditSidebar();
      fireEvent.click(screen.getByRole('button', { name: /FIND/ }));
      fireEvent.change(screen.getByLabelText('Find in G-code'), { target: { value: 'g' } });
      expect(onHighlightLine).toHaveBeenLastCalledWith('1');

      fireEvent.click(screen.getByRole('button', { name: /FIND/ })); // toggle off
      expect(onHighlightLine).toHaveBeenLastCalledWith(null);
      expect(screen.queryByLabelText('Find in G-code')).not.toBeInTheDocument();
    });
  });

  describe('Goto', () => {
    it('highlights the matching line for a valid line number', () => {
      const { onHighlightLine } = renderEditSidebar();
      fireEvent.click(screen.getByRole('button', { name: /GOTO/ }));
      fireEvent.change(screen.getByLabelText('Go to line number'), { target: { value: '3' } });
      fireEvent.click(screen.getByLabelText('Go to line'));
      expect(onHighlightLine).toHaveBeenLastCalledWith('3'); // M06 at line 003
    });

    it('accepts Enter as well as clicking Go', () => {
      const { onHighlightLine } = renderEditSidebar();
      fireEvent.click(screen.getByRole('button', { name: /GOTO/ }));
      const input = screen.getByLabelText('Go to line number');
      fireEvent.change(input, { target: { value: '4' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onHighlightLine).toHaveBeenLastCalledWith('4');
    });

    it('shows an error and does not highlight anything for a line number that does not exist', () => {
      const { onHighlightLine } = renderEditSidebar();
      fireEvent.click(screen.getByRole('button', { name: /GOTO/ }));
      fireEvent.change(screen.getByLabelText('Go to line number'), { target: { value: '999' } });
      fireEvent.click(screen.getByLabelText('Go to line'));
      expect(screen.getByText('Line "999" not found.')).toBeInTheDocument();
      expect(onHighlightLine).toHaveBeenLastCalledWith(null);
    });

    it('switching from Find to Goto resets the Find state and starts Goto fresh', () => {
      const { onHighlightLine } = renderEditSidebar();
      fireEvent.click(screen.getByRole('button', { name: /FIND/ }));
      fireEvent.change(screen.getByLabelText('Find in G-code'), { target: { value: 'g' } });

      fireEvent.click(screen.getByRole('button', { name: /GOTO/ }));
      expect(screen.queryByLabelText('Find in G-code')).not.toBeInTheDocument();
      expect(onHighlightLine).toHaveBeenLastCalledWith(null);
      expect(screen.getByLabelText('Go to line number')).toHaveValue('');
    });
  });

  describe('Replace', () => {
    it('is disabled with an explanatory title, since nothing in this app can edit G-code yet', () => {
      renderEditSidebar();
      const replaceButton = screen.getByRole('button', { name: /REPLACE/ });
      expect(replaceButton).toBeDisabled();
      expect(replaceButton).toHaveAttribute('title', expect.stringMatching(/view-only/i));
    });
  });
});
