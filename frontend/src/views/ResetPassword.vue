<script setup>
import { ref } from 'vue';

const password = ref("");
const confirmPassword = ref("");

const handleReset = () => {
  alert("Chức năng đang phát triển!");
};
</script>

<template>
  <BContainer class="py-5">
    <BCard title="Đặt lại mật khẩu" class="mx-auto shadow-sm" style="max-width: 500px">
      <BForm @submit.prevent="handleReset">
        <BFormGroup label="Mật khẩu mới" class="mb-3">
          <BFormInput type="password" v-model="password" required />
        </BFormGroup>

        <BFormGroup label="Xác nhận mật khẩu" class="mb-3">
          <BFormInput type="password" v-model="confirmPassword" required />
        </BFormGroup>
        
        <BButton type="submit" variant="primary" class="w-100">Xác nhận</BButton>
      </BForm>
    </BCard>
  </BContainer>
</template>