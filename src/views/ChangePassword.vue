<template>
  <div>
    <h1>重設密碼</h1>

    <div v-if="message" :style="{ color: messageType === 'error' ? 'red' : 'green', margin: '10px 0', padding: '10px', background: messageType === 'error' ? '#ffe6e6' : '#e6ffe6', border: `1px solid ${messageType === 'error' ? '#ff9999' : '#99ff99'}`, borderRadius: '4px' }">
      {{ message }}
    </div>

    <form @submit.prevent="handleChangePassword">
      <div>
        <label>原密碼: </label>
        <input 
          type="password" 
          v-model="formData.oldPassword" 
          placeholder="請輸入原密碼" 
          required 
        />
      </div>

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
          {{ loading ? "更新中..." : "更新密碼" }}
        </button>
        <button type="button" @click="clearForm">清除</button>
      </div>
    </form>

    <div style="margin-top: 20px;">
      <router-link to="/dashboard">返回 Dashboard</router-link>
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
  oldPassword: "",
  password: "",
  confirmPassword: "",
});

const loading = ref(false);
const message = ref("");
const messageType = ref("");

// 清除表單
const clearForm = () => {
  formData.value = {
    oldPassword: "",
    password: "",
    confirmPassword: "",
  };
  message.value = "";
  messageType.value = "";
};

// 處理更改密碼
const handleChangePassword = async () => {
  // 清除之前的訊息
  message.value = "";
  messageType.value = "";

  // 驗證密碼
  if (formData.value.password !== formData.value.confirmPassword) {
    message.value = "新密碼與確認密碼不一致";
    messageType.value = "error";
    return;
  }

  // 驗證密碼長度
  if (formData.value.password.length < 6) {
    message.value = "新密碼長度至少需要 6 個字符";
    messageType.value = "error";
    return;
  }

  // 檢查新密碼是否與原密碼相同
  if (formData.value.oldPassword === formData.value.password) {
    message.value = "新密碼不能與原密碼相同";
    messageType.value = "error";
    return;
  }

  loading.value = true;

  try {
    // 先驗證原密碼是否正確
    if (!authStore.user || !authStore.user.email) {
      throw new Error("無法獲取用戶信息");
    }

    console.log("驗證原密碼...");
    
    // 使用原密碼嘗試重新登入來驗證
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: authStore.user.email,
      password: formData.value.oldPassword,
    });

    if (loginError) {
      throw new Error("原密碼錯誤");
    }

    console.log("原密碼驗證成功，更新密碼...");

    // 更新密碼
    const { data, error } = await supabase.auth.updateUser({
      password: formData.value.password,
    });

    if (error) {
      console.error("更新密碼錯誤:", error);
      console.error("錯誤詳情:", {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      throw error;
    }

    console.log("密碼更新成功:", data);

    message.value = "密碼更新成功！正在跳轉到 Dashboard...";
    messageType.value = "success";
    
    // 清除表單
    clearForm();

    // 更新 auth store 的 session
    await authStore.checkSession();

    // 跳轉到 Dashboard
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  } catch (err) {
    console.error("更改密碼錯誤:", err);
    console.error("完整錯誤對象:", JSON.stringify(err, null, 2));
    
    let errorMessage = "更改密碼失敗";
    
    if (err.message) {
      if (err.message.includes("原密碼錯誤") || err.message.includes("Invalid login credentials")) {
        errorMessage = "原密碼錯誤";
      } else if (err.message.includes("Password")) {
        errorMessage = "新密碼不符合要求";
      } else {
        errorMessage = `更改失敗: ${err.message}`;
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

