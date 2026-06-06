<template>
  <nav class="bg-indigo-600 shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <router-link to="/" class="text-white font-bold text-xl">
              Vue Auth
            </router-link>
          </div>
        </div>
        <div class="flex items-center">
          <template v-if="authStore.user">
            <div class="relative ml-3">
              <!-- 使用者名稱/Email 按鈕 -->
              <div>
                <button
                  type="button"
                  class="flex items-center max-w-xs text-sm text-indigo-100 hover:text-white focus:outline-none transition-colors"
                  @click="isDropdownOpen = !isDropdownOpen"
                >
                  <span class="mr-1">{{ authStore.user.user_metadata?.full_name || authStore.user.email }}</span>
                  <svg class="h-4 w-4 transition-transform" :class="{ 'rotate-180': isDropdownOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              <!-- 下拉式選單 -->
              <div
                v-if="isDropdownOpen"
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
              >
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  @click="isDropdownOpen = false"
                >
                  個人資料
                </router-link>
                <router-link
                  :to="{ name: 'reset-password' }"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  @click="isDropdownOpen = false"
                >
                  重設密碼
                </router-link>
                <button
                  @click="handleLogoutClick"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors border-t border-gray-100"
                >
                  登出
                </button>
              </div>
            </div>
          </template>
          <template v-else>
            <router-link
              to="/login"
              class="text-indigo-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              登入
            </router-link>
          </template>
        </div>
      </div>
    </div>

    <!-- 登出確認對話框 -->
    <LogoutModal
      :is-open="isLogoutModalOpen"
      @close="isLogoutModalOpen = false"
      @confirm="handleConfirmLogout"
    />
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import LogoutModal from './LogoutModal.vue'

const authStore = useAuthStore()
const router = useRouter()

const isLogoutModalOpen = ref(false)
const isDropdownOpen = ref(false)

/**
 * 處理選單中的登出點擊
 */
const handleLogoutClick = () => {
  isDropdownOpen.value = false
  isLogoutModalOpen.value = true
}

/**
 * 處理確認登出的邏輯
 */
const handleConfirmLogout = async () => {
  isLogoutModalOpen.value = false
  try {
    await authStore.handleLogout()
    // 登出後跳轉至登入頁面
    router.push({ name: 'login' })
  } catch (error) {
    // 錯誤處理已在 auth store 的 handleLogout 中透過 toast 顯示
  }
}
</script>