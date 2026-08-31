/**
 * Race-free px→rem converter.
 * postcss-pxtorem keeps pxReplace in closure and breaks under Vite's parallel CSS build.
 */

const MOBILE_PATH = /[/\\](views|components)[/\\]mobile[/\\]/
const PX_REGEX = /(-?\d*\.?\d+)px\b/g

function toFixed(number, precision) {
  const multiplier = Math.pow(10, precision + 1)
  const wholeNumber = Math.floor(number * multiplier)
  return (Math.round(wholeNumber / 10) * 10) / multiplier
}

function resolveRootValue(rootValue, file) {
  if (typeof rootValue === 'function') {
    return rootValue({ file, from: file })
  }
  return rootValue
}

export default function postcssPxToRem(options = {}) {
  const {
    rootValue = 16,
    unitPrecision = 5,
    minPixelValue = 0,
    exclude = null
  } = options

  return {
    postcssPlugin: 'postcss-px-to-rem-safe',
    Declaration(decl) {
      const filePath = decl.source?.input?.file || decl.source?.input?.from || ''

      if (
        exclude &&
        ((typeof exclude === 'function' && exclude(filePath)) ||
          (typeof exclude === 'string' && filePath.includes(exclude)) ||
          (exclude instanceof RegExp && filePath.match(exclude)))
      ) {
        return
      }

      if (!decl.value.includes('px')) return

      const root = resolveRootValue(rootValue, filePath) || 16

      decl.value = decl.value.replace(PX_REGEX, (match, num) => {
        const pixels = parseFloat(num)
        if (Number.isNaN(pixels) || pixels < minPixelValue) return match
        const fixedVal = toFixed(pixels / root, unitPrecision)
        return fixedVal === 0 ? '0' : `${fixedVal}rem`
      })
    }
  }
}

postcssPxToRem.postcss = true

export function mobileAwareRootValue({ file } = {}) {
  if (file && MOBILE_PATH.test(file)) return 37.5
  return 192
}
