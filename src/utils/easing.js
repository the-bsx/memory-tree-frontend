// Easing curves used to make scroll-driven animations feel less linear/robotic.

// Smooth deceleration — good for "catching up" animations like the rope draw.
export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// Gentle overshoot-then-settle, used for pop-in scale animations.
export function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// Simple linear interpolation helper.
export function lerp(a, b, t) {
  return a + (b - a) * t;
}
