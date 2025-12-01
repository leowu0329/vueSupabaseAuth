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
                  class="bi bi-shield-lock-fill text-primary"
                  style="font-size: 3rem"
                ></i>
              </div>
              <h1 class="h2 fw-bold text-primary mb-2">重置密碼</h1>
              <p class="text-muted">請輸入您的新密碼</p>
            </div>


            <!-- 無效 token 提示 -->
            <div v-if="!isValidToken" class="alert alert-warning" role="alert">
              <h4 class="alert-heading">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>連結無效
              </h4>
              <p class="mb-0">
                無效的重置密碼連結或連結已過期。請重新申請重置密碼。
              </p>
              <hr />
              <div class="d-grid gap-2">
                <router-link to="/forgot-password" class="btn btn-primary">
                  <i class="bi bi-arrow-left me-2"></i>重新申請重置密碼
                </router-link>
              </div>
            </div>

            <!-- 表單 -->
            <form v-if="isValidToken" @submit.prevent="handleResetPassword" class="mt-4">
              <!-- 新密碼 -->
              <PasswordInput
                v-model="formData.password"
                label="新密碼"
                icon="bi bi-lock"
                placeholder="至少 6 個字符"
                input-id="password"
                :required="true"
                :minlength="6"
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
                  {{ loading ? "重置中..." : "重置密碼" }}
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
                to="/"
                class="text-primary fw-semibold text-decoration-none"
              >
                <i class="bi bi-arrow-left me-2"></i>返回登入
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
import { useRouter, useRoute } from "vue-router";
import { supabase } from "../lib/supabase";
import PasswordInput from "../components/PasswordInput.vue";
import { toast } from "vue3-toastify";

const router = useRouter();
const route = useRoute();

const formData = ref({
  password: "",
  confirmPassword: "",
});

const loading = ref(false);
const isValidToken = ref(false);

// 清除表單
const clearForm = () => {
  formData.value = {
    password: "",
    confirmPassword: "",
  };
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
  // 驗證密碼
  if (formData.value.password !== formData.value.confirmPassword) {
    toast.error("密碼與確認密碼不一致");
    return;
  }

  // 驗證密碼長度
  if (formData.value.password.length < 6) {
    toast.error("密碼長度至少需要 6 個字符");
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

    toast.success("密碼重置成功！正在跳轉到登入頁面...");
    
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
    
    toast.error(errorMessage);
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

.alert-heading {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
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

