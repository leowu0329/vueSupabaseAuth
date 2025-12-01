<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm fixed-top">
    <div class="container-fluid">
      <!-- 品牌/Logo -->
      <router-link to="/dashboard" class="navbar-brand fw-bold text-primary">
        <i class="bi bi-speedometer2 me-2"></i>Dashboard
      </router-link>

      <!-- 響應式切換按鈕 -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- 導航內容 -->
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto align-items-center">
          <!-- 用戶下拉菜單 -->
          <li class="nav-item dropdown" v-if="authStore.isAuthenticated && authStore.user">
            <a
              class="nav-link dropdown-toggle d-flex align-items-center"
              href="#"
              id="userDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i class="bi bi-person-circle me-2" style="font-size: 1.25rem"></i>
              <span class="d-none d-md-inline">{{ authStore.user.email }}</span>
              <span class="d-md-none">帳號</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="userDropdown">
              <li>
                <h6 class="dropdown-header">
                  <i class="bi bi-envelope me-2"></i>{{ authStore.user.email }}
                </h6>
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <router-link to="/change-password" class="dropdown-item">
                  <i class="bi bi-key me-2"></i>重設密碼
                </router-link>
              </li>
              <li>
                <router-link to="/profile" class="dropdown-item">
                  <i class="bi bi-person-gear me-2"></i>修改個人訊息
                </router-link>
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <a class="dropdown-item text-danger" href="#" @click.prevent="handleLogout">
                  <i class="bi bi-box-arrow-right me-2"></i>登出
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

// 處理登出
const handleLogout = async () => {
  // 詢問是否確認登出
  if (!confirm("確定要登出嗎？")) {
    return;
  }

  try {
    // 使用 auth store 的登出方法
    const success = await authStore.logout();

    if (success) {
      // 跳轉到登入頁面
      router.push("/");
    } else {
      alert("登出失敗");
    }
  } catch (err) {
    console.error("登出錯誤:", err);
    alert(`登出失敗: ${err.message}`);
  }
};
</script>

<style scoped>
.navbar {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0.75rem 1rem;
  z-index: 1030;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}

.navbar-brand {
  color: #007bff !important;
  font-size: 1.25rem;
  transition: color 0.2s ease;
}

.navbar-brand:hover {
  color: #0056b3 !important;
}

.nav-link {
  color: #333 !important;
  font-weight: 500;
  transition: color 0.2s ease;
  padding: 0.5rem 1rem !important;
}

.nav-link:hover {
  color: #007bff !important;
}

.dropdown-toggle {
  cursor: pointer;
}

.dropdown-menu {
  border: none;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  border-radius: 0.5rem;
  margin-top: 0.5rem;
  min-width: 200px;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item.text-danger {
  color: #dc3545 !important;
}

.dropdown-item.text-danger:hover {
  background-color: #f8d7da;
  color: #721c24 !important;
}

.dropdown-header {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6c757d;
  padding: 0.5rem 1rem;
  margin-bottom: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}

.dropdown-divider {
  margin: 0.5rem 0;
}

/* 響應式設計 */
@media (max-width: 991.98px) {
  .navbar-collapse {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #dee2e6;
  }

  .dropdown-menu {
    position: static !important;
    float: none;
    width: 100%;
    margin-top: 0.5rem;
    box-shadow: none;
    border: 1px solid #dee2e6;
  }
}

/* 確保下拉菜單在移動端正常顯示 */
@media (max-width: 991.98px) {
  .navbar-nav {
    width: 100%;
  }

  .nav-item.dropdown {
    width: 100%;
  }

  .dropdown-toggle {
    width: 100%;
    text-align: left;
  }
}
</style>

