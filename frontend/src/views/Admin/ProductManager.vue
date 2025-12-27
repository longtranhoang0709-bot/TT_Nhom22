<script setup>
import { ref, onMounted } from "vue";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} from "../../api/products";
import { getAllIngredients } from "../../api/inventory";

const products = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const currentId = ref(null);
const selectedFile = ref(null);
const fileInputKey = ref(0);
const searchText = ref("");

// Pagination
const currentPage = ref(1);
const totalPages = ref(1);
const limit = ref(10);
const SERVER_URL = "http://localhost:3000";

// Dữ liệu Nguyên liệu
const ingredientsList = ref([]);

// Dữ liệu form sản phẩm
const form = ref({
  ten_san_pham: "",
  gia: 0,
  mo_ta: "",
  ma_danh_muc: 1,
  trang_thai: 1,
  recipe: [],
});

const resetForm = () => {
  form.value = {
    ten_san_pham: "",
    gia: 0,
    mo_ta: "",
    ma_danh_muc: 1,
    trang_thai: 1,
    recipe: [],
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

const openEditModal = async(p) => {
  try {
    const res = await getProductById(p.ma_san_pham);
    const productDetail = res.data;
    form.value = {
      ten_san_pham: productDetail.ten_san_pham,
      gia: productDetail.gia,
      mo_ta: productDetail.mo_ta,
      ma_danh_muc: productDetail.ma_danh_muc,
      trang_thai: productDetail.trang_thai,
      recipe: productDetail.recipe ? productDetail.recipe.map(r => ({
        id: r.id,
        amount: r.amount
      })) : [], 
    };
    currentId.value = p.ma_san_pham;
    showModal.value = true;
    isEditing.value = true;
  } catch (err) {
    alert("Lỗi tải chi tiết món: " + err.message);
  }
};

const initData = async () => {
  try {
    const params = {
      page: currentPage.value,
      limit: limit.value,
      view_all: true,
    };
    if (searchText.value) params.name = searchText.value;

    const [resProd, resIng] = await Promise.all([
      getAllProducts(params),
      getAllIngredients(),
    ]);

    if (resProd.data && resProd.data.data && Array.isArray(resProd.data.data)) {
      products.value = resProd.data.data;
      const total = resProd.data.pagination.total;
      totalPages.value = Math.ceil(total / limit.value);
    } else {
      products.value = resProd.data;
    }
    ingredientsList.value = resIng.data;
  } catch (err) {
    alert("Lỗi tải dữ liệu: " + err.message);
  }
};

const onSearch = () => {
  currentPage.value = 1;
  initData();
};

const handleFile = (event) => {
  selectedFile.value = event.target.files[0];
};

// Quản lý công thức
const addIngredientToRecipe = () => {
  form.value.recipe.push({ id: "", amount: 0 });
};

const removeIngredient = (index) => {
  form.value.recipe.splice(index, 1);
};

const handleSubmit = async () => {
  try {
    const formData = new FormData();
    formData.append("ten_san_pham", form.value.ten_san_pham);
    formData.append("gia", form.value.gia);
    formData.append("mo_ta", form.value.mo_ta);
    formData.append("ma_danh_muc", form.value.ma_danh_muc);
    formData.append("trang_thai", form.value.trang_thai);

    // Gửi công thức
    if (form.value.recipe.length > 0) {
      formData.append("ingredients", JSON.stringify(form.value.recipe));
    }

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

    showModal.value = false;
    initData();
  } catch (err) {
    console.error(err);
    alert("Lỗi: " + (err.response?.data?.error || err.message));
  }
};

const handleDelete = async (id) => {
  if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
  try {
    await deleteProduct(id);
    initData();
  } catch (err) {
    alert("Xóa thất bại!");
  }
};

onMounted(initData);
</script>

<template>
  <BContainer fluid class="p-4">
    <div
      class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2"
    >
      <h1>Quản lý Sản phẩm</h1>

      <div class="d-flex gap-2">
        <BInputGroup style="width: 250px">
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
              :src="
                p.duong_dan_anh
                  ? `${SERVER_URL}${p.duong_dan_anh}`
                  : 'https://via.placeholder.com/50'
              "
              thumbnail
              fluid
              style="width: 50px; height: 50px; object-fit: cover"
            />
          </td>
          <td>{{ p.ten_san_pham }}</td>
          <td>
            <BBadge :variant="p.ma_danh_muc === 1 ? 'warning' : 'info'">
              {{ p.ma_danh_muc === 1 ? "Cà phê" : "Bánh ngọt" }}
            </BBadge>
          </td>
          <td>{{ new Intl.NumberFormat("vi-VN").format(p.gia) }} đ</td>
          <td>
            <BBadge :variant="p.trang_thai === 1 ? 'success' : 'danger'">
              {{ p.trang_thai === 1 ? "Hiện" : "Ẩn" }}
            </BBadge>
          </td>
          <td>
            <BButtonGroup size="sm">
              <BButton variant="warning" @click="openEditModal(p)">Sửa</BButton>
              <BButton variant="danger" @click="handleDelete(p.ma_san_pham)"
                >Xóa</BButton
              >
            </BButtonGroup>
          </td>
        </tr>
      </tbody>
    </BTableSimple>

    <BModal
      v-model="showModal"
      :title="isEditing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'"
      hide-footer
      size="lg"
    >
      <BForm @submit.stop.prevent="handleSubmit">
        <BRow>
          <BCol md="6">
            <BFormGroup label="Tên sản phẩm" class="mb-2">
              <BFormInput v-model="form.ten_san_pham" required />
            </BFormGroup>

            <BFormGroup label="Giá" class="mb-2">
              <BFormInput type="number" v-model="form.gia" required />
            </BFormGroup>

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
              <div v-if="isEditing" class="text-muted small mt-1">
                (Bỏ qua nếu không đổi ảnh)
              </div>
            </BFormGroup>
          </BCol>

          <BCol md="6" class="bg-light p-3 rounded">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="fw-bold m-0 text-primary">Công Thức (Định lượng)</h6>
              <BButton
                size="sm"
                variant="outline-primary"
                @click="addIngredientToRecipe"
              >
                <i class="bi bi-plus"></i> Thêm NL
              </BButton>
            </div>

            <div
              v-if="form.recipe.length === 0"
              class="text-center text-muted small py-4"
            >
              Chưa có nguyên liệu nào. Nhấn "Thêm NL" để thiết lập công thức pha
              chế.
            </div>

            <div
              v-else
              class="recipe-list"
              style="max-height: 400px; overflow-y: auto"
            >
              <div
                v-for="(item, index) in form.recipe"
                :key="index"
                class="d-flex gap-2 mb-2 align-items-center"
              >
                <div style="flex-grow: 1">
                  <BFormSelect
                    v-model="item.id"
                    class="form-select-sm"
                    required
                  >
                    <option value="" disabled>Chọn nguyên liệu</option>
                    <option
                      v-for="ing in ingredientsList"
                      :key="ing.ma_nguyen_lieu"
                      :value="ing.ma_nguyen_lieu"
                    >
                      {{ ing.ten_nguyen_lieu }} ({{ ing.don_vi_tinh }})
                    </option>
                  </BFormSelect>
                </div>
                <div style="width: 80px">
                  <BFormInput
                    v-model="item.amount"
                    type="number"
                    step="0.01"
                    placeholder="SL"
                    class="form-control-sm"
                    required
                  />
                </div>
                <BButton
                  variant="outline-danger"
                  size="sm"
                  @click="removeIngredient(index)"
                >
                  <i class="bi bi-trash"></i>
                </BButton>
              </div>
            </div>
          </BCol>
        </BRow>

        <hr />
        <div class="d-flex justify-content-end mt-3 gap-2">
          <BButton variant="secondary" @click="showModal = false">Hủy</BButton>
          <BButton type="submit" variant="primary">Lưu thay đổi</BButton>
        </div>
      </BForm>
    </BModal>
  </BContainer>
</template>
