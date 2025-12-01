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
                  class="bi bi-key text-primary"
                  style="font-size: 3rem"
                ></i>
              </div>
              <h1 class="h2 fw-bold text-primary mb-2">忘記密碼</h1>
              <p class="text-muted">請輸入您的電子郵件，我們將發送重置密碼連結給您</p>
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
            <form @submit.prevent="handleResetPassword" class="mt-4">
              <!-- 電子郵件 -->
              <div class="mb-5">
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
                <div class="form-text mt-2">
                  我們將發送重置密碼連結到此電子郵件地址
                </div>
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
                  <i v-if="!loading" class="bi bi-send me-2"></i>
                  {{ loading ? "發送中..." : "發送重置密碼郵件" }}
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

