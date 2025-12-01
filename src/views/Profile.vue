<template>
  <div class="page-container bg-light">
    <div
      class="container-fluid d-flex justify-content-center align-items-center min-vh-100 py-4 py-md-5"
    >
      <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
        <div class="card shadow-lg border-0">
          <div class="card-body">
            <!-- 標題區域 -->
            <div class="text-center mb-4">
              <div class="mb-3">
                <i
                  class="bi bi-person-gear text-primary"
                  style="font-size: 3rem"
                ></i>
              </div>
              <h1 class="h2 fw-bold text-primary mb-2">修改個人訊息</h1>
              <p class="text-muted">請填寫您的個人資料</p>
            </div>


            <!-- 表單 -->
            <form @submit.prevent="handleSaveProfile" class="mt-4">
              <!-- 姓名 -->
              <div class="mb-4">
                <label for="name" class="form-label fw-semibold mb-2">
                  <i class="bi bi-person me-2"></i>姓名
                </label>
                <input
                  id="name"
                  type="text"
                  class="form-control form-control-lg"
                  v-model="formData.name"
                  placeholder="請輸入姓名"
                />
              </div>

              <!-- 手機 -->
              <div class="mb-4">
                <label for="phone" class="form-label fw-semibold mb-2">
                  <i class="bi bi-telephone me-2"></i>手機
                </label>
                <input
                  id="phone"
                  type="tel"
                  class="form-control form-control-lg"
                  v-model="formData.phone"
                  placeholder="請輸入手機號碼"
                />
              </div>

              <!-- 住址 -->
              <div class="mb-4">
                <label for="address" class="form-label fw-semibold mb-2">
                  <i class="bi bi-geo-alt me-2"></i>住址
                </label>
                <input
                  id="address"
                  type="text"
                  class="form-control form-control-lg"
                  v-model="formData.address"
                  placeholder="請輸入住址"
                />
              </div>

              <!-- 生日 -->
              <div class="mb-4">
                <label for="birthday" class="form-label fw-semibold mb-2">
                  <i class="bi bi-calendar-event me-2"></i>生日
                </label>
                <input
                  id="birthday"
                  type="date"
                  class="form-control form-control-lg"
                  v-model="formData.birthday"
                />
              </div>

              <!-- 權限 -->
              <div class="mb-4">
                <label for="role" class="form-label fw-semibold mb-2">
                  <i class="bi bi-shield-check me-2"></i>權限
                </label>
                <select
                  id="role"
                  class="form-select form-select-lg"
                  v-model="formData.role"
                >
                  <option value="">請選擇權限</option>
                  <option value="管理者">管理者</option>
                  <option value="一般使用者">一般使用者</option>
                  <option value="訪客">訪客</option>
                </select>
              </div>

              <!-- 部門 -->
              <div class="mb-5">
                <label for="department" class="form-label fw-semibold mb-2">
                  <i class="bi bi-building me-2"></i>部門
                </label>
                <select
                  id="department"
                  class="form-select form-select-lg"
                  v-model="formData.department"
                >
                  <option value="">請選擇部門</option>
                  <option value="IQC">IQC</option>
                  <option value="IPQC">IPQC</option>
                  <option value="FQC">FQC</option>
                </select>
              </div>

              <!-- 按鈕 -->
              <div class="d-grid gap-2 mb-3">
                <button
                  type="submit"
                  class="btn btn-primary btn-lg"
                  :disabled="loading"
                >
                  <span
                    v-if="loading"
                    class="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  <i v-if="!loading" class="bi bi-save me-2"></i>
                  {{ loading ? "儲存中..." : "儲存" }}
                </button>
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="loadProfile"
                  :disabled="loading"
                >
                  <i class="bi bi-arrow-clockwise me-2"></i>重新載入
                </button>
              </div>
            </form>

            <!-- 返回連結 -->
            <div class="text-center mt-4 pt-3 border-top">
              <router-link
                to="/dashboard"
                class="text-primary fw-semibold text-decoration-none"
              >
                <i class="bi bi-arrow-left me-2"></i>返回 Dashboard
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/auth";
import { toast } from "vue3-toastify";

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

// 載入個人資料
const loadProfile = async () => {
  try {
    if (!authStore.user) {
      toast.error("無法獲取用戶信息");
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
    toast.error("載入個人資料失敗: " + (err.message || "未知錯誤"));
  }
};

// 處理儲存個人資料
const handleSaveProfile = async () => {
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

    toast.success("個人資料更新成功！正在跳轉到 Dashboard...");

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

    toast.error(errorMessage);
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
.page-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card {
  border-radius: 15px;
  border: none !important;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2) !important;
}

.card-body {
  background: white;
  padding: 1rem 1rem !important;
}

.form-label {
  color: #495057;
  margin-bottom: 0.5rem;
}

.form-control-lg,
.form-select-lg {
  border-radius: 8px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.form-control-lg:focus,
.form-select-lg:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.form-select-lg {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 16px 12px;
  padding-right: 3rem;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  padding: 12px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  transform: none;
  opacity: 0.6;
}

.btn-outline-secondary {
  border-radius: 8px;
  font-weight: 500;
  padding: 12px;
}

.alert {
  border-radius: 8px;
  border: none;
}

h1 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 響應式設計 */
@media (max-width: 576px) {
  .card-body {
    padding: 1.5rem 1.25rem !important;
  }

  h1 {
    font-size: 1.5rem;
  }

  .form-control-lg,
  .form-select-lg {
    font-size: 1rem;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .form-select-lg {
    padding-right: 2.5rem;
  }

  .bi {
    font-size: 2rem !important;
  }
}

/* 動畫效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  animation: fadeIn 0.5s ease;
}
</style>

