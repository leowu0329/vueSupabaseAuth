import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './style.css'
import App from './App.vue'
import router from './router'
import './lib/supabase' // 導入 supabase 以觸發連線測試
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 應用啟動時檢查已保存的 session
const authStore = useAuthStore();
authStore.checkSession().then(() => {
  // 如果有已保存的 session，嘗試跳轉到 Dashboard
  if (authStore.isAuthenticated && authStore.hasToken) {
    // 如果當前在登入/註冊頁，路由守衛會自動處理跳轉
    const currentPath = window.location.pathname;
    if (currentPath === '/' || currentPath === '/login' || currentPath === '/register') {
      router.push('/dashboard');
    }
  }
});

app.mount('#app')
