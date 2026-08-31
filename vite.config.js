import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import autoprefixer from 'autoprefixer'
import postcssPxToRem from 'postcss-pxtorem'

/** PC 设计稿 1920 → 192；移动端设计稿 375 → 37.5 */
function rootValue({ file } = {}) {
  if (file && /[/\\](views|components)[/\\]mobile[/\\]/.test(file)) {
    return 37.5
  }
  return 192
}

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@web': fileURLToPath(new URL('./src/views/web', import.meta.url)),
      '@mobile': fileURLToPath(new URL('./src/views/mobile', import.meta.url))
    }
  },
  css: {
    postcss: {
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
    },
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@/styles/variables.scss" as *;'
      }
    }
  }
})
