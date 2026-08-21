import { GCodeLine } from '../../types';

/**
 * Lines whose command, params, or comment contain `query` (case-insensitive).
 * Backs EditSidebar's Find control -- an empty/whitespace-only query matches
 * nothing rather than the whole program, so clearing the input clears the
 * result count instead of showing every line as "matched".
 */
export function findMatchingLines(lines: GCodeLine[], query: string): GCodeLine[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return lines.filter(line =>
    line.command.toLowerCase().includes(q) ||
    (line.params?.toLowerCase().includes(q) ?? false) ||
    (line.comment?.toLowerCase().includes(q) ?? false)
  );
}

/**
 * The line whose lineNum equals `query` numerically (so "7" finds "007",
 * matching how an operator would actually type a line number). Backs
 * EditSidebar's Goto control. Returns undefined for a non-numeric query or
 * no match -- Goto's caller turns that into a "Line not found" message.
 */
export function findLineByNumber(lines: GCodeLine[], query: string): GCodeLine | undefined {
  const target = Number(query.trim());
  if (!Number.isFinite(target) || query.trim() === '') return undefined;
  return lines.find(line => Number(line.lineNum) === target);
}
