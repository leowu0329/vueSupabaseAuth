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
                  class="bi bi-person-plus-fill text-primary"
                  style="font-size: 3rem"
                ></i>
              </div>
              <h1 class="h2 fw-bold text-primary mb-2">建立新帳號</h1>
              <p class="text-muted mb-0">請填寫以下資訊完成註冊</p>
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
            <form @submit.prevent="handleRegister" class="mt-4">
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
                <div class="form-text mt-2">我們不會分享您的電子郵件地址</div>
              </div>

              <!-- 密碼 -->
              <div class="mb-4">
                <label for="password" class="form-label fw-semibold mb-2">
                  <i class="bi bi-lock me-2"></i>密碼
                </label>
                <input
                  id="password"
                  type="password"
                  class="form-control form-control-lg"
                  :class="{
                    'is-invalid': messageType === 'error' && formData.password,
                  }"
                  v-model="formData.password"
                  placeholder="至少 6 個字符"
                  required
                  minlength="6"
                />
                <div class="form-text mt-2">密碼長度至少需要 6 個字符</div>
              </div>

              <!-- 確認密碼 -->
              <div class="mb-5">
                <label
                  for="confirmPassword"
                  class="form-label fw-semibold mb-2"
                >
                  <i class="bi bi-shield-lock me-2"></i>確認密碼
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  class="form-control form-control-lg"
                  :class="{
                    'is-invalid':
                      messageType === 'error' && formData.confirmPassword,
                  }"
                  v-model="formData.confirmPassword"
                  placeholder="再次輸入密碼"
                  required
                  minlength="6"
                />
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
                  <i v-if="!loading" class="bi bi-person-check me-2"></i>
                  {{ loading ? "註冊中..." : "註冊" }}
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

            <!-- 登入連結 -->
            <div class="text-center mt-4 pt-3 border-top">
              <p class="mb-0 text-muted">
                已有帳號？
                <router-link
                  to="/login"
                  class="text-primary fw-semibold text-decoration-none"
                >
                  前往登入
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

const router = useRouter();
const authStore = useAuthStore();

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
      // 如果有 session（某些情況下註冊後會自動登入），保存到 store
      if (data.session) {
        authStore.setSession(data.session);
        message.value = "註冊成功！正在跳轉...";
        messageType.value = "success";

        // 清除表單
        clearForm();

        // 自動跳轉到 Dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        // 需要確認郵件的情況
        message.value = "註冊成功！請檢查您的電子郵件以確認帳號。";
        messageType.value = "success";

        // 清除表單
        clearForm();

        // 自動跳轉到登入頁面
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    } else {
      message.value = "註冊失敗：未收到用戶數據";
      messageType.value = "error";
    }
  } catch (err) {
    console.error("註冊錯誤:", err);
    console.error("完整錯誤對象:", JSON.stringify(err, null, 2));

    let errorMessage = "註冊失敗";

    if (err.message) {
      if (
        err.message.includes("already registered") ||
        err.message.includes("already exists") ||
        err.message.includes("already been registered")
      ) {
        errorMessage = "此電子郵件已被註冊";
      } else if (
        err.message.includes("Invalid email") ||
        err.message.includes("is invalid")
      ) {
        errorMessage = `電子郵件格式不正確或不被接受。\n\n請檢查：\n1. 郵箱格式是否正確\n2. Supabase 是否允許此郵箱域名\n3. 郵箱是否包含特殊字符\n\n錯誤詳情: ${err.message}`;
      } else if (err.message.includes("Password")) {
        errorMessage = "密碼不符合要求";
      } else if (
        err.message.includes("rate limit") ||
        err.message.includes("too many")
      ) {
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
