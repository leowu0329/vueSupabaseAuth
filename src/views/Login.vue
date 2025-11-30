<template>
  <div>
    <h1>登入</h1>

    <div v-if="message" :style="{ color: messageType === 'error' ? 'red' : 'green', margin: '10px 0', padding: '10px', background: messageType === 'error' ? '#ffe6e6' : '#e6ffe6', border: `1px solid ${messageType === 'error' ? '#ff9999' : '#99ff99'}`, borderRadius: '4px' }">
      {{ message }}
    </div>

    <form @submit.prevent="handleLogin">
      <div>
        <label>電子郵件: </label>
        <input 
          type="email" 
          v-model="formData.email" 
          placeholder="example@email.com" 
          required 
        />
      </div>

      <div>
        <label>密碼: </label>
        <input 
          type="password" 
          v-model="formData.password" 
          placeholder="請輸入密碼" 
          required 
        />
      </div>

      <div>
        <button type="submit" :disabled="loading">
          {{ loading ? "登入中..." : "登入" }}
        </button>
        <button type="button" @click="clearForm">清除</button>
      </div>
    </form>

    <div style="margin-top: 20px;">
      <router-link to="/register">還沒有帳號？前往註冊</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const formData = ref({
  email: "",
  password: "",
});

const loading = ref(false);
const message = ref("");
const messageType = ref("");

// 清除表單
const clearForm = () => {
  formData.value = {
    email: "",
    password: "",
  };
  message.value = "";
  messageType.value = "";
};

// 處理登入
const handleLogin = async () => {
  // 清除之前的訊息
  message.value = "";
  messageType.value = "";

  // 驗證郵箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmedEmail = formData.value.email.trim();
  
  if (!trimmedEmail) {
    message.value = "請輸入電子郵件";
    messageType.value = "error";
    return;
  }
  
  if (!emailRegex.test(trimmedEmail)) {
    message.value = "電子郵件格式不正確";
    messageType.value = "error";
    return;
  }

  if (!formData.value.password) {
    message.value = "請輸入密碼";
    messageType.value = "error";
    return;
  }

  loading.value = true;

  try {
    // 清理邮箱地址（去除前后空格）
    const email = trimmedEmail.toLowerCase();
    
    console.log("嘗試登入，郵箱:", email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: formData.value.password,
    });

    if (error) {
      console.error("Supabase 登入錯誤:", error);
      console.error("錯誤詳情:", {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      throw error;
    }

    console.log("登入響應:", data);

    if (data.user && data.session) {
      // 保存 session 和 token 到 store
      authStore.setSession(data.session);
      
      message.value = "登入成功！正在跳轉...";
      messageType.value = "success";
      
      // 清除表單
      clearForm();

      // 跳轉到 Dashboard（路由守衛會自動處理）
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } else {
      message.value = "登入失敗：未收到用戶數據";
      messageType.value = "error";
    }
  } catch (err) {
    console.error("登入錯誤:", err);
    console.error("完整錯誤對象:", JSON.stringify(err, null, 2));
    
    let errorMessage = "登入失敗";
    
    if (err.message) {
      if (err.message.includes("Invalid login credentials") || err.message.includes("Invalid credentials")) {
        errorMessage = "電子郵件或密碼錯誤";
      } else if (err.message.includes("Email not confirmed")) {
        errorMessage = "請先確認您的電子郵件地址";
      } else if (err.message.includes("User not found")) {
        errorMessage = "找不到此用戶，請先註冊";
      } else if (err.message.includes("rate limit") || err.message.includes("too many")) {
        errorMessage = "請求過於頻繁，請稍後再試";
      } else {
        errorMessage = `登入失敗: ${err.message}`;
      }
    }
    
    message.value = errorMessage;
    messageType.value = "error";
  } finally {
    loading.value = false;
  }
};
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

