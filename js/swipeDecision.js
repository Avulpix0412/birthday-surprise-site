const DISTANCE_RATIO = 0.25;
const VELOCITY_THRESHOLD = 0.5;

export function decideSwipe({ deltaX, velocity, width }) {
  const pastDistance = Math.abs(deltaX) >= width * DISTANCE_RATIO;
  const pastVelocity = Math.abs(velocity) >= VELOCITY_THRESHOLD;
  if (!pastDistance && !pastVelocity) return "cancel";
  return deltaX < 0 ? "next" : "prev";
}
