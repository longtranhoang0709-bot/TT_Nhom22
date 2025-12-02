<template>
  <div style="padding: 20px">
    <h2>Đăng Ký Tài Khoản</h2>
    <form @submit.prevent="handleRegister">
      <div>
        <label>Họ tên (*):</label> <br />
        <input
          v-model="form.ho_ten"
          type="text"
          required
          placeholder="Nhập họ tên"
        />
      </div>

      <div style="margin-top: 10px">
        <label>Email (*):</label> <br />
        <input
          v-model="form.email"
          type="email"
          required
          placeholder="Nhập email"
        />
      </div>

      <div style="margin-top: 10px">
        <label>Mật khẩu (*):</label> <br />
        <input
          v-model="form.password"
          type="password"
          required
          placeholder="Nhập mật khẩu"
        />
      </div>

      <div style="margin-top: 10px">
        <label>Số điện thoại:</label> <br />
        <input
          v-model="form.so_dien_thoai"
          type="text"
          placeholder="Nhập SĐT"
        />
      </div>

      <div style="margin-top: 10px">
        <label>Địa chỉ:</label> <br />
        <input v-model="form.dia_chi" type="text" placeholder="Nhập địa chỉ" />
      </div>

      <button type="submit" style="margin-top: 20px">Đăng Ký</button>
    </form>

    <p v-if="message" style="color: red; margin-top: 10px">{{ message }}</p>

    <p>
      Đã có tài khoản? <router-link to="/login">Đăng nhập ngay</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import api from "../api/axios";
import { useRouter } from "vue-router";

const router = useRouter();
const message = ref("");


const form = ref({
  ho_ten: "",
  email: "",
  password: "",
  so_dien_thoai: "",
  dia_chi: "",
});

// Hàm xử lý đăng ký
const handleRegister = async () => {
  try {
    message.value = ""; // Reset thông báo
    // Gọi API Register
    await api.post("/auth/register", form.value);

    alert("Đăng ký thành công! Bấm OK để chuyển sang trang đăng nhập.");
    router.push("/login");
  } catch (error) {
    console.error(error);
    // Hiển thị lỗi từ backend trả về 
    message.value = error.response?.data || "Đăng ký thất bại!";
  }
};
</script>
