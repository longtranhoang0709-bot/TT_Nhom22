<script setup>
import { ref, onMounted } from "vue";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/products";

// === BIẾN ===
const products = ref([]);
const showForm = ref(false);
const isEditing = ref(false);
const currentId = ref(null);
const fileInput = ref(null);
const debugData = ref(null);

const SERVER_URL = "http://localhost:3000";
const DEFAULT_IMG = "https://via.placeholder.com/100?text=No+Img";

// Dữ liệu form 
const form = ref({
  ten_san_pham: "",
  gia: 0,
  mo_ta: "",
  so_luong: 0,
  ma_danh_muc: 1,
  trang_thai: 1, // Mặc định là 1 (Hiện)
});
const selectedFile = ref(null);

// Danh sách danh mục (Có thể gọi API lấy về, tạm thời fix cứng)
const categories = [
  { id: 1, name: "Cà phê" },
  { id: 2, name: "Bánh ngọt" },
];

// === HÀM ===
// Tải danh sách sản phẩm
const fetchProducts = async () => {
  try {
    // THÊM THAM SỐ view_all: true VÀO ĐÂY
    const res = await getAllProducts({ view_all: true });

    if (res.data && res.data.data && Array.isArray(res.data.data)) {
      products.value = res.data.data;
    } else {
      products.value = res.data;
    }
  } catch (err) {
    alert("Lỗi tải danh sách: " + err.message);
  }
};

// Lấy đường dẫn ảnh
const getImageUrl = (path) => {
  if (!path) return DEFAULT_IMG;
  if (path.startsWith("/")) return `${SERVER_URL}${path}`;
  return path;
};

//  Đặt lại form
const resetForm = () => {
  form.value = {
    ten_san_pham: "",
    gia: 0,
    mo_ta: "",
    so_luong: 0,
    ma_danh_muc: 1,
    trang_thai: 1,
  };
  selectedFile.value = null;
  showForm.value = false;
  isEditing.value = false;
  currentId.value = null;
  if (fileInput.value) fileInput.value.value = "";
};

// Mở form thêm mới
const openAddForm = () => {
  resetForm();
  showForm.value = true;
};

// Mở form sửa
const openEditForm = (p) => {
  form.value = {
    ten_san_pham: p.ten_san_pham,
    gia: p.gia,
    mo_ta: p.mo_ta,
    so_luong: p.so_luong || 0,
    ma_danh_muc: p.ma_danh_muc,
    trang_thai: p.trang_thai, // Lấy trạng thái từ DB
  };
  currentId.value = p.ma_san_pham;
  showForm.value = true;
  isEditing.value = true;
};

//  Xử lý chọn file
const handleFile = (event) => {
  selectedFile.value = event.target.files[0];
};

// Xử lý submit form
const handleSubmit = async () => {
  try {
    const formData = new FormData();
    formData.append("ten_san_pham", form.value.ten_san_pham);
    formData.append("gia", form.value.gia);
    formData.append("mo_ta", form.value.mo_ta);
    formData.append("so_luong", form.value.so_luong);
    formData.append("ma_danh_muc", form.value.ma_danh_muc);
    formData.append("trang_thai", form.value.trang_thai); // Gửi trạng thái lên

    if (selectedFile.value) {
      formData.append("images", selectedFile.value);
    }

    if (isEditing.value) {
      await updateProduct(currentId.value, formData);
      alert("Cập nhật thành công!");
    } else {
      await createProduct(formData);
      alert("Thêm mới thành công!");
    }
    resetForm();
    fetchProducts();
  } catch (err) {
    console.error(err);
    alert("Lỗi: " + (err.response?.data?.error || err.message));
  }
};

// Xóa sản phẩm
const handleDelete = async (id) => {
  if (!confirm("CẢNH BÁO: Bạn có chắc muốn xóa VĨNH VIỄN sản phẩm này?"))
    return;

  try {
    await deleteProduct(id);
    alert("Xóa thành công!");
    fetchProducts(); // Tải lại danh sách
  } catch (err) {
    // Hiển thị thông báo lỗi cụ thể từ Backend
    const msg = err.response?.data?.error || "Xóa thất bại!";
    alert(msg);
  }
};

// Hàm lấy tên danh mục hiển thị
const getCategoryName = (id) => {
  const cat = categories.find((c) => c.id === id);
  return cat ? cat.name : id;
};

