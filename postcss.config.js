import autoprefixer from 'autoprefixer'
import postcssPxToRem from 'postcss-pxtorem'

/** PC 设计稿 1920px，192px = 1rem；mobile 目录下按 375 设计稿，37.5px = 1rem */
function rootValue({ file } = {}) {
  if (file && /[/\\]views[/\\]mobile[/\\]/.test(file)) {
    return 37.5
  }
  return 192
}

export default {
  plugins: [
    autoprefixer(),
    postcssPxToRem({
      rootValue,
      unitPrecision: 5,
      propList: ['*'],
      minPixelValue: 1,
      exclude: /node_modules/i
    })
  ]
}
