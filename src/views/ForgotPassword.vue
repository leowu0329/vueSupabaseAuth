<template>
  <div class="page-container">
    <div class="container-fluid d-flex justify-content-center align-items-center min-vh-100">
      <div class="w-100" style="max-width: 500px;">
        <h1 class="text-center mb-4">忘記密碼</h1>

    <div v-if="message" :style="{ color: messageType === 'error' ? 'red' : 'green', margin: '10px 0', padding: '10px', background: messageType === 'error' ? '#ffe6e6' : '#e6ffe6', border: `1px solid ${messageType === 'error' ? '#ff9999' : '#99ff99'}`, borderRadius: '4px' }">
      {{ message }}
    </div>

    <form @submit.prevent="handleResetPassword">
      <div>
        <label>電子郵件: </label>
        <input 
          type="email" 
          v-model="formData.email" 
          placeholder="請輸入您的電子郵件" 
          required 
        />
      </div>

      <div>
        <button type="submit" :disabled="loading">
          {{ loading ? "發送中..." : "發送重置密碼郵件" }}
        </button>
        <button type="button" @click="clearForm">清除</button>
      </div>
    </form>

        <div class="text-center mt-4">
          <router-link to="/">返回登入</router-link>
        </div>
      </div>
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
});

const loading = ref(false);
const message = ref("");
const messageType = ref("");

// 清除表單
const clearForm = () => {
  formData.value = {
    email: "",
  };
  message.value = "";
  messageType.value = "";
};

// 處理重置密碼
const handleResetPassword = async () => {
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

  loading.value = true;

  try {
    // 清理邮箱地址（去除前后空格）
    const email = trimmedEmail.toLowerCase();
    
    console.log("嘗試發送重置密碼郵件，郵箱:", email);
    
    // 發送重置密碼郵件
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error("發送重置密碼郵件錯誤:", error);
      console.error("錯誤詳情:", {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      throw error;
    }

    console.log("重置密碼郵件發送成功");

    message.value = "重置密碼郵件已發送！請檢查您的電子郵件並按照指示重置密碼。";
    messageType.value = "success";
    
    // 清除表單
    clearForm();

    // 可選：自動跳轉到登入頁面
    setTimeout(() => {
      router.push("/");
    }, 3000);
  } catch (err) {
    console.error("發送重置密碼郵件錯誤:", err);
    console.error("完整錯誤對象:", JSON.stringify(err, null, 2));
    
    let errorMessage = "發送重置密碼郵件失敗";
    
    if (err.message) {
      if (err.message.includes("rate limit") || err.message.includes("too many")) {
        errorMessage = "請求過於頻繁，請稍後再試";
      } else if (err.message.includes("not found") || err.message.includes("does not exist")) {
        // 為了安全，不告訴用戶郵箱是否存在
        errorMessage = "如果該郵箱已註冊，重置密碼郵件已發送。請檢查您的電子郵件。";
        messageType.value = "success";
      } else {
        errorMessage = `發送失敗: ${err.message}`;
      }
    }
    
    message.value = errorMessage;
    if (messageType.value !== "success") {
      messageType.value = "error";
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.page-container {
  width: 100%;
  min-height: 100vh;
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

