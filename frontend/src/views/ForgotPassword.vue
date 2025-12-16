<script setup>
import { ref } from 'vue';

const email = ref("");

const handleSubmit = () => {
  
  alert("Yêu cầu đã được gửi tới: " + email.value);
};
</script>

<template>
  <BContainer class="py-5">
    <BCard title="Quên mật khẩu" class="mx-auto shadow-sm" style="max-width: 450px">
      <BCardText class="text-muted mb-4">
        Nhập email đã đăng ký của bạn, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
      </BCardText>
      
      <BForm @submit.prevent="handleSubmit">
        <BFormGroup label="Email" class="mb-3">
          <BFormInput 
            v-model="email" 
            type="email" 
            required 
            placeholder="nhap_email_cua_ban@example.com" 
          />
        </BFormGroup>
        
        <BButton type="submit" variant="primary" class="w-100 mb-3">
          Gửi yêu cầu
        </BButton>
        
        <div class="text-center">
          <router-link to="/login" class="text-decoration-none">
            <small>← Quay lại Đăng nhập</small>
          </router-link>
        </div>
      </BForm>
    </BCard>
  </BContainer>
</template>