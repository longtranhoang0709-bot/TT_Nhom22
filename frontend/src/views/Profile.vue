<script setup>
import { ref, onMounted } from "vue";
import userApi from "../api/user";

const user = ref({});
const message = ref("");
const variant = ref("success");

const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
const userId = storedUser.ma_nguoi_dung;

const fetchProfile = async () => {
  if (!userId) return;
  try {
    const res = await userApi.getById(userId);
    user.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

const handleUpdate = async () => {
  try {
    await userApi.update(userId, {
      ho_ten: user.value.ho_ten,
      so_dien_thoai: user.value.so_dien_thoai,
      dia_chi: user.value.dia_chi,
    });
    message.value = "Cập nhật thành công!";
    variant.value = "success";
    localStorage.setItem("user", JSON.stringify(user.value));
  } catch (err) {
    message.value = "Lỗi: " + err.message;
    variant.value = "danger";
  }
};

onMounted(() => {
  if (!userId) alert("Bạn chưa đăng nhập!");
  else fetchProfile();
});
</script>

<template>
  <BContainer class="my-5 d-flex justify-content-center">
    <BCard title="Hồ sơ cá nhân" class="shadow w-100" style="max-width: 600px">
      <BForm @submit.prevent="handleUpdate">
        <BFormGroup label="Email (Không thể sửa)" class="mb-3">
            <BFormInput :model-value="user.email" disabled />
        </BFormGroup>

        <BFormGroup label="Họ tên" class="mb-3">
          <BFormInput v-model="user.ho_ten" required />
        </BFormGroup>

        <BFormGroup label="Số điện thoại" class="mb-3">
          <BFormInput v-model="user.so_dien_thoai" />
        </BFormGroup>

        <BFormGroup label="Địa chỉ" class="mb-4">
          <BFormInput v-model="user.dia_chi" />
        </BFormGroup>

        <BAlert :model-value="!!message" :variant="variant" dismissible @close="message=''">
            {{ message }}
        </BAlert>

        <div class="d-flex justify-content-end">
            <BButton type="submit" variant="primary">Lưu thay đổi</BButton>
        </div>
      </BForm>
    </BCard>
  </BContainer>
</template>