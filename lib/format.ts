/** Shared display-formatting helpers for durations/lengths derived from a
 * G-code program's timeline (see lib/gcode/parser.ts). Kept in one place so
 * every readout (Cutting Result panel, Viewport progress bar, Sidebar
 * footer) shows the same real numbers instead of each inventing its own
 * hardcoded placeholder string. */

/** "M:SS" -- compact form used for the Cutting Result hero stat. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** "HH:MM:SS" -- digital-clock form used for the Viewport's RUN TIME/EST readouts. */
export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/** "Xh Ym" -- used for the Sidebar footer's EST TIME readout. */
export function formatHoursMinutes(ms: number): string {
  const totalMinutes = Math.max(0, Math.round(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export function formatLength(mm: number): string {
  return mm >= 1000 ? `${(mm / 1000).toFixed(2)} m` : `${mm.toFixed(0)} mm`;
}
