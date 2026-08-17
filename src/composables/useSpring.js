import { shallowRef, onUnmounted } from 'vue'

function isObject(value) {
  return value !== null && typeof value === 'object'
}

function clone(value) {
  return isObject(value) ? { ...value } : value
}

function zeroLike(value) {
  if (!isObject(value)) return 0
  return Object.fromEntries(Object.keys(value).map((key) => [key, 0]))
}

function diff(a, b) {
  if (!isObject(a)) return a - b
  return Object.fromEntries(Object.keys(a).map((key) => [key, a[key] - b[key]]))
}

function add(a, b) {
  if (!isObject(a)) return a + b
  return Object.fromEntries(Object.keys(a).map((key) => [key, a[key] + b[key]]))
}

function scale(a, factor) {
  if (!isObject(a)) return a * factor
  return Object.fromEntries(Object.keys(a).map((key) => [key, a[key] * factor]))
}

function nearlyEqual(a, b, epsilon = 0.001) {
  if (!isObject(a)) return Math.abs(a - b) < epsilon
  return Object.keys(a).every((key) => Math.abs(a[key] - b[key]) < epsilon)
}

/**
 * Lightweight spring (svelte/motion-style) for card popover transforms.
 * @param {number | Record<string, number>} initial
 * @param {{ stiffness?: number, damping?: number }} [settings]
 */
export function useSpring(initial, settings = {}) {
  let baseStiffness = settings.stiffness ?? 0.066
  let baseDamping = settings.damping ?? 0.25
  let stiffness = baseStiffness
  let damping = baseDamping

  const current = shallowRef(clone(initial))
  let target = clone(initial)
  let velocity = zeroLike(initial)
  let rafId = null

  const stop = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  const tick = () => {
    const force = scale(diff(target, current.value), stiffness)
    velocity = add(scale(velocity, 1 - damping), force)
    current.value = add(current.value, velocity)

    const settled =
      nearlyEqual(current.value, target) && nearlyEqual(velocity, zeroLike(velocity), 0.01)

    if (settled) {
      current.value = clone(target)
      velocity = zeroLike(target)
      rafId = null
      return
    }

    rafId = requestAnimationFrame(tick)
  }

  const start = () => {
    if (rafId === null) rafId = requestAnimationFrame(tick)
  }

  /**
   * @param {number | Record<string, number>} next
   * @param {{ hard?: boolean, soft?: number | boolean }} [opts]
   */
  const set = (next, opts = {}) => {
    target = clone(next)

    if (opts.hard) {
      stop()
      current.value = clone(next)
      velocity = zeroLike(next)
      return
    }

    if (opts.soft) {
      const soft = typeof opts.soft === 'number' ? opts.soft : 0.5
      stiffness = Math.max(0.01, baseStiffness * soft)
      damping = Math.min(0.9, baseDamping + (1 - soft) * 0.15)
    } else {
      stiffness = baseStiffness
      damping = baseDamping
    }

    start()
  }

  onUnmounted(stop)

  return {
    current,
    set,
    setStiffness(value) {
      baseStiffness = value
      stiffness = value
    },
    setDamping(value) {
      baseDamping = value
      damping = value
    }
  }
}
