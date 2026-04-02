import { createApp } from 'vue'
import App from './App.vue'
import 'virtual:uno.css'
import './style-dark.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import router from './router'

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app')
