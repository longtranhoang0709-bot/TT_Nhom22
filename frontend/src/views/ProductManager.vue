<script setup>
import { ref, onMounted } from "vue";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/products";

const products = ref([]);
const showModal = ref(false); 
const isEditing = ref(false);
const currentId = ref(null);
const selectedFile = ref(null);
const fileInputKey = ref(0); 
const searchText = ref("");

const currentPage = ref(1);
const totalPages = ref(1);
const limit = ref(10);
const SERVER_URL = "http://localhost:3000";

// Dữ liệu form 
const form = ref({
  ten_san_pham: "",
  gia: 0,
  mo_ta: "",
  so_luong: 0,
  ma_danh_muc: 1,
  trang_thai: 1, 
});

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
  showModal.value = false; 
  isEditing.value = false;
  currentId.value = null;
  fileInputKey.value++; 
};

const openAddModal = () => {
  resetForm();
  showModal.value = true; 
};

const openEditModal = (p) => {
  form.value = {
    ten_san_pham: p.ten_san_pham,
    gia: p.gia,
    mo_ta: p.mo_ta,
    so_luong: p.so_luong || 0,
    ma_danh_muc: p.ma_danh_muc,
    trang_thai: p.trang_thai,
  };
  currentId.value = p.ma_san_pham;
  showModal.value = true; 
  isEditing.value = true;
};

// Tải danh sách sản phẩm
const fetchProducts = async () => {
  try {
    const params = {
      page: currentPage.value,
      limit: limit.value,
      view_all: true
    };
    if (searchText.value) params.name = searchText.value;
    const res = await getAllProducts(params);

    if (res.data && res.data.data && Array.isArray(res.data.data)) {
      products.value = res.data.data;
      const total = res.data.pagination.total;
      totalPages.value = Math.ceil(total / limit.value);
    } else {
      products.value = res.data;
    }
  } catch (err) {
    alert("Lỗi tải danh sách: " + err.message);
  }
};
// Xử lý tìm kiếm
const onSearch = () => {
  currentPage.value = 1;
  fetchProducts();
};

// Xử lý chọn file
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
    formData.append("trang_thai", form.value.trang_thai);

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
    
    showModal.value = false; // Đóng modal trước
    fetchProducts(); // Load lại dữ liệu
  } catch (err) {
    console.error(err);
    alert("Lỗi: " + (err.response?.data?.error || err.message));
  }
};

const handleDelete = async (id) => {
  if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
  try {
    await deleteProduct(id);
    fetchProducts();
  } catch (err) {
    alert("Xóa thất bại!");
  }
};

onMounted(fetchProducts);
</script>

<template>
  <BContainer fluid class="p-4">
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <h1>Quản lý Sản phẩm</h1>
      
      <div class="d-flex gap-2">
        <BInputGroup style="width: 250px;">
          <BFormInput 
            v-model="searchText" 
            placeholder="Tìm theo tên..." 
            @keyup.enter="onSearch"
          />
          <BButton variant="outline-secondary" @click="onSearch">Tìm</BButton>
        </BInputGroup>

        <BButton variant="success" @click="openAddModal">+ Thêm Mới</BButton>
      </div>
    </div>

    <BTableSimple hover responsive bordered striped caption-top>
      <thead class="table-dark">
        <tr>
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
            <BImg 
              :src="p.duong_dan_anh ? `${SERVER_URL}${p.duong_dan_anh}` : 'https://via.placeholder.com/50'" 
              thumbnail 
              fluid 
              style="width: 50px; height: 50px; object-fit: cover"
            />
          </td>
          <td>{{ p.ten_san_pham }}</td>
          <td>
             <BBadge :variant="p.ma_danh_muc === 1 ? 'warning' : 'info'">
               {{ p.ma_danh_muc === 1 ? 'Cà phê' : 'Bánh ngọt' }}
             </BBadge>
          </td>
          <td>{{ new Intl.NumberFormat("vi-VN").format(p.gia) }} đ</td>
          <td>
            <BBadge :variant="p.trang_thai === 1 ? 'success' : 'danger'">
              {{ p.trang_thai === 1 ? 'Hiện' : 'Ẩn' }}
            </BBadge>
          </td>
          <td>
            <BButtonGroup size="sm">
              <BButton variant="warning" @click="openEditModal(p)">Sửa</BButton>
              <BButton variant="danger" @click="handleDelete(p.ma_san_pham)">Xóa</BButton>
            </BButtonGroup>
          </td>
        </tr>
      </tbody>
    </BTableSimple>

    <BModal 
      v-model="showModal" 
      :title="isEditing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'"
      hide-footer
    >
      <BForm @submit.stop.prevent="handleSubmit">
        <BFormGroup label="Tên sản phẩm" class="mb-2">
          <BFormInput v-model="form.ten_san_pham" required />
        </BFormGroup>

        <BRow>
          <BCol>
            <BFormGroup label="Giá" class="mb-2">
              <BFormInput type="number" v-model="form.gia" required />
            </BFormGroup>
          </BCol>
          <BCol>
             <BFormGroup label="Kho" class="mb-2">
              <BFormInput type="number" v-model="form.so_luong" />
            </BFormGroup>
          </BCol>
        </BRow>

        <BRow>
          <BCol>
            <BFormGroup label="Danh mục" class="mb-2">
              <BFormSelect v-model="form.ma_danh_muc">
                <option :value="1">Cà phê</option>
                <option :value="2">Bánh ngọt</option>
              </BFormSelect>
            </BFormGroup>
          </BCol>
          <BCol>
            <BFormGroup label="Trạng thái" class="mb-2">
              <BFormSelect v-model="form.trang_thai">
                <option :value="1">Đang bán</option>
                <option :value="0">Ngừng bán</option>
              </BFormSelect>
            </BFormGroup>
          </BCol>
        </BRow>

        <BFormGroup label="Mô tả" class="mb-2">
          <BFormTextarea v-model="form.mo_ta" rows="3" />
        </BFormGroup>

        <BFormGroup label="Ảnh sản phẩm">
          <BFormFile :key="fileInputKey" @change="handleFile" />
          <div v-if="isEditing" class="text-muted small mt-1">(Bỏ qua nếu không đổi ảnh)</div>
        </BFormGroup>

        <div class="d-flex justify-content-end mt-3 gap-2">
           <BButton variant="secondary" @click="showModal = false">Hủy</BButton>
           <BButton type="submit" variant="primary">Lưu thay đổi</BButton>
        </div>
      </BForm>
    </BModal>

  </BContainer>
</template>