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

// 根据导航栏是否显示来调整页面内容的上边距
const contentPaddingTop = computed(() => shouldShowNavbar.value ? '70px' : '0');
</script>

<template>
  <div class="app-wrapper">
    <Navbar v-if="shouldShowNavbar" />
    <div class="page-content" :style="{ paddingTop: contentPaddingTop }">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.app-wrapper {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-content {
  width: 100%;
  flex-grow: 1;
  transition: padding-top 0.3s ease;
}
</style>
