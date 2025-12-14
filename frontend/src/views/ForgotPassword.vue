<template>
  <div class="auth-container">
    <h2>Quên Mật Khẩu</h2>
    <p>Nhập email để nhận link đặt lại mật khẩu.</p>
    <form @submit.prevent="handleSubmit">
      <input
        v-model="email"
        type="email"
        placeholder="Nhập email của bạn"
        required
      />
      <button type="submit" :disabled="loading">
        {{ loading ? "Đang gửi..." : "Gửi Yêu Cầu" }}
      </button>
    </form>
    <p v-if="message" class="success">{{ message }}</p>
    <p v-if="error" class="error">{{ error }}</p>
    <router-link to="/login">Quay lại Đăng nhập</router-link>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { forgotPassword } from "../api/auth";

const email = ref("");
const message = ref("");
const error = ref("");
const loading = ref(false);

const handleSubmit = async () => {
  loading.value = true;
  message.value = "";
  error.value = "";
  try {
    await forgotPassword(email.value);
    message.value = "Vui lòng kiểm tra email của bạn!";
  } catch (err) {
    error.value = err.response?.data || "Có lỗi xảy ra";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 50px auto;
  text-align: center;
  padding: 20px;
  border: 1px solid #ddd;
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
button:disabled {
  background: #ccc;
}
.success {
  color: green;
}
.error {
  color: red;
}
</style>
