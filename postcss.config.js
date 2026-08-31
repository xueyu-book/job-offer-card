import autoprefixer from 'autoprefixer'
import postcssPxToRem, { mobileAwareRootValue } from './src/utils/postcssPxToRem.js'

/** PC 设计稿 1920px → 192；mobile 目录按 375 设计稿 → 37.5 */
export default {
  plugins: [
    autoprefixer(),
    postcssPxToRem({
      rootValue: mobileAwareRootValue,
      unitPrecision: 5,
      minPixelValue: 1,
      exclude: /node_modules/i
    })
  ]
}
