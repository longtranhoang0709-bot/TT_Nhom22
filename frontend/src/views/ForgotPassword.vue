<script setup>
import { ref } from "vue";
import { forgotPassword } from "../api/auth";

const email = ref("");
const loading = ref(false);
const message = ref("");
const variant = ref("success");

const handleSubmit = async () => {
  loading.value = true;
  message.value = "";

  try {
    await forgotPassword(email.value);

    variant.value = "success";
    message.value =
      "Link đặt lại mật khẩu đã được gửi vào email của bạn. Vui lòng kiểm tra hộp thư (kể cả mục Spam).";
  } catch (err) {
    variant.value = "danger";
    message.value = err.response?.data || "Có lỗi xảy ra, vui lòng thử lại.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <BContainer
    class="py-5"
    style="min-height: 80vh; display: flex; align-items: center"
  >
    <BCard
      title="Quên mật khẩu"
      class="mx-auto shadow-sm w-100"
      style="max-width: 450px"
    >
      <BCardText class="text-muted mb-4">
        Nhập email đã đăng ký của bạn, chúng tôi sẽ gửi hướng dẫn đặt lại mật
        khẩu.
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

        <BAlert
          :model-value="!!message"
          :variant="variant"
          dismissible
          @close="message = ''"
        >
          {{ message }}
        </BAlert>

        <BButton
          type="submit"
          variant="primary"
          class="w-100 mb-3"
          :disabled="loading"
        >
          <span v-if="loading"><BSpinner small /> Đang gửi...</span>
          <span v-else>Gửi yêu cầu</span>
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
