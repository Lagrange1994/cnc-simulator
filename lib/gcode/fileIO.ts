import { GCodeLine } from '../../types';

const COMMAND_RE = /^[GM]\d+$/i;
const LINE_NUMBER_RE = /^N\d+$/i;

/**
 * Parses raw G-code file text (as read from a user-uploaded .NC/.tap/.gcode
 * file) into this app's GCodeLine[] shape. Strips comments (both `(...)` and
 * `;`-to-end-of-line styles), an optional leading N-word block number, and a
 * leading "/" block-skip marker. A line with axis/feed words but no G/M word
 * of its own (e.g. a CAM post that only repeats G01 when it changes) carries
 * forward the last seen command, matching how a real controller stays modal.
 * Blank lines, comment-only lines, and the "%" program-delimiter lines real
 * G-code files sometimes open/close with are dropped entirely.
 */
export function parseGCodeFile(text: string): GCodeLine[] {
  const result: GCodeLine[] = [];
  let lastCommand = '';
  let seq = 0;

  for (const raw of text.split(/\r\n|\r|\n/)) {
    let line = raw.trim();
    if (!line || line === '%') continue;

    let blockSkip = false;
    if (line.startsWith('/')) {
      blockSkip = true;
      line = line.slice(1).trim();
    }
    if (!line) continue;

    let comment: string | undefined;
    const parenMatch = line.match(/\(([^)]*)\)/);
    if (parenMatch && parenMatch.index !== undefined) {
      comment = parenMatch[1].trim();
      line = (line.slice(0, parenMatch.index) + line.slice(parenMatch.index + parenMatch[0].length)).trim();
    }
    const semiIdx = line.indexOf(';');
    if (semiIdx !== -1) {
      const semiComment = line.slice(semiIdx + 1).trim();
      if (semiComment) comment = comment ? `${comment} ${semiComment}` : semiComment;
      line = line.slice(0, semiIdx).trim();
    }
    if (!line) continue;

    const tokens = line.split(/\s+/);
    if (LINE_NUMBER_RE.test(tokens[0])) tokens.shift();
    if (tokens.length === 0) continue;

    let command = lastCommand;
    let paramTokens = tokens;
    if (COMMAND_RE.test(tokens[0])) {
      command = tokens[0].toUpperCase();
      paramTokens = tokens.slice(1);
    }
    // No G/M word yet established (a bare axis move before the program's
    // first command word) -- nothing to carry it modally from, so skip it
    // rather than emit a line with an empty command.
    if (!command) continue;

    lastCommand = command;
    seq += 1;
    result.push({
      id: `imported-${seq}`,
      lineNum: String(seq).padStart(3, '0'),
      command,
      params: paramTokens.length ? paramTokens.join(' ').toUpperCase() : undefined,
      comment,
      blockSkip: blockSkip || undefined,
    });
  }

  return result;
}

/**
 * Serializes this app's GCodeLine[] back into plain G-code text for a file
 * download -- the inverse of parseGCodeFile (round-trips a re-imported file
 * back to equivalent text, modulo whitespace/line-number cosmetics).
 */
export function serializeGCodeFile(lines: GCodeLine[]): string {
  return lines.map(line => {
    const body = [line.command, line.params].filter(Boolean).join(' ');
    const text = (line.blockSkip ? '/' : '') + body;
    return line.comment ? `${text} (${line.comment})` : text;
  }).join('\n') + '\n';
}
