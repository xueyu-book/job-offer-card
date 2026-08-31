import { isMobileDevice } from './device'

/** PC：1920 设计稿，192px = 1rem */
export const PC_DESIGN_WIDTH = 1920
export const PC_DESIGN_HEIGHT = 1080
export const PC_ROOT_VALUE = 192

/** 移动端：375×667 设计稿，37.5px = 1rem */
export const MOBILE_DESIGN_WIDTH = 375
export const MOBILE_DESIGN_HEIGHT = 667
export const MOBILE_ROOT_VALUE = 37.5

export function pxToRem(px, device = getDeviceTypeForRem()) {
  const root = device === 'mobile' ? MOBILE_ROOT_VALUE : PC_ROOT_VALUE
  return `${px / root}rem`
}

function getDeviceTypeForRem() {
  return isMobileDevice() ? 'mobile' : 'web'
}

function setRootFontSize() {
  const { clientWidth, clientHeight } = document.documentElement

  if (isMobileDevice()) {
    // 宽高同时适配，避免短视口（含 Safari 底栏）把页面撑出滚动
    const scale = Math.min(
      clientWidth / MOBILE_DESIGN_WIDTH,
      clientHeight / MOBILE_DESIGN_HEIGHT
    )
    document.documentElement.style.fontSize = `${MOBILE_ROOT_VALUE * scale}px`
    return
  }

  // 最小高度随当前宽度按 16:9 计算；视口更矮时不再缩小（由页面滚动）
  const minHeight = clientWidth * (PC_DESIGN_HEIGHT / PC_DESIGN_WIDTH)
  const scale = Math.min(
    clientWidth / PC_DESIGN_WIDTH,
    Math.max(clientHeight, minHeight) / PC_DESIGN_HEIGHT
  )
  document.documentElement.style.fontSize = `${PC_ROOT_VALUE * scale}px`
}

setRootFontSize()
window.addEventListener('resize', setRootFontSize)
window.addEventListener('orientationchange', setRootFontSize)
