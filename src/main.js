import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import '@/utils/rem'
import '@/styles/global.scss'

createApp(App).use(router).mount('#app')
