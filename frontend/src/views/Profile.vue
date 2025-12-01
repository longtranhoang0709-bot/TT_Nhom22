<script setup>
import { ref, onMounted } from "vue";
import userApi from "../api/user";

const user = ref({});
const message = ref("");

// Lấy thông tin user đã lưu trong localStorage lúc đăng nhập
const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
const userId = storedUser.ma_nguoi_dung; // Lấy ID

// Hàm tải thông tin
const fetchProfile = async () => {
  if (!userId) return;
  try {
    const res = await userApi.getById(userId);
    user.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

// Hàm lưu thay đổi
const handleUpdate = async () => {
  try {
    await userApi.update(userId, {
      ho_ten: user.value.ho_ten,
      so_dien_thoai: user.value.so_dien_thoai,
      dia_chi: user.value.dia_chi,
    });
    message.value = "Đã cập nhật thành công!";
    // Cập nhật lại localStorage để đồng bộ tên hiển thị
    localStorage.setItem("user", JSON.stringify(user.value));
  } catch (err) {
    alert("Lỗi: " + err.message);
  }
};

onMounted(() => {
  if (!userId) {
    alert("Bạn chưa đăng nhập!");
  } else {
    fetchProfile();
  }
});
</script>

<template>
  <div style="padding: 20px">
    <h2>Thông tin của tôi</h2>
    <form @submit.prevent="handleUpdate">
      <p>
        Email: <b>{{ user.email }}</b> (Không thể sửa)
      </p>

      <div style="margin-bottom: 10px">
        <label>Họ tên:</label><br />
        <input v-model="user.ho_ten" style="padding: 5px; width: 300px" />
      </div>

      <div style="margin-bottom: 10px">
        <label>Số điện thoại:</label><br />
        <input
          v-model="user.so_dien_thoai"
          style="padding: 5px; width: 300px"
        />
      </div>

      <div style="margin-bottom: 10px">
        <label>Địa chỉ:</label><br />
        <input v-model="user.dia_chi" style="padding: 5px; width: 300px" />
      </div>

      <button type="submit" style="padding: 8px 20px; cursor: pointer">
        Lưu thay đổi
      </button>
    </form>
    <p style="color: green">{{ message }}</p>
  </div>
</template>
