<template>
  <div class="page-container">
    <div class="container-fluid my-4">
      <!-- 頁面標題 -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <h1 class="h2 fw-bold text-primary mb-0">
          <i class="bi bi-speedometer2 me-2"></i>Dashboard - Supabase CRUD
        </h1>
      </div>

      <!-- 連接狀態 -->
      <div class="alert alert-info mb-4" role="alert">
        <div class="d-flex align-items-center">
          <i class="bi bi-check-circle-fill text-success me-2" style="font-size: 1.25rem"></i>
          <div>
            <strong>Supabase 連接狀態:</strong>
            <span class="text-success fw-bold ms-2">✓ 已連接</span>
            <div class="small text-muted mt-1">
              提示: 如果查詢失敗，請確認表已創建。在 Supabase Dashboard 的 SQL Editor 中執行 supabase-setup.sql
            </div>
          </div>
        </div>
      </div>

      <!-- 表名輸入 -->
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <div class="row align-items-end g-3">
            <div class="col-md-4">
              <label for="tableNameInput" class="form-label fw-semibold">
                <i class="bi bi-table me-2"></i>表名:
              </label>
              <input
                id="tableNameInput"
                v-model="tableName"
                class="form-control"
                placeholder="例如: items"
              />
            </div>
            <div class="col-md-auto">
              <button @click="loadData" class="btn btn-primary" :disabled="loading">
                <span
                  v-if="loading"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                <i v-if="!loading" class="bi bi-arrow-clockwise me-2"></i>載入資料
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 創建表單 -->
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-primary text-white fw-bold">
          <i class="bi bi-plus-circle me-2"></i>新增資料
        </div>
        <div class="card-body">
          <form @submit.prevent="createItem" class="row g-3">
            <div class="col-md-6">
              <label for="newName" class="form-label fw-semibold">
                <i class="bi bi-tag me-2"></i>名稱:
              </label>
              <input
                id="newName"
                v-model="formData.name"
                class="form-control"
                placeholder="名稱"
                required
              />
            </div>
            <div class="col-md-6">
              <label for="newDescription" class="form-label fw-semibold">
                <i class="bi bi-file-text me-2"></i>描述:
              </label>
              <input
                id="newDescription"
                v-model="formData.description"
                class="form-control"
                placeholder="描述"
              />
            </div>
            <div class="col-12">
              <button type="submit" class="btn btn-success" :disabled="loading">
                <span
                  v-if="loading"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                <i v-if="!loading" class="bi bi-save me-2"></i>新增
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 資料列表 -->
      <div class="card shadow-sm">
        <div class="card-header bg-info text-white fw-bold">
          <i class="bi bi-list-ul me-2"></i>資料列表
        </div>
        <div class="card-body">
          <!-- 載入中 -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">載入中...</span>
            </div>
            <p class="mt-3 text-muted">載入中...</p>
          </div>

          <!-- 錯誤訊息 -->
          <div v-else-if="error" class="alert alert-danger" role="alert">
            <h4 class="alert-heading">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>載入資料錯誤!
            </h4>
            <p style="white-space: pre-line">{{ error }}</p>
            <hr />
            <p class="mb-0">
              請檢查您的 Supabase 配置、網絡連接，並確保表名 (<code>{{ tableName }}</code>) 正確且已在 Supabase 中創建。
            </p>
          </div>

          <!-- 資料表格 -->
          <div v-else>
            <div v-if="items.length === 0" class="alert alert-warning text-center" role="alert">
              <i class="bi bi-inbox me-2"></i>目前沒有資料。請新增一些資料或檢查表名。
            </div>
            <div v-else class="table-responsive">
              <table class="table table-striped table-hover align-middle">
                <thead class="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>名稱</th>
                    <th>描述</th>
                    <th>建立時間</th>
                    <th class="text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in items" :key="item.id">
                    <td class="fw-semibold">{{ item.id }}</td>
                    <td>
                      <span v-if="!item.editing">{{ item.name }}</span>
                      <input
                        v-else
                        v-model="item.editName"
                        class="form-control form-control-sm"
                      />
                    </td>
                    <td>
                      <span v-if="!item.editing">{{ item.description || "-" }}</span>
                      <input
                        v-else
                        v-model="item.editDescription"
                        class="form-control form-control-sm"
                      />
                    </td>
                    <td class="text-muted small">{{ formatDate(item.created_at) }}</td>
                    <td>
                      <div class="d-flex gap-2 justify-content-center">
                        <button
                          v-if="!item.editing"
                          @click="startEdit(item)"
                          class="btn btn-sm btn-warning"
                        >
                          <i class="bi bi-pencil me-1"></i>編輯
                        </button>
                        <template v-else>
                          <button @click="updateItem(item)" class="btn btn-sm btn-success">
                            <i class="bi bi-check-lg me-1"></i>儲存
                          </button>
                          <button @click="cancelEdit(item)" class="btn btn-sm btn-secondary">
                            <i class="bi bi-x-lg me-1"></i>取消
                          </button>
                        </template>
                        <button
                          @click="deleteItem(item.id)"
                          class="btn btn-sm btn-danger"
                        >
                          <i class="bi bi-trash me-1"></i>刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../lib/supabase";

const tableName = ref("items");
const items = ref([]);
const loading = ref(false);
const error = ref(null);

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


// 組件掛載時載入資料
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.page-container {
  width: 100%;
  min-height: calc(100vh - 70px);
  background-color: #f8f9fa;
}

.card {
  border: none;
  border-radius: 0.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.card-header {
  border-radius: 0.5rem 0.5rem 0 0 !important;
  border: none;
}

.table {
  margin-bottom: 0;
}

.table thead th {
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
}

.table tbody tr {
  transition: background-color 0.15s ease;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

.btn {
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
}

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

.form-control {
  border-radius: 0.375rem;
  border: 1px solid #ced4da;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.alert {
  border-radius: 0.5rem;
  border: none;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.875rem;
  }

  .btn-sm {
    padding: 0.2rem 0.5rem;
    font-size: 0.75rem;
  }

  .d-flex.gap-2 {
    flex-wrap: wrap;
  }

  h1 {
    font-size: 1.5rem;
  }
}

@media (max-width: 576px) {
  .card-body {
    padding: 1rem;
  }

  .table {
    font-size: 0.75rem;
  }

  .btn-sm {
    padding: 0.15rem 0.4rem;
    font-size: 0.7rem;
  }

  .btn-sm i {
    font-size: 0.7rem;
  }
}
</style>

