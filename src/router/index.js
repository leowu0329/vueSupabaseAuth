import { createRouter, createWebHistory } from "vue-router";
import HelloWorld from "../components/HelloWorld.vue";
import Dashboard from "../views/Dashboard.vue";
import Register from "../views/Register.vue";
import Login from "../views/Login.vue";
import { useAuthStore } from "../stores/auth";

const routes = [
  {
    path: "/",
    name: "Login",
    component: Login,
    meta: { requiresGuest: true },
  },
  {
    path: "/login",
    name: "LoginPage",
    component: Login,
    meta: { requiresGuest: true },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
    meta: { requiresGuest: true },
  },
  {
    path: "/hello",
    name: "Home",
    component: HelloWorld,
    props: { msg: "妹妹 + 武村" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守衛：檢查用戶登入狀態
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // 先檢查 session
  const isAuthenticated = await authStore.checkSession();

  // 如果路由需要認證（如 Dashboard）
  if (to.meta.requiresAuth) {
    if (isAuthenticated && authStore.hasToken) {
      // 已登入且有 token，允許訪問
      next();
    } else {
      // 未登入或沒有 token，重定向到登入頁
      next({ name: "Login" });
    }
  }
  // 如果路由需要訪客狀態（如 Login, Register）
  else if (to.meta.requiresGuest) {
    if (isAuthenticated && authStore.hasToken) {
      // 已登入，重定向到 Dashboard
      next({ name: "Dashboard" });
    } else {
      // 未登入，允許訪問登入/註冊頁
      next();
    }
  }
  // 其他路由直接允許訪問
  else {
    next();
  }
});

export default router;
