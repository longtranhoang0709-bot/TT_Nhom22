<script setup>
import { ref, onMounted } from "vue";
import userApi from "../api/user";

const listUsers = ref([]);
const error = ref("");

// Tải danh sách user
const fetchUsers = async () => {
  try {
    const res = await userApi.getAll();
    listUsers.value = res.data;
  } catch (err) {
    // Nếu server báo lỗi 403 tức là không phải Admin
    if (err.response && err.response.status === 403) {
      error.value = "Bạn không có quyền Admin để xem trang này!";
    } else {
      error.value = "Lỗi tải dữ liệu!";
    }
  }
};

// Xóa user
const handleDelete = async (id) => {
  if (!confirm("Bạn muốn xóa người này?")) return;
  try {
    await userApi.delete(id);
    fetchUsers(); // Tải lại danh sách sau khi xóa
  } catch (err) {
    alert("Xóa thất bại!");
  }
};

// Tải danh sách khi vào trang
onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div style="padding: 20px">
    <h2>Danh sách Người dùng (Admin)</h2>

    <h3 v-if="error" style="color: red">{{ error }}</h3>

    <table
      v-if="listUsers.length > 0"
      border="1"
      cellpadding="10"
      cellspacing="0"
    >
      <thead>
        <tr style="background: #eee">
          <th>ID</th>
          <th>Họ tên</th>
          <th>Email</th>
          <th>SĐT</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in listUsers" :key="u.ma_nguoi_dung">
          <td>{{ u.ma_nguoi_dung.substring(0, 5) }}...</td>
          <td>{{ u.ho_ten }}</td>
          <td>{{ u.email }}</td>
          <td>{{ u.so_dien_thoai }}</td>
          <td>
            <button
              @click="handleDelete(u.ma_nguoi_dung)"
              style="background: red; color: white"
            >
              Xóa
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
