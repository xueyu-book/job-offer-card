const MOBILE_UA =
  /Android.*Mobile|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i

/** 平板按 PC 端处理 */
const TABLET_UA = /iPad|Tablet|Android(?!.*Mobile)/i

/**
 * 判断当前是否为手机端（平板走 PC）
 * 优先 UA，辅以触控能力与视口宽度
 */
export function isMobileDevice() {
  if (typeof window === 'undefined') return false

  try {
    if (new URLSearchParams(window.location.search).get('device') === 'mobile') {
      return true
    }
  } catch {
    // ignore
  }

  const ua = navigator.userAgent || ''
  if (TABLET_UA.test(ua)) return false
  if (MOBILE_UA.test(ua)) return true

  const coarsePointer = window.matchMedia('(pointer: coarse)').matches
  const narrowViewport = window.innerWidth <= 768
  return coarsePointer && narrowViewport
}

export function getDeviceType() {
  return isMobileDevice() ? 'mobile' : 'web'
}
