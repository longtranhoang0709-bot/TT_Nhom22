<script setup>
import { ref, onMounted } from 'vue';
import { getBanners, createBanner, deleteBanner } from '../../api/content';

const banners = ref([]);
const selectedFile = ref(null);
const caption = ref("");
const loading = ref(false);
const API_URL = "http://localhost:3000";

const fetchBanners = async () => {
    const res = await getBanners();
    banners.value = res.data;
};

const handleFile = (e) => selectedFile.value = e.target.files[0];

const handleUpload = async () => {
    if (!selectedFile.value) return alert("Chưa chọn ảnh!");
    
    const formData = new FormData();
    // Chú ý: Backend dùng upload.single("image") nên key phải là "image"
    formData.append("image", selectedFile.value); 
    formData.append("tien_ket", caption.value);

    try {
        await createBanner(formData);
        alert("Thêm banner thành công!");
        caption.value = "";
        selectedFile.value = null;
        fetchBanners();
    } catch (err) {
        alert("Lỗi upload");
    }
};

const handleDelete = async (id) => {
    if(confirm("Xóa banner này?")) {
        await deleteBanner(id);
        fetchBanners();
    }
}

onMounted(fetchBanners);
</script>

<template>
  <div class="p-4">
    <h2 class="mb-4">Quản Lý Banner</h2>
    
    <BCard class="mb-4 shadow-sm">
        <div class="d-flex gap-3 align-items-end">
            <div class="flex-grow-1">
                <label>Chọn ảnh Banner</label>
                <BFormFile @change="handleFile" accept="image/*" />
            </div>
            <div class="flex-grow-1">
                <label>Tiêu đề (Tùy chọn)</label>
                <BFormInput v-model="caption" placeholder="Ví dụ: Khuyến mãi mùa hè" />
            </div>
            <BButton variant="success" @click="handleUpload">Upload</BButton>
        </div>
    </BCard>

    <BRow>
        <BCol md="4" v-for="b in banners" :key="b.ma_banner" class="mb-3">
            <BCard no-body class="shadow-sm">
                <BImg :src="`${API_URL}${b.anh_url}`" fluid class="card-img-top" style="height: 150px; object-fit: cover"/>
                <BCardBody class="d-flex justify-content-between align-items-center">
                    <span class="fw-bold">{{ b.tien_ket || 'Không tiêu đề' }}</span>
                    <BButton size="sm" variant="danger" @click="handleDelete(b.ma_banner)">
                        <i class="bi bi-trash"></i>
                    </BButton>
                </BCardBody>
            </BCard>
        </BCol>
    </BRow>
  </div>
</template>