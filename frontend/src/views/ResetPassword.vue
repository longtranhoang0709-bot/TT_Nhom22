<template>
  <div class="auth-container">
    <h2>Đặt Lại Mật Khẩu</h2>
    <form @submit.prevent="handleReset">
      <input
        v-model="newPassword"
        type="password"
        placeholder="Mật khẩu mới"
        required
      />
      <input
        v-model="confirmPassword"
        type="password"
        placeholder="Nhập lại mật khẩu"
        required
      />
      <button type="submit">Xác Nhận</button>
    </form>
    <p v-if="message" class="success">{{ message }}</p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { resetPassword } from "../api/auth";

const newPassword = ref("");
const confirmPassword = ref("");
const message = ref("");
const error = ref("");
const route = useRoute();
const router = useRouter();

// Lấy token từ URL (ví dụ: /reset-password?token=XYZ...)
const token = route.query.token;

const handleReset = async () => {
  if (newPassword.value !== confirmPassword.value) {
    error.value = "Mật khẩu nhập lại không khớp!";
    return;
  }

  try {
    await resetPassword({ token, newPassword: newPassword.value });
    message.value = "Đổi mật khẩu thành công! Đang chuyển hướng...";
    setTimeout(() => router.push("/login"), 2000);
  } catch (err) {
    error.value = err.response?.data || "Token không hợp lệ hoặc đã hết hạn";
  }
};
</script>

<style scoped>
/* Copy style giống file trên */
.auth-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  text-align: center;
}
input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
}
button {
  width: 100%;
  padding: 10px;
  background: #3e2723;
  color: white;
  border: none;
  cursor: pointer;
}
.success {
  color: green;
}
.error {
  color: red;
}
</style>
