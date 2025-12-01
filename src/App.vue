<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import Navbar from "./components/Navbar.vue";
import { useAuthStore } from "./stores/auth";

const route = useRoute();
const authStore = useAuthStore();

// 检查是否已登录
const isAuthenticated = computed(() => authStore.isAuthenticated && authStore.hasToken);

// 检查当前路由是否需要显示导航列（重置密码页面不显示）
const shouldShowNavbar = computed(() => {
  // 重置密码页面不显示导航列
  if (route.name === "ResetPassword") {
    return false;
  }
  return isAuthenticated.value;
});
</script>

<template>
  <div class="app-wrapper">
    <Navbar v-if="shouldShowNavbar" />
    <div class="page-content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.app-wrapper {
  width: 100%;
  min-height: 100vh;
}

.page-content {
  width: 100%;
}
</style>
