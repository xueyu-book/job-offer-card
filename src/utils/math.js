/** @param {number} value @param {number} [precision=3] */
export function round(value, precision = 3) {
  return parseFloat(value.toFixed(precision))
}

/** @param {number} value @param {number} [min=0] @param {number} [max=100] */
export function clamp(value, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max)
}

/**
 * Remap value from one range to another.
 * @param {number} value
 * @param {number} fromMin
 * @param {number} fromMax
 * @param {number} toMin
 * @param {number} toMax
 */
export function adjust(value, fromMin, fromMax, toMin, toMax) {
  return round(toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin))
}
