<template>
  <div>
    <h1>修改個人訊息</h1>

    <div v-if="message" :style="{ color: messageType === 'error' ? 'red' : 'green', margin: '10px 0', padding: '10px', background: messageType === 'error' ? '#ffe6e6' : '#e6ffe6', border: `1px solid ${messageType === 'error' ? '#ff9999' : '#99ff99'}`, borderRadius: '4px' }">
      {{ message }}
    </div>

    <form @submit.prevent="handleSaveProfile">
      <div>
        <label>姓名: </label>
        <input 
          type="text" 
          v-model="formData.name" 
          placeholder="請輸入姓名" 
        />
      </div>

      <div>
        <label>手機: </label>
        <input 
          type="tel" 
          v-model="formData.phone" 
          placeholder="請輸入手機號碼" 
        />
      </div>

      <div>
        <label>住址: </label>
        <input 
          type="text" 
          v-model="formData.address" 
          placeholder="請輸入住址" 
        />
      </div>

      <div>
        <label>生日: </label>
        <input 
          type="date" 
          v-model="formData.birthday" 
        />
      </div>

      <div>
        <label>權限: </label>
        <select v-model="formData.role" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
          <option value="">請選擇權限</option>
          <option value="管理者">管理者</option>
          <option value="一般使用者">一般使用者</option>
          <option value="訪客">訪客</option>
        </select>
      </div>

      <div>
        <label>部門: </label>
        <select v-model="formData.department" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
          <option value="">請選擇部門</option>
          <option value="IQC">IQC</option>
          <option value="IPQC">IPQC</option>
          <option value="FQC">FQC</option>
        </select>
      </div>

      <div>
        <button type="submit" :disabled="loading">
          {{ loading ? "儲存中..." : "儲存" }}
        </button>
        <button type="button" @click="loadProfile">重新載入</button>
      </div>
    </form>

    <div style="margin-top: 20px;">
      <router-link to="/dashboard">返回 Dashboard</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const formData = ref({
  name: "",
  phone: "",
  address: "",
  birthday: "",
  role: "",
  department: "",
});

const loading = ref(false);
const message = ref("");
const messageType = ref("");

// 載入個人資料
const loadProfile = async () => {
  try {
    if (!authStore.user) {
      message.value = "無法獲取用戶信息";
      messageType.value = "error";
      return;
    }

    const userId = authStore.user.id;
    console.log("載入個人資料，用戶 ID:", userId);

    // 從 profiles 表載入資料
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      // 如果記錄不存在，創建一個空記錄
      if (error.code === "PGRST116") {
        console.log("個人資料不存在，將創建新記錄");
        formData.value = {
          name: "",
          phone: "",
          address: "",
          birthday: "",
          role: "",
          department: "",
        };
        return;
      }
      throw error;
    }

    // 載入資料到表單
    if (data) {
      formData.value = {
        name: data.name || "",
        phone: data.phone || "",
        address: data.address || "",
        birthday: data.birthday || "",
        role: data.role || "",
        department: data.department || "",
      };
    }

    console.log("個人資料載入成功:", formData.value);
  } catch (err) {
    console.error("載入個人資料錯誤:", err);
    message.value = "載入個人資料失敗: " + (err.message || "未知錯誤");
    messageType.value = "error";
  }
};

// 處理儲存個人資料
const handleSaveProfile = async () => {
  // 清除之前的訊息
  message.value = "";
  messageType.value = "";

  loading.value = true;

  try {
    if (!authStore.user) {
      throw new Error("無法獲取用戶信息");
    }

    const userId = authStore.user.id;
    console.log("儲存個人資料，用戶 ID:", userId);
    console.log("儲存個人資料:", formData.value);

    // 檢查記錄是否存在
    const { data: existingData, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    let data, error;

    if (checkError && checkError.code === "PGRST116") {
      // 記錄不存在，插入新記錄
      console.log("插入新記錄");
      const insertData = {
        id: userId,
        name: formData.value.name || null,
        phone: formData.value.phone || null,
        address: formData.value.address || null,
        birthday: formData.value.birthday || null,
        role: formData.value.role || null,
        department: formData.value.department || null,
      };

      const result = await supabase
        .from("profiles")
        .insert([insertData])
        .select()
        .single();

      data = result.data;
      error = result.error;
    } else {
      // 記錄存在，更新記錄
      console.log("更新現有記錄");
      const updateData = {
        name: formData.value.name || null,
        phone: formData.value.phone || null,
        address: formData.value.address || null,
        birthday: formData.value.birthday || null,
        role: formData.value.role || null,
        department: formData.value.department || null,
      };

      const result = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId)
        .select()
        .single();

      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error("儲存個人資料錯誤:", error);
      console.error("錯誤詳情:", {
        message: error.message,
        status: error.status,
        name: error.name,
        code: error.code,
      });
      throw error;
    }

    console.log("個人資料儲存成功:", data);

    message.value = "個人資料更新成功！正在跳轉到 Dashboard...";
    messageType.value = "success";

    // 更新 auth store 的 session
    await authStore.checkSession();

    // 跳轉到 Dashboard
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  } catch (err) {
    console.error("儲存個人資料錯誤:", err);
    console.error("完整錯誤對象:", JSON.stringify(err, null, 2));

    let errorMessage = "儲存個人資料失敗";

    if (err.message) {
      if (err.message.includes("permission") || err.message.includes("policy")) {
        errorMessage = "沒有權限儲存個人資料。請確認已執行 supabase-profiles-setup.sql 腳本。";
      } else {
        errorMessage = `儲存失敗: ${err.message}`;
      }
    }

    message.value = errorMessage;
    messageType.value = "error";
  } finally {
    loading.value = false;
  }
};

// 組件掛載時載入資料
onMounted(() => {
  loadProfile();
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

select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  background: white;
  cursor: pointer;
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

