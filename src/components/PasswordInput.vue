<template>
  <div :class="containerClass">
    <label v-if="label" :for="inputId" class="form-label fw-semibold mb-2">
      <i v-if="icon" :class="[icon, 'me-2']"></i>{{ label }}
    </label>
    <div class="position-relative">
      <input
        :id="inputId"
        :type="showPassword ? 'text' : 'password'"
        class="form-control form-control-lg"
        :class="{
          'is-invalid': isInvalid,
        }"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        :required="required"
        :minlength="minlength"
        :disabled="disabled"
      />
      <button
        type="button"
        class="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3"
        style="border: none; background: none; z-index: 10; padding: 0.5rem;"
        @click="togglePasswordVisibility"
        :aria-label="showPassword ? '隱藏密碼' : '顯示密碼'"
      >
        <i
          :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
          style="font-size: 1.25rem; color: #6c757d;"
        ></i>
      </button>
    </div>
    <div v-if="helpText" class="form-text mt-2">{{ helpText }}</div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: "",
  },
  icon: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "請輸入密碼",
  },
  required: {
    type: Boolean,
    default: false,
  },
  minlength: {
    type: [String, Number],
    default: null,
  },
  isInvalid: {
    type: Boolean,
    default: false,
  },
  helpText: {
    type: String,
    default: "",
  },
  inputId: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  containerClass: {
    type: String,
    default: "mb-4",
  },
});

const emit = defineEmits(["update:modelValue"]);

const showPassword = ref(false);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};
</script>

<style scoped>
.position-relative {
  position: relative;
}

.btn-link {
  text-decoration: none;
}

.btn-link:hover {
  text-decoration: none;
}

.btn-link:focus {
  box-shadow: none;
  outline: none;
}

.form-control-lg {
  padding-right: 3rem !important;
}
</style>

