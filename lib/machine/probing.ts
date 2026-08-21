/**
 * Edge/surface probe compensation math for the Touch-Off Wizard
 * (components/ProbingWizard.tsx). A touch probe reports where its BALL
 * CENTER was when the ball's surface made contact, not where the part
 * surface actually is -- the true surface sits one probe radius away from
 * the trigger position, offset in whichever direction the ball was
 * traveling (the ball's leading face is what touched down).
 *
 * `approach` is the direction of travel during the probing move:
 * - 'positive': probe travels in the axis's + direction to make contact
 *   (e.g. jogging +X until the ball's +X-facing surface hits a wall) --
 *   true surface = trigger + radius, since the center trails the contact
 *   point by one radius in the -direction.
 * - 'negative': probe travels in the axis's - direction to make contact
 *   (e.g. jogging -Z down onto a top surface) -- true surface =
 *   trigger - radius.
 *
 * The same formula covers X, Y, and Z -- a top-surface Z probe is just the
 * 'negative' case (traveling down) with no separate code path.
 */

export type ProbeApproach = 'positive' | 'negative';

export function computeTrueSurfacePosition(
  triggerPosition: number,
  probeTipDiameterMm: number,
  approach: ProbeApproach
): number {
  const radius = probeTipDiameterMm / 2;
  return approach === 'positive' ? triggerPosition + radius : triggerPosition - radius;
}
