<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// 元件掛載時觸發，確保資料即時性
onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchUser()
  }
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div v-if="authStore.isLoading" class="text-center text-gray-500">
      正在載入您的資料...
    </div>

    <div v-else-if="authStore.user" class="text-center">
      <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
        <span class="block">歡迎回來，</span>
        <span class="block text-indigo-600">{{ authStore.user.email }}</span>
      </h1>
      <p class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
        您已成功登入系統，現在可以開始使用所有功能。
      </p>
      <div class="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
        <div class="rounded-md shadow">
          <router-link
            to="/profile"
            class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
          >
            查看個人資料
          </router-link>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500">請先登入以檢視您的個人首頁。</p>
      <router-link to="/login" class="text-indigo-600 font-medium hover:underline">前往登入頁面</router-link>
    </div>
  </div>
</template>