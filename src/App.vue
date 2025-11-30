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
  <div>
    <Navbar v-if="shouldShowNavbar" />
    <router-view />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
