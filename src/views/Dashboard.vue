<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h1>Dashboard - Supabase CRUD</h1>
      <button @click="handleLogout" style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
        登出
      </button>
    </div>

    <!-- 登出消息 -->
    <div v-if="logoutMessage" :style="{ color: 'green', margin: '10px 0', padding: '10px', background: '#e6ffe6', border: '1px solid #99ff99', borderRadius: '4px' }">
      {{ logoutMessage }}
    </div>
    
    <!-- 连接状态 -->
    <div style="margin-bottom: 20px; padding: 10px; background: #f0f0f0; border-radius: 4px;">
      <strong>Supabase 連接狀態:</strong> 
      <span style="color: green;">✓ 已連接</span>
      <div style="font-size: 12px; color: #666; margin-top: 5px;">
        提示: 如果查詢失敗，請確認表已創建。在 Supabase Dashboard 的 SQL Editor 中執行 supabase-setup.sql
      </div>
    </div>
    
    <!-- 表名输入 -->
    <div>
      <label>表名: </label>
      <input v-model="tableName" placeholder="例如: items" />
      <button @click="loadData">載入資料</button>
    </div>

    <!-- 创建表单 -->
    <div>
      <h2>新增資料</h2>
      <div>
        <label>名稱: </label>
        <input v-model="formData.name" placeholder="名稱" />
      </div>
      <div>
        <label>描述: </label>
        <input v-model="formData.description" placeholder="描述" />
      </div>
      <button @click="createItem">新增</button>
    </div>

    <!-- 数据列表 -->
    <div>
      <h2>資料列表</h2>
      <div v-if="loading">載入中...</div>
      <div v-else-if="error" style="color: red; white-space: pre-line; padding: 10px; background: #ffe6e6; border: 1px solid #ff9999; border-radius: 4px;">
        <strong>錯誤:</strong><br>{{ error }}
      </div>
      <div v-else>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>名稱</th>
              <th>描述</th>
              <th>建立時間</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td>{{ item.id }}</td>
              <td>
                <span v-if="!item.editing">{{ item.name }}</span>
                <input v-else v-model="item.editName" />
              </td>
              <td>
                <span v-if="!item.editing">{{ item.description }}</span>
                <input v-else v-model="item.editDescription" />
              </td>
              <td>{{ formatDate(item.created_at) }}</td>
              <td>
                <button v-if="!item.editing" @click="startEdit(item)">編輯</button>
                <template v-else>
                  <button @click="updateItem(item)">儲存</button>
                  <button @click="cancelEdit(item)">取消</button>
                </template>
                <button @click="deleteItem(item.id)">刪除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../lib/supabase";

const router = useRouter();

const tableName = ref("items");
const items = ref([]);
const loading = ref(false);
const error = ref(null);
const logoutMessage = ref("");

const formData = ref({
  name: "",
  description: "",
});

// 載入資料
const loadData = async () => {
  if (!tableName.value) {
    error.value = "請輸入表名";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    console.log(`嘗試查詢表: ${tableName.value}`);
    
    const { data, error: fetchError } = await supabase
      .from(tableName.value)
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Supabase 查詢錯誤:", fetchError);
      
      // 處理特定錯誤
      if (fetchError.code === "PGRST116" || fetchError.message.includes("relation") || fetchError.message.includes("does not exist")) {
        throw new Error(`表 "${tableName.value}" 不存在。請先在 Supabase Dashboard 中創建此表，或執行 supabase-setup.sql 腳本。`);
      } else if (fetchError.code === "42501" || fetchError.message.includes("permission")) {
        throw new Error(`沒有權限訪問表 "${tableName.value}"。請檢查 Row Level Security (RLS) 策略設置。`);
      } else {
        throw fetchError;
      }
    }

    console.log(`成功載入 ${data?.length || 0} 筆資料`);

    // 為每個項目添加編輯狀態
    items.value = (data || []).map((item) => ({
      ...item,
      editing: false,
      editName: item.name || "",
      editDescription: item.description || "",
    }));
  } catch (err) {
    let errorMessage = err.message || "未知錯誤";
    
    // 處理網絡錯誤
    if (errorMessage.includes("Failed to fetch") || errorMessage.includes("ERR_NAME_NOT_RESOLVED") || errorMessage.includes("TypeError")) {
      errorMessage = `無法連接到 Supabase 服務器。\n\n可能的原因：\n1. 表 "${tableName.value}" 不存在 - 請在 Supabase Dashboard 的 SQL Editor 中執行 supabase-setup.sql\n2. 網絡連接問題 - 請檢查網絡連接\n3. DNS 解析失敗 - 請嘗試刷新頁面或清除瀏覽器緩存\n\n錯誤詳情: ${err.message}`;
    }
    
    error.value = errorMessage;
    console.error("載入資料錯誤:", err);
    console.error("錯誤詳情:", {
      message: err.message,
      details: err.details,
      hint: err.hint,
      code: err.code
    });
  } finally {
    loading.value = false;
  }
};

// 新增資料
const createItem = async () => {
  if (!tableName.value) {
    error.value = "請輸入表名";
    return;
  }

  if (!formData.value.name) {
    error.value = "請輸入名稱";
    return;
  }

  try {
    const { data, error: insertError } = await supabase
      .from(tableName.value)
      .insert([formData.value])
      .select();

    if (insertError) throw insertError;

    // 清空表單
    formData.value = { name: "", description: "" };

    // 重新載入資料
    await loadData();
  } catch (err) {
    error.value = err.message;
    console.error("新增資料錯誤:", err);
  }
};

// 開始編輯
const startEdit = (item) => {
  item.editing = true;
  item.editName = item.name || "";
  item.editDescription = item.description || "";
};

// 取消編輯
const cancelEdit = (item) => {
  item.editing = false;
  item.editName = item.name || "";
  item.editDescription = item.description || "";
};

// 更新資料
const updateItem = async (item) => {
  if (!tableName.value) {
    error.value = "請輸入表名";
    return;
  }

  try {
    const { error: updateError } = await supabase
      .from(tableName.value)
      .update({
        name: item.editName,
        description: item.editDescription,
      })
      .eq("id", item.id);

    if (updateError) throw updateError;

    // 更新本地資料
    item.name = item.editName;
    item.description = item.editDescription;
    item.editing = false;

    // 重新載入資料以確保同步
    await loadData();
  } catch (err) {
    error.value = err.message;
    console.error("更新資料錯誤:", err);
  }
};

// 刪除資料
const deleteItem = async (id) => {
  if (!tableName.value) {
    error.value = "請輸入表名";
    return;
  }

  if (!confirm("確定要刪除這筆資料嗎？")) {
    return;
  }

  try {
    const { error: deleteError } = await supabase
      .from(tableName.value)
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    // 重新載入資料
    await loadData();
  } catch (err) {
    error.value = err.message;
    console.error("刪除資料錯誤:", err);
  }
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("zh-TW");
};

// 處理登出
const handleLogout = async () => {
  // 詢問是否確認登出
  if (!confirm("確定要登出嗎？")) {
    return;
  }

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    // 顯示登出成功消息
    logoutMessage.value = "已登出";

    // 清除登出消息並跳轉到登入頁面
    setTimeout(() => {
      router.push("/");
    }, 1500);
  } catch (err) {
    console.error("登出錯誤:", err);
    error.value = `登出失敗: ${err.message}`;
  }
};

// 組件掛載時載入資料
onMounted(() => {
  loadData();
});
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

button {
  margin: 5px;
  padding: 5px 10px;
  cursor: pointer;
}

input {
  margin: 5px;
  padding: 5px;
}
</style>

