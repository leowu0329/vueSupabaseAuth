import { defineStore } from 'pinia'
import { supabase } from '../supabase'
import { useToast } from 'vue-toastification'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isLoading: false,
  }),

  actions: {
    getToast() {
      return useToast()
    },

    // 統一錯誤訊息處理函式
    parseErrorMessage(error) {
      const message = error.message || ''
      if (message.includes('Invalid login credentials')) return '電子郵件或密碼錯誤。'
      if (message.includes('Email not confirmed')) return '請先至您的信箱驗證帳號。'
      if (message.includes('User already registered')) return '此電子郵件已被註冊。'
      if (message.includes('Too many requests')) return '請求過於頻繁，請稍後再試。'
      if (message.includes('invalid claim')) return '目前密碼不正確。'
      return message // 若無對應則返回原始錯誤訊息
    },

    async handleLogin(credentials) {
      const toast = this.getToast()
      this.isLoading = true
      try {
        const { error, data } = await supabase.auth.signInWithPassword(credentials)
        if (error) throw error
        this.user = data.user
        toast.success('登入成功！')
        return data.user
      } catch (error) {
        toast.error(this.parseErrorMessage(error))
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async handleSignUp(credentials) {
      const toast = this.getToast()
      this.isLoading = true
      try {
        const { error, data } = await supabase.auth.signUp(credentials)
        if (error) throw error
        toast.success('註冊成功！請檢查您的郵箱以確認帳號。')
        return data.user
      } catch (error) {
        toast.error(this.parseErrorMessage(error))
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async handleLogout() {
      const toast = this.getToast()
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        this.user = null
        toast.success('您已成功登出')
      } catch (error) {
        toast.error(this.parseErrorMessage(error))
        throw error
      }
    },

    async handlePasswordReset(email) {
      const toast = this.getToast()
      this.isLoading = true
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })
        if (error) throw error
        toast.success('密碼重設連結已發送至您的郵箱')
      } catch (error) {
        toast.error(this.parseErrorMessage(error))
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async handleUpdateProfile(updates) {
      const toast = this.getToast()
      this.isLoading = true
      try {
        const { data, error } = await supabase.auth.updateUser({
          data: updates // 這會更新 user_metadata
        })
        if (error) throw error
        this.user = data.user
        toast.success('個人資料更新成功！')
        return data.user
      } catch (error) {
        toast.error(this.parseErrorMessage(error))
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async handleUpdatePassword(newPassword, currentPassword) {
      const toast = this.getToast()
      this.isLoading = true
      try {
        const { error } = await supabase.auth.updateUser({ 
          password: newPassword,
          ...(currentPassword ? { current_password: currentPassword } : {})
        })
        if (error) throw error
        toast.success('密碼更新成功！')
      } catch (error) {
        toast.error(this.parseErrorMessage(error))
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        this.user = user
        return user
      } catch (error) {
        this.user = null
        return null
      }
    },
  },
})