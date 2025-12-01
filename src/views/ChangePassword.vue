<template>
  <div class="page-container bg-light">
    <div
      class="container-fluid d-flex justify-content-center align-items-center min-vh-100 py-4 py-md-5"
    >
      <div class="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">
        <div class="card shadow-lg border-0">
          <div class="card-body">
            <!-- 標題區域 -->
            <div class="text-center mb-4">
              <div class="mb-3">
                <i
                  class="bi bi-key-fill text-primary"
                  style="font-size: 3rem"
                ></i>
              </div>
              <h1 class="h2 fw-bold text-primary mb-2">重設密碼</h1>
              <p class="text-muted">請輸入您的原密碼和新密碼</p>
            </div>


            <!-- 表單 -->
            <form @submit.prevent="handleChangePassword" class="mt-4">
              <!-- 原密碼 -->
              <PasswordInput
                v-model="formData.oldPassword"
                label="原密碼"
                icon="bi bi-lock"
                placeholder="請輸入原密碼"
                input-id="oldPassword"
                :required="true"
                :is-invalid="false"
              />

              <!-- 新密碼 -->
              <PasswordInput
                v-model="formData.password"
                label="新密碼"
                icon="bi bi-shield-lock"
                placeholder="至少 6 個字符"
                input-id="password"
                :required="true"
                :minlength="6"
                :is-invalid="false"
                help-text="密碼長度至少需要 6 個字符"
              />

              <!-- 確認新密碼 -->
              <PasswordInput
                v-model="formData.confirmPassword"
                label="確認新密碼"
                icon="bi bi-shield-check"
                placeholder="再次輸入新密碼"
                input-id="confirmPassword"
                :required="true"
                :minlength="6"
                :is-invalid="false"
                container-class="mb-5"
              />

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
                  <i v-if="!loading" class="bi bi-check-circle me-2"></i>
                  {{ loading ? "更新中..." : "更新密碼" }}
                </button>
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="clearForm"
                >
                  <i class="bi bi-x-circle me-2"></i>清除
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
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/auth";
import PasswordInput from "../components/PasswordInput.vue";
import { toast } from "vue3-toastify";

const router = useRouter();
const authStore = useAuthStore();

const formData = ref({
  oldPassword: "",
  password: "",
  confirmPassword: "",
});

const loading = ref(false);

// 清除表單
const clearForm = () => {
  formData.value = {
    oldPassword: "",
    password: "",
    confirmPassword: "",
  };
};

// 處理更改密碼
const handleChangePassword = async () => {
  // 驗證密碼
  if (formData.value.password !== formData.value.confirmPassword) {
    toast.error("新密碼與確認密碼不一致");
    return;
  }

  // 驗證密碼長度
  if (formData.value.password.length < 6) {
    toast.error("新密碼長度至少需要 6 個字符");
    return;
  }

  // 檢查新密碼是否與原密碼相同
  if (formData.value.oldPassword === formData.value.password) {
    toast.error("新密碼不能與原密碼相同");
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

    toast.success("密碼更新成功！正在跳轉到 Dashboard...");
    
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
    
    toast.error(errorMessage);
  } finally {
    loading.value = false;
  }
};
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

.form-control-lg {
  border-radius: 8px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.form-control-lg:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.form-control-lg.is-invalid {
  border-color: #dc3545;
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

  .form-control-lg {
    font-size: 1rem;
    padding-left: 1rem;
    padding-right: 1rem;
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

