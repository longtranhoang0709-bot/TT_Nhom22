<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { resetPassword } from "../api/auth";

const route = useRoute();
const router = useRouter();

const password = ref("");
const confirmPassword = ref("");
const token = ref("");
const message = ref("");
const variant = ref("danger");
const loading = ref(false);

onMounted(() => {
  token.value = route.query.token;
  if (!token.value) {
    message.value = "Đường dẫn không hợp lệ hoặc thiếu Token!";
    variant.value = "danger";
  }
});

const handleReset = async () => {
  if (!token.value) return;
  if (password.value !== confirmPassword.value) {
    message.value = "Mật khẩu xác nhận không khớp!";
    return;
  }

  loading.value = true;
  try {
    await resetPassword({
      token: token.value,
      newPassword: password.value,
    });

    alert("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
    router.push("/login");
  } catch (err) {
    message.value = err.response?.data || "Token hết hạn hoặc không hợp lệ.";
    variant.value = "danger";
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
      title="Đặt lại mật khẩu mới"
      class="mx-auto shadow-sm w-100"
      style="max-width: 500px"
    >
      <div v-if="!token">
        <BAlert show variant="danger"
          >Đường dẫn bị lỗi. Vui lòng yêu cầu lại.</BAlert
        >
        <div class="text-center">
          <router-link to="/forgot-password">Gửi lại yêu cầu</router-link>
        </div>
      </div>

      <BForm v-else @submit.prevent="handleReset">
        <BFormGroup label="Mật khẩu mới" class="mb-3">
          <BFormInput
            type="password"
            v-model="password"
            required
            placeholder="Nhập mật khẩu mới"
          />
        </BFormGroup>

        <BFormGroup label="Xác nhận mật khẩu" class="mb-3">
          <BFormInput
            type="password"
            v-model="confirmPassword"
            required
            placeholder="Nhập lại mật khẩu"
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
          class="w-100"
          :disabled="loading"
        >
          <span v-if="loading"><BSpinner small /> Đang xử lý...</span>
          <span v-else>Xác nhận</span>
        </BButton>
      </BForm>
    </BCard>
  </BContainer>
</template>