onMounted(fetchProducts);
</script>

<template>
  <div class="admin-container">
    <h1>Quản lý Sản phẩm</h1>
    <button v-if="!showForm" @click="openAddForm" class="btn-create">
      + Thêm Sản Phẩm
    </button>

    <div v-if="showForm" class="form-box">
      <h3>{{ isEditing ? "Sửa Sản Phẩm" : "Thêm Sản Phẩm" }}</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-row">
          <label>Tên SP:</label>
          <input v-model="form.ten_san_pham" required />
        </div>
        <div class="form-row">
          <label>Giá:</label>
          <input v-model="form.gia" type="number" required />
        </div>
        <div class="form-row">
          <label>Danh mục:</label>
          <select v-model="form.ma_danh_muc" style="padding: 5px; width: 314px">
            <option :value="1">Cà phê</option>
            <option :value="2">Bánh ngọt</option>
          </select>
        </div>
        <div class="form-row">
          <label>Trạng thái:</label>
          <select v-model="form.trang_thai" style="padding: 5px; width: 314px">
            <option :value="1">Đang bán (Hiện)</option>
            <option :value="0">Ngừng bán (Ẩn)</option>
          </select>
        </div>
        <div class="form-row">
          <label>Kho:</label>
          <input v-model="form.so_luong" type="number" />
        </div>
        <div class="form-row">
          <label>Mô tả:</label>
          <textarea v-model="form.mo_ta"></textarea>
        </div>

        <div class="form-row">
          <label>Ảnh:</label>
          <input type="file" @change="handleFile" ref="fileInput" />
          <p
            v-if="isEditing"
            style="font-size: 0.8em; color: gray; margin-left: 85px"
          >
            (Bỏ trống nếu muốn giữ ảnh cũ)
          </p>
        </div>

        <div style="margin-top: 10px">
          <button type="submit" class="btn-save">Lưu</button>
          <button type="button" @click="resetForm" class="btn-cancel">
            Hủy
          </button>
        </div>
      </form>
    </div>

    <table
      border="1"
      cellpadding="10"
      cellspacing="0"
      style="width: 100%; border-collapse: collapse"
    >
      <thead>
        <tr style="background: #eee">
          <th>ID</th>
          <th>Ảnh</th>
          <th>Tên</th>
          <th>Danh mục</th>
          <th>Giá</th>
          <th>Trạng thái</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in products" :key="p.ma_san_pham">
          <td>{{ p.ma_san_pham }}</td>
          <td>
            <img
              :src="getImageUrl(p.duong_dan_anh)"
              width="50"
              height="50"
              style="object-fit: cover; border: 1px solid #ddd"
            />
          </td>
          <td>{{ p.ten_san_pham }}</td>
          <td>{{ getCategoryName(p.ma_danh_muc) }}</td>
          <td>{{ new Intl.NumberFormat("vi-VN").format(p.gia) }} đ</td>
          <td>
            <span
              v-if="p.trang_thai === 1"
              style="color: green; font-weight: bold"
              >Hiện</span
            >
            <span v-else style="color: red; font-weight: bold">Ẩn</span>
          </td>
          <td>
            <button @click="openEditForm(p)" class="btn-edit">Sửa</button>
            <button @click="handleDelete(p.ma_san_pham)" class="btn-delete">
              Xóa
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* Giữ nguyên CSS cũ */
.admin-container {
  padding: 20px;
}
.form-box {
  background: #f8f9fa;
  padding: 20px;
  border: 1px solid #ddd;
  margin-bottom: 20px;
}
.form-row {
  margin-bottom: 10px;
}
.form-row label {
  display: inline-block;
  width: 80px;
  font-weight: bold;
}
.form-row input,
.form-row textarea {
  padding: 5px;
  width: 300px;
}
button {
  cursor: pointer;
  padding: 5px 10px;
  border: none;
  border-radius: 3px;
  margin-right: 5px;
  color: white;
}
.btn-create {
  background: green;
  padding: 10px 15px;
  margin-bottom: 15px;
}
.btn-save {
  background: blue;
}
.btn-cancel {
  background: gray;
}
.btn-edit {
  background: orange;
  color: black;
}
.btn-delete {
  background: red;
}
</style>
