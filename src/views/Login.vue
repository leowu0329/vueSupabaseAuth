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
                  class="bi bi-box-arrow-in-right text-primary"
                  style="font-size: 3rem"
                ></i>
              </div>
              <h1 class="h2 fw-bold text-primary mb-2">登入帳號</h1>
              <p class="text-muted">請輸入您的電子郵件和密碼</p>
            </div>

            <!-- 訊息提示 -->
            <div
              v-if="message"
              :class="[
                'alert',
                messageType === 'error' ? 'alert-danger' : 'alert-success',
                'alert-dismissible fade show',
              ]"
              role="alert"
            >
              <div style="white-space: pre-line">{{ message }}</div>
              <button
                type="button"
                class="btn-close"
                @click="message = ''"
                aria-label="Close"
              ></button>
            </div>

            <!-- 表單 -->
            <form @submit.prevent="handleLogin" class="mt-4">
              <!-- 電子郵件 -->
              <div class="mb-4">
                <label for="email" class="form-label fw-semibold mb-2">
                  <i class="bi bi-envelope me-2"></i>電子郵件
                </label>
                <input
                  id="email"
                  type="email"
                  class="form-control form-control-lg"
                  :class="{
                    'is-invalid': messageType === 'error' && formData.email,
                  }"
                  v-model="formData.email"
                  placeholder="example@email.com"
                  required
                />
              </div>

              <!-- 密碼 -->
              <PasswordInput
                v-model="formData.password"
                label="密碼"
                icon="bi bi-lock"
                placeholder="請輸入密碼"
                input-id="password"
                :required="true"
                :is-invalid="messageType === 'error' && formData.password"
              />
              <div class="text-end mt-2 mb-3">
                <router-link
                  to="/forgot-password"
                  class="text-primary fw-semibold text-decoration-none small"
                >
                  忘記密碼？
                </router-link>
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
                  <i v-if="!loading" class="bi bi-box-arrow-in-right me-2"></i>
                  {{ loading ? "登入中..." : "登入" }}
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

            <!-- 註冊連結 -->
            <div class="text-center mt-4 pt-3 border-top">
              <p class="mb-0 text-muted">
                還沒有帳號？
                <router-link
                  to="/register"
                  class="text-primary fw-semibold text-decoration-none"
                >
                  前往註冊
                </router-link>
              </p>
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

