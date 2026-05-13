import { createApp } from 'vue'
import App from './App.vue'
import './theme.css'
import './form-overrides.css'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import 'element-plus/dist/index.css'
import 'virtual:uno.css'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.mount('#app')
