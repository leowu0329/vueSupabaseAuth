import { defineStore } from "pinia";
import { supabase } from "../lib/supabase";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    session: null,
    token: null,
    isAuthenticated: false,
  }),

  getters: {
    hasToken: (state) => !!state.token,
  },

  actions: {
    // 設置用戶和 session
    setSession(session) {
      this.session = session;
      this.user = session?.user || null;
      this.token = session?.access_token || null;
      this.isAuthenticated = !!session;
    },

    // 清除 session
    clearSession() {
      this.session = null;
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
    },

    // 檢查並更新 session
    async checkSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("檢查 session 錯誤:", error);
          this.clearSession();
          return false;
        }

        if (session) {
          this.setSession(session);
          return true;
        } else {
          this.clearSession();
          return false;
        }
      } catch (error) {
        console.error("檢查 session 異常:", error);
        this.clearSession();
        return false;
      }
    },

    // 登出
    async logout() {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        this.clearSession();
        return true;
      } catch (error) {
        console.error("登出錯誤:", error);
        this.clearSession();
        return false;
      }
    },
  },
});

