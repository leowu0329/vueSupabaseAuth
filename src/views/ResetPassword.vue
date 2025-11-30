<template>
  <div>
    <h1>重置密碼</h1>

    <div v-if="message" :style="{ color: messageType === 'error' ? 'red' : 'green', margin: '10px 0', padding: '10px', background: messageType === 'error' ? '#ffe6e6' : '#e6ffe6', border: `1px solid ${messageType === 'error' ? '#ff9999' : '#99ff99'}`, borderRadius: '4px' }">
      {{ message }}
    </div>

    <div v-if="!isValidToken" style="color: red; margin: 10px 0; padding: 10px; background: #ffe6e6; border: 1px solid #ff9999; border-radius: 4px;">
      無效的重置密碼連結或連結已過期。請重新申請重置密碼。
    </div>

    <form v-if="isValidToken" @submit.prevent="handleResetPassword">
      <div>
        <label>新密碼: </label>
        <input 
          type="password" 
          v-model="formData.password" 
          placeholder="至少 6 個字符" 
          required 
          minlength="6"
        />
      </div>

      <div>
        <label>確認新密碼: </label>
        <input 
          type="password" 
          v-model="formData.confirmPassword" 
          placeholder="再次輸入新密碼" 
          required 
          minlength="6"
        />
      </div>

      <div>
        <button type="submit" :disabled="loading">
          {{ loading ? "重置中..." : "重置密碼" }}
        </button>
        <button type="button" @click="clearForm">清除</button>
      </div>
    </form>

    <div style="margin-top: 20px;">
      <router-link to="/">返回登入</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { supabase } from "../lib/supabase";

const router = useRouter();
const route = useRoute();

const formData = ref({
  password: "",
  confirmPassword: "",
});

const loading = ref(false);
const message = ref("");
const messageType = ref("");
const isValidToken = ref(false);

// 清除表單
const clearForm = () => {
  formData.value = {
    password: "",
    confirmPassword: "",
  };
  message.value = "";
  messageType.value = "";
};

// 檢查 URL 中的 token
const checkToken = async () => {
  try {
    // 等待一小段時間，讓 Supabase 的 detectSessionInUrl 處理 URL hash
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 檢查 URL hash 中是否有 recovery token
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');
    
    // 如果有 recovery token，設置 session
    if (accessToken && type === 'recovery') {
      const { data, error: setError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: hashParams.get('refresh_token') || '',
      });
      
      if (setError) {
        console.error("設置 session 錯誤:", setError);
        isValidToken.value = false;
        return;
      }
    }
    
    // 檢查是否有有效的 session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("檢查 session 錯誤:", error);
      isValidToken.value = false;
      return;
    }

    // 如果有 session 且用戶存在，則 token 有效
    if (session && session.user) {
      isValidToken.value = true;
      console.log("有效的重置密碼 token");
    } else {
      isValidToken.value = false;
      console.log("無效的重置密碼 token");
    }
  } catch (err) {
    console.error("檢查 token 錯誤:", err);
    isValidToken.value = false;
  }
};

// 處理重置密碼
const handleResetPassword = async () => {
  // 清除之前的訊息
  message.value = "";
  messageType.value = "";

  // 驗證密碼
  if (formData.value.password !== formData.value.confirmPassword) {
    message.value = "密碼與確認密碼不一致";
    messageType.value = "error";
    return;
  }

  // 驗證密碼長度
  if (formData.value.password.length < 6) {
    message.value = "密碼長度至少需要 6 個字符";
    messageType.value = "error";
    return;
  }

  loading.value = true;

  try {
    console.log("嘗試重置密碼");
    
    // 使用 updateUser 方法更新密碼
    const { data, error } = await supabase.auth.updateUser({
      password: formData.value.password,
    });

    if (error) {
      console.error("重置密碼錯誤:", error);
      console.error("錯誤詳情:", {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      throw error;
    }

    console.log("密碼重置成功:", data);

    message.value = "密碼重置成功！正在跳轉到登入頁面...";
    messageType.value = "success";
    
    // 清除表單
    clearForm();

    // 登出當前 session（因為這是重置密碼流程）
    await supabase.auth.signOut();

    // 跳轉到登入頁面
    setTimeout(() => {
      router.push("/");
    }, 2000);
  } catch (err) {
    console.error("重置密碼錯誤:", err);
    console.error("完整錯誤對象:", JSON.stringify(err, null, 2));
    
    let errorMessage = "重置密碼失敗";
    
    if (err.message) {
      if (err.message.includes("Password")) {
        errorMessage = "密碼不符合要求";
      } else if (err.message.includes("session") || err.message.includes("token")) {
        errorMessage = "重置連結已過期或無效，請重新申請重置密碼";
        isValidToken.value = false;
      } else {
        errorMessage = `重置失敗: ${err.message}`;
      }
    }
    
    message.value = errorMessage;
    messageType.value = "error";
  } finally {
    loading.value = false;
  }
};

// 組件掛載時檢查 token
onMounted(() => {
  checkToken();
});
</script>

<style scoped>
form {
  max-width: 400px;
  margin: 20px 0;
}

form > div {
  margin: 15px 0;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

button {
  padding: 10px 20px;
  margin-right: 10px;
  cursor: pointer;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #007bff;
  color: white;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

button[type="button"] {
  background: #6c757d;
}

a {
  color: #007bff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>

