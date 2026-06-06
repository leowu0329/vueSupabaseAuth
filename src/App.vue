<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar v-if="authStore.user" />
    <router-view />
  </div>
</template>


<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import NavBar from '@/components/NavBar.vue'
const authStore = useAuthStore()

onMounted(async () => {
  await authStore.fetchUser()
})
</script>
