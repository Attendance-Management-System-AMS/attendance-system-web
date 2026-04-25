import 'vue-sonner/style.css'
import './assets/main.css'

import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'

import App from './App.vue'
import router from './app/router.ts'
import { queryClient } from './app/queryClient'

const app = createApp(App)

app.use(VueQueryPlugin, { queryClient })
app.use(router)

app.mount('#app')
