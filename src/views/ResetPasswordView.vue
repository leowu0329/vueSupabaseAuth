<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="flex items-center space-x-4">
        <button 
          @click="router.back()" 
          class="text-gray-600 hover:text-gray-900"
        >
          &larr; 返回
        </button>
        <h1 class="text-3xl font-bold text-gray-900">安全性設定</h1>
      </div>

      <!-- 更改密碼區塊 -->
      <div class="bg-white shadow sm:rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 class="text-lg leading-6 font-medium text-gray-900">更改密碼</h3>
          <p class="mt-1 text-sm text-gray-500">為了帳號安全，請定期更換您的密碼。</p>
        </div>
        <div class="px-4 py-5 sm:p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">目前密碼</label>
            <div class="mt-1 relative">
              <input
                :type="showCurrent ? 'text' : 'password'"
                v-model="passwordForm.current"
                placeholder="請輸入目前的密碼"
                class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-10 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <button
                type="button"
                @click="showCurrent = !showCurrent"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg v-if="!showCurrent" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              </button>
            </div>
          </div>
          <hr class="border-gray-100" />
          <div>
            <label class="block text-sm font-medium text-gray-700">新密碼</label>
            <div class="mt-1 relative">
              <input
                :type="showNew ? 'text' : 'password'"
                v-model="passwordForm.new"
                placeholder="請輸入新密碼"
                class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-10 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <button
                type="button"
                @click="showNew = !showNew"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg v-if="!showNew" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">確認新密碼</label>
            <div class="mt-1 relative">
              <input
                :type="showConfirm ? 'text' : 'password'"
                v-model="passwordForm.confirm"
                placeholder="再次輸入新密碼"
                class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-10 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <button
                type="button"
                @click="showConfirm = !showConfirm"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg v-if="!showConfirm" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              </button>
            </div>
          </div>
          <div class="flex justify-end">
            <button
              @click="onUpdatePassword"
              :disabled="authStore.isLoading"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {{ authStore.isLoading ? '更新中...' : '確認修改密碼' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

const passwordForm = reactive({
  current: '',
  new: '',
  confirm: ''
})

const onUpdatePassword = async () => {
  if (!passwordForm.current || !passwordForm.new) {
    toast.error('請完整填寫密碼欄位')
    return
  }
  if (passwordForm.new !== passwordForm.confirm) {
    toast.error('新密碼與確認密碼不符')
    return
  }
  
  try {
    await authStore.handleUpdatePassword(passwordForm.new, passwordForm.current)
    // 成功後清空表單
    passwordForm.current = ''
    passwordForm.new = ''
    passwordForm.confirm = ''
  } catch (error) {
    // 錯誤已在 store 處理
  }
}
</script>