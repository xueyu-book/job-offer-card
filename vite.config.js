import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import autoprefixer from 'autoprefixer'
import postcssPxToRem, { mobileAwareRootValue } from './src/utils/postcssPxToRem.js'

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
          rootValue: mobileAwareRootValue,
          unitPrecision: 5,
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
