<script setup>
import { ref } from 'vue';
import api from '../api/axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const password = ref('');
const message = ref('');
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  try {
    message.value = '';
    const res = await api.post('/auth/login', {
      email: email.value,
      password: password.value
    });

    localStorage.setItem('accessToken', res.data.accessToken);
    const { accessToken, ...userInfo } = res.data; 
    localStorage.setItem('user', JSON.stringify(userInfo));

    if (userInfo.roles && userInfo.roles.includes("Admin")) {
        router.push('/admin/products'); // Chuyển đến trang quản lý sản phẩm nếu là Admin
    } else {
        router.push('/');
    }
  } catch (error) {
    message.value = error.response?.data || "Email hoặc mật khẩu không đúng!";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <BContainer class="d-flex justify-content-center align-items-center" style="min-height: 80vh">
    <BCard class="shadow p-3" style="max-width: 400px; width: 100%">
      <h2 class="text-center mb-4">Đăng Nhập</h2>
      
      <BForm @submit.stop.prevent="handleLogin">
        <BFormGroup label="Email:" class="mb-3">
          <BFormInput v-model="email" type="email" required placeholder="Nhập email..." />
        </BFormGroup>

        <BFormGroup label="Mật khẩu:" class="mb-4">
          <BFormInput v-model="password" type="password" required placeholder="Nhập mật khẩu..." />
        </BFormGroup>

        <BAlert :model-value="!!message" variant="danger" dismissible @close="message=''">
          {{ message }}
        </BAlert>

        <BButton type="submit" variant="primary" class="w-100" :disabled="loading">
          {{ loading ? 'Đang xử lý...' : 'Đăng Nhập' }}
        </BButton>
      </BForm>

      <div class="text-center mt-3">
        Chưa có tài khoản? <router-link to="/register">Đăng ký ngay</router-link>
      </div>
    </BCard>
  </BContainer>
</template>