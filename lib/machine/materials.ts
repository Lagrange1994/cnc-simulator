/**
 * Per-material cutting parameters for the "Cutting Parameters" panel
 * (Sidebar.tsx). These are illustrative/demo values, not research-backed
 * cutting data -- see TODOS.md's "Real cutting physics core" item for what
 * a production-grade version of this table would need.
 *
 * RPM and cutting power are DERIVED from Vc (via the real industry formulas
 * below), not looked up per-material, so switching tool diameter keeps the
 * numbers internally consistent instead of two independently-fake tables
 * drifting apart.
 */

export interface Material {
  id: string;
  label: string;
  /** Recommended cutting-speed range, m/min. */
  vcRangeMPerMin: [number, number];
  /** Recommended feed-rate range, mm/min. */
  feedRangeMmPerMin: [number, number];
  /** Representative cutting-force constant for the Power estimate, N. */
  cuttingForceN: number;
}

export const MATERIALS: Material[] = [
  { id: 'aluminum', label: 'Aluminum 6061', vcRangeMPerMin: [200, 400], feedRangeMmPerMin: [800, 2000], cuttingForceN: 400 },
  { id: 'brass', label: 'Brass C360', vcRangeMPerMin: [150, 300], feedRangeMmPerMin: [600, 1500], cuttingForceN: 350 },
  { id: 'mild-steel', label: 'Mild Steel 1018', vcRangeMPerMin: [80, 150], feedRangeMmPerMin: [300, 800], cuttingForceN: 1200 },
  { id: 'stainless-steel', label: 'Stainless Steel 304', vcRangeMPerMin: [50, 100], feedRangeMmPerMin: [200, 500], cuttingForceN: 1800 },
  { id: 'titanium', label: 'Titanium Ti-6Al-4V', vcRangeMPerMin: [20, 50], feedRangeMmPerMin: [100, 300], cuttingForceN: 2500 },
];

/** Falls back to the first material if `id` doesn't match any entry. */
export function getMaterial(id: string): Material {
  return MATERIALS.find(m => m.id === id) ?? MATERIALS[0];
}

export function midpoint([min, max]: [number, number]): number {
  return (min + max) / 2;
}

/** Parses a tool diameter string like "6.0mm" into a plain number. Returns
 * 0 (a safe divide-by-zero-guarded input, not a crash) if unparseable. */
export function parseToolDiameterMm(diameter: string): number {
  const match = diameter.match(/(-?\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
}

/** RPM = (Vc x 1000) / (pi x D), the standard cutting-speed-to-spindle-speed
 * conversion. Vc in m/min, D (tool diameter) in mm. Guards D <= 0 so a bad
 * diameter parse can't produce Infinity/NaN. */
export function estimateRpm(vcMPerMin: number, toolDiameterMm: number): number {
  if (toolDiameterMm <= 0) return 0;
  return Math.round((vcMPerMin * 1000) / (Math.PI * toolDiameterMm));
}

/** P = Fc x Vc / 60000, the standard cutting-power estimate. Fc (cutting
 * force) in N, Vc in m/min, result in kW. */
export function estimatePowerKw(cuttingForceN: number, vcMPerMin: number): number {
  return (cuttingForceN * vcMPerMin) / 60000;
}
