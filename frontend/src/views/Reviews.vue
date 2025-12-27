<script setup>
import { ref, onMounted, computed } from 'vue';
import { getAllReviews, createReview } from '../api/review';
import { useRouter } from 'vue-router';

const reviews = ref([]);
const loading = ref(true);
const router = useRouter();

// Form đánh giá
const showForm = ref(false);
const rating = ref(5);
const content = ref("");
const isLoggedIn = computed(() => !!localStorage.getItem('accessToken'));

const fetchReviews = async () => {
    loading.value = true;
    try {
        const res = await getAllReviews();
        reviews.value = res.data;
    } catch(err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
}

const handleSubmit = async () => {
    if(!isLoggedIn.value) {
        alert("Vui lòng đăng nhập để đánh giá!");
        router.push('/login');
        return;
    }
    if(!content.value.trim()) return alert("Vui lòng nhập nội dung!");

    try {
        await createReview({ rating: rating.value, content: content.value });
        alert("Cảm ơn đánh giá của bạn!");
        content.value = "";
        rating.value = 5;
        showForm.value = false;
        fetchReviews(); 
    } catch(err) {
        alert("Lỗi: " + (err.response?.data || err.message));
    }
}

onMounted(fetchReviews);
</script>

<template>
    <div class="review-page py-5">
        <BContainer>
            <div class="text-center mb-5">
                <h1 class="fw-bold text-coffee">Đánh Giá Từ Khách Hàng</h1>
                <p class="text-muted">Ý kiến của bạn giúp chúng tôi phục vụ tốt hơn mỗi ngày</p>
                
                <BButton v-if="!showForm" variant="primary" size="lg" @click="showForm = true" class="mt-3 shadow">
                    <i class="bi bi-pencil-square"></i> Viết Đánh Giá
                </BButton>
            </div>

            <transition name="fade">
                <div v-if="showForm" class="mb-5 mx-auto p-4 bg-white rounded shadow-sm" style="max-width: 600px;">
                    <h4 class="mb-3 text-center">Chia sẻ trải nghiệm của bạn</h4>
                    <BForm @submit.prevent="handleSubmit">
                        <div class="mb-3 text-center">
                            <label class="form-label d-block fw-bold">Bạn chấm mấy sao?</label>
                            <div class="rating-stars fs-2 text-warning" style="cursor: pointer;">
                                <i v-for="n in 5" :key="n" 
                                   :class="n <= rating ? 'bi bi-star-fill' : 'bi bi-star'"
                                   @click="rating = n"></i>
                            </div>
                        </div>
                        <BFormGroup class="mb-3">
                            <BFormTextarea v-model="content" placeholder="Hãy chia sẻ cảm nhận của bạn về đồ uống, không gian..." rows="3" required />
                        </BFormGroup>
                        <div class="d-flex justify-content-end gap-2">
                            <BButton variant="secondary" @click="showForm = false">Hủy</BButton>
                            <BButton type="submit" variant="success">Gửi Đánh Giá</BButton>
                        </div>
                    </BForm>
                </div>
            </transition>

            <div v-if="loading" class="text-center">
                <BSpinner variant="primary" />
            </div>
            
            <BRow v-else>
                <BCol md="6" v-for="r in reviews" :key="r.ma_phan_hoi" class="mb-4">
                    <BCard class="h-100 border-0 shadow-sm p-2">
                        <div class="d-flex justify-content-between align-items-start">
                             <div class="d-flex align-items-center gap-3">
                                 <div class="avatar-circle">{{ r.ho_ten.charAt(0).toUpperCase() }}</div>
                                 <div>
                                     <h6 class="fw-bold mb-0">{{ r.ho_ten }}</h6>
                                     <small class="text-muted">{{ new Date(r.ngay_gui).toLocaleString('vi-VN') }}</small>
                                 </div>
                             </div>
                             <div class="text-warning">
                                 <i v-for="n in 5" :key="n" :class="n <= r.danh_gia ? 'bi bi-star-fill' : 'bi bi-star'"></i>
                             </div>
                        </div>
                        <p class="mt-3 mb-0 text-secondary">{{ r.noi_dung }}</p>
                    </BCard>
                </BCol>
            </BRow>
        </BContainer>
    </div>
</template>

<style scoped>
.review-page { background-color: #f8f9fa; min-height: 100vh; }
.text-coffee { color: #4E342E; }
.avatar-circle {
    width: 50px; height: 50px; background-color: #4E342E; color: white;
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-weight: bold; font-size: 1.2rem;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>