<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="max-w-3xl mx-auto space-y-6">
      <h1 class="text-3xl font-bold text-gray-900">個人資料</h1>

      <!-- 基本資訊區塊 -->
      <div class="bg-white shadow sm:rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 class="text-lg leading-6 font-medium text-gray-900">使用者資訊</h3>
        </div>
        <div class="px-4 py-5 sm:p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">電子信箱 (不可修改)</label>
            <input
              type="email"
              :value="authStore.user?.email"
              disabled
              class="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-500 sm:text-sm cursor-not-allowed"
            />
          </div>
          <div>
            <label for="display-name" class="block text-sm font-medium text-gray-700">顯示名稱</label>
            <input
              id="display-name"
              type="text"
              v-model="displayName"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div class="flex justify-between items-center">
            <router-link
              :to="{ name: 'reset-password' }"
              class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              前往更改密碼 &rarr;
            </router-link>
            <button
              @click="onUpdateProfile"
              :disabled="authStore.isLoading"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              儲存名稱
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const authStore = useAuthStore()
const displayName = ref(authStore.user?.user_metadata?.full_name || '')
const toast = useToast()

const onUpdateProfile = async () => {
  try {
    await authStore.handleUpdateProfile({ full_name: displayName.value })
  } catch (error) {
    // 錯誤已在 store 處理
  }
}
</script>
