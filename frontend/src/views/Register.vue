<script setup>
import { ref } from "vue";
import api from "../api/axios";
import { useRouter } from "vue-router";

const router = useRouter();
const message = ref("");
const loading = ref(false);

const form = ref({
  ho_ten: "",
  email: "",
  password: "",
  so_dien_thoai: "",
  dia_chi: "",
});

const handleRegister = async () => {
  loading.value = true;
  try {
    message.value = "";
    await api.post("/auth/register", form.value);
    alert("Đăng ký thành công!");
    router.push("/login");
  } catch (error) {
    message.value = error.response?.data || "Đăng ký thất bại!";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <BContainer class="d-flex justify-content-center align-items-center my-5">
    <BCard class="shadow p-3" style="max-width: 500px; width: 100%">
      <h2 class="text-center mb-4">Đăng Ký Tài Khoản</h2>

      <BForm @submit.stop.prevent="handleRegister">
        <BFormGroup label="Họ tên (*)" class="mb-2">
          <BFormInput
            v-model="form.ho_ten"
            required
            placeholder="Nguyễn Văn A"
          />
        </BFormGroup>

        <BFormGroup label="Email (*)" class="mb-2">
          <BFormInput
            v-model="form.email"
            type="email"
            required
            placeholder="email@example.com"
          />
        </BFormGroup>

        <BFormGroup label="Mật khẩu (*)" class="mb-2">
          <BFormInput v-model="form.password" type="password" required />
        </BFormGroup>

        <BRow>
          <BCol>
            <BFormGroup label="Số điện thoại" class="mb-2">
              <BFormInput v-model="form.so_dien_thoai" />
            </BFormGroup>
          </BCol>
        </BRow>

        <BFormGroup label="Địa chỉ" class="mb-3">
          <BFormInput
            v-model="form.dia_chi"
            placeholder="Số nhà, Tên đường..."
          />
        </BFormGroup>

        <BAlert :model-value="!!message" variant="danger">
          {{ message }}
        </BAlert>

        <BButton
          type="submit"
          variant="success"
          class="w-100"
          :disabled="loading"
        >
          {{ loading ? "Đang đăng ký..." : "Đăng Ký" }}
        </BButton>
      </BForm>

      <div class="text-center mt-3">
        Đã có tài khoản? <router-link to="/login">Đăng nhập</router-link>
      </div>
    </BCard>
  </BContainer>
</template>
