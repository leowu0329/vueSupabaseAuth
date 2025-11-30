<template>
  <nav style="background: #f8f9fa; padding: 15px 20px; border-bottom: 1px solid #dee2e6; display: flex; justify-content: space-between; align-items: center;">
    <div style="display: flex; align-items: center; gap: 20px;">
      <router-link to="/dashboard" style="text-decoration: none; color: #333; font-weight: bold; font-size: 18px;">
        Dashboard
      </router-link>
      <router-link to="/change-password" style="text-decoration: none; color: #333; font-size: 14px;">
        重設密碼
      </router-link>
    </div>
    
    <div style="display: flex; align-items: center; gap: 15px;">
      <span v-if="authStore.user" style="color: #666;">
        {{ authStore.user.email }}
      </span>
      <button 
        v-if="authStore.isAuthenticated"
        @click="handleLogout" 
        style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;"
      >
        登出
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

// 處理登出
const handleLogout = async () => {
  // 詢問是否確認登出
  if (!confirm("確定要登出嗎？")) {
    return;
  }

  try {
    // 使用 auth store 的登出方法
    const success = await authStore.logout();

    if (success) {
      // 跳轉到登入頁面
      router.push("/");
    } else {
      alert("登出失敗");
    }
  } catch (err) {
    console.error("登出錯誤:", err);
    alert(`登出失敗: ${err.message}`);
  }
};
</script>

<style scoped>
nav {
  position: sticky;
  top: 0;
  z-index: 100;
}

button:hover {
  background: #c82333 !important;
}

router-link {
  transition: color 0.2s;
}

router-link:hover {
  color: #007bff;
}
</style>

