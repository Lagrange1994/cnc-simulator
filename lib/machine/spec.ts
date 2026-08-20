/**
 * Simplified machine spec: fixed rated limits used to turn a raw RPM/feed
 * reading into a load-gauge percentage. Matches the "Max Spindle RPM: 12,000"
 * shown in Settings > Spindle & Tool Changer; max cutting feed rate is not
 * exposed there yet, so 3,000 mm/min is a reasonable prosumer-mill ceiling
 * distinct from the 30,000 mm/min rapid (G00) rate.
 *
 * This intentionally stops short of a real Material/Tool cutting-force model
 * (MRR, chip load) — see TODOS.md for that follow-on.
 */
export const MACHINE_SPEC = {
  maxSpindleRpm: 12000,
  maxFeedRateMmPerMin: 3000,
} as const;

/** Percentage of `max` that `value` represents, clamped to [0, 100]. */
export function loadFillPercent(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}
