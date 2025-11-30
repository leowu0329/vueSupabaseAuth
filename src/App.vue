<script setup>
import { computed } from "vue";
import Navbar from "./components/Navbar.vue";
import { useAuthStore } from "./stores/auth";

const authStore = useAuthStore();

// 检查是否已登录
const isAuthenticated = computed(() => authStore.isAuthenticated && authStore.hasToken);
</script>

<template>
  <div>
    <Navbar v-if="isAuthenticated" />
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
