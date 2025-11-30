<template>
  <div>
    <h1>註冊</h1>

    <div v-if="message" :style="{ color: messageType === 'error' ? 'red' : 'green', margin: '10px 0', padding: '10px', background: messageType === 'error' ? '#ffe6e6' : '#e6ffe6', border: `1px solid ${messageType === 'error' ? '#ff9999' : '#99ff99'}`, borderRadius: '4px' }">
      {{ message }}
    </div>

    <form @submit.prevent="handleRegister">
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
          placeholder="至少 6 個字符" 
          required 
          minlength="6"
        />
      </div>

      <div>
        <label>確認密碼: </label>
        <input 
          type="password" 
          v-model="formData.confirmPassword" 
          placeholder="再次輸入密碼" 
          required 
          minlength="6"
        />
      </div>

      <div>
        <button type="submit" :disabled="loading">
          {{ loading ? "註冊中..." : "註冊" }}
        </button>
        <button type="button" @click="clearForm">清除</button>
      </div>
    </form>

    <div style="margin-top: 20px;">
      <router-link to="/login">已有帳號？前往登入</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../lib/supabase";

const router = useRouter();

const formData = ref({
  email: "",
  password: "",
  confirmPassword: "",
});

const loading = ref(false);
const message = ref("");
const messageType = ref("");

// 清除表單
const clearForm = () => {
  formData.value = {
    email: "",
    password: "",
    confirmPassword: "",
  };
  message.value = "";
  messageType.value = "";
};

// 處理註冊
const handleRegister = async () => {
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
    // 清理邮箱地址（去除前后空格）
    const email = formData.value.email.trim().toLowerCase();
    
    console.log("嘗試註冊，郵箱:", email);
    
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: formData.value.password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error("Supabase 註冊錯誤:", error);
      console.error("錯誤詳情:", {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      throw error;
    }

    console.log("註冊響應:", data);

    if (data.user) {
      message.value = "註冊成功！請檢查您的電子郵件以確認帳號。";
      messageType.value = "success";
      
      // 清除表單
      clearForm();

      // 可選：自動跳轉到登入頁面
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } else {
      message.value = "註冊失敗：未收到用戶數據";
      messageType.value = "error";
    }
  } catch (err) {
    console.error("註冊錯誤:", err);
    console.error("完整錯誤對象:", JSON.stringify(err, null, 2));
    
    let errorMessage = "註冊失敗";
    
    if (err.message) {
      if (err.message.includes("already registered") || err.message.includes("already exists") || err.message.includes("already been registered")) {
        errorMessage = "此電子郵件已被註冊";
      } else if (err.message.includes("Invalid email") || err.message.includes("is invalid")) {
        errorMessage = `電子郵件格式不正確或不被接受。\n\n請檢查：\n1. 郵箱格式是否正確\n2. Supabase 是否允許此郵箱域名\n3. 郵箱是否包含特殊字符\n\n錯誤詳情: ${err.message}`;
      } else if (err.message.includes("Password")) {
        errorMessage = "密碼不符合要求";
      } else if (err.message.includes("rate limit") || err.message.includes("too many")) {
        errorMessage = "請求過於頻繁，請稍後再試";
      } else {
        errorMessage = `註冊失敗: ${err.message}`;
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

