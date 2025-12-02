<template>
  <div style="padding: 20px;">
    <h2>Đăng Nhập</h2>
    <form @submit.prevent="handleLogin">
      <div>
        <label>Email:</label> <br/>
        <input v-model="email" type="email" required placeholder="Nhập email" />
      </div>

      <div style="margin-top: 10px;">
        <label>Mật khẩu:</label> <br/>
        <input v-model="password" type="password" required placeholder="Nhập mật khẩu" />
      </div>

      <button type="submit" style="margin-top: 20px;">Đăng Nhập</button>
    </form>

    <p v-if="message" style="color: red; margin-top: 10px;">{{ message }}</p>

    <p>Chưa có tài khoản? <router-link to="/register">Đăng ký tại đây</router-link></p>
  </div>
</template>

<script setup>

import { ref } from 'vue';
import api from '../api/axios';
import { useRouter } from 'vue-router';

// Xử lý đăng nhập
const router = useRouter();
const email = ref('');
const password = ref('');
const message = ref('');

// Hàm xử lý đăng nhập
const handleLogin = async () => {
  try {
    message.value = '';
    
    // Gọi API Login
    const res = await api.post('/auth/login', {
      email: email.value,
      password: password.value
    });

    // 1. Lưu Access Token vào LocalStorage
    localStorage.setItem('accessToken', res.data.accessToken);

    // 2. Lưu thông tin user 
    const { accessToken, ...userInfo } = res.data; 
    localStorage.setItem('user', JSON.stringify(userInfo));

    alert('Đăng nhập thành công!');
    router.push('/profile');
    
    // 3. Chuyển hướng về trang chủ
    router.push('/'); 

  } catch (error) {
    console.error(error);
    message.value = error.response?.data || "Email hoặc mật khẩu không đúng!";
  }
};
</script>