<template>
  <div v-if="show" class="loading-container">
    <div class="loading-content">
      <div class="spinner-border text-primary mb-3" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
      <p class="loading-text">{{ text }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  text: {
    type: String,
    default: "載入中...",
  },
});
</script>

<style scoped>
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.loading-content {
  background: white;
  padding: 2rem 3rem;
  border-radius: 1rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  text-align: center;
  min-width: 200px;
}

.loading-text {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: #495057;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.3rem;
}

/* 響應式設計 */
@media (max-width: 576px) {
  .loading-content {
    padding: 1.5rem 2rem;
    min-width: 180px;
  }

  .loading-text {
    font-size: 1rem;
  }

  .spinner-border {
    width: 2.5rem;
    height: 2.5rem;
  }
}

/* 動畫效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.loading-container {
  animation: fadeIn 0.2s ease;
}
</style>

