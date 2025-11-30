import { createRouter, createWebHistory } from "vue-router";
import HelloWorld from "../components/HelloWorld.vue";
import Dashboard from "../views/Dashboard.vue";
import Register from "../views/Register.vue";
import Login from "../views/Login.vue";
import { supabase } from "../lib/supabase";

const routes = [
  {
    path: "/",
    name: "Login",
    component: Login,
  },
  {
    path: "/login",
    name: "LoginPage",
    component: Login,
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
  // 檢查路由是否需要認證
  if (to.meta.requiresAuth) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // 已登入，允許訪問
        next();
      } else {
        // 未登入，重定向到登入頁
        next({ name: "Login" });
      }
    } catch (error) {
      console.error("檢查登入狀態錯誤:", error);
      // 發生錯誤時重定向到登入頁
      next({ name: "Login" });
    }
  } else {
    // 不需要認證的路由，直接允許訪問
    next();
  }
});

export default router;
