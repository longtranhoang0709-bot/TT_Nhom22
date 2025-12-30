<script setup>
import { ref, onMounted } from 'vue';
import { getAllContacts, deleteContact } from '../../api/contact';

const contacts = ref([]);
const loading = ref(false);

const fetchContacts = async () => {
    loading.value = true;
    try {
        const res = await getAllContacts();
        contacts.value = res.data;
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
};

const handleDelete = async (id) => {
    if(!confirm("Xóa tin nhắn này?")) return;
    try {
        await deleteContact(id);
        fetchContacts();
    } catch (err) {
        alert("Lỗi xóa");
    }
};

onMounted(fetchContacts);
</script>

<template>
    <div class="p-4">
        <h2 class="mb-4">Quản Lý Tin Nhắn Liên Hệ</h2>
        
        <BCard class="shadow-sm">
            <BTableSimple responsive hover striped>
                <thead class="table-dark">
                    <tr>
                        <th>Tên</th>
                        <th>Email</th>
                        <th style="width: 40%">Nội dung</th>
                        <th>Ngày gửi</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="c in contacts" :key="c.ma_lien_he">
                        <td class="fw-bold">{{ c.ten_nguoi_gui }}</td>
                        <td><a :href="`mailto:${c.email}`">{{ c.email }}</a></td>
                        <td>{{ c.noi_dung }}</td>
                        <td>{{ new Date(c.ngay_gui).toLocaleString('vi-VN') }}</td>
                        <td>
                            <BButton size="sm" variant="danger" @click="handleDelete(c.ma_lien_he)">
                                <i class="bi bi-trash"></i>
                            </BButton>
                        </td>
                    </tr>
                    <tr v-if="contacts.length === 0">
                        <td colspan="5" class="text-center py-4">Chưa có tin nhắn nào.</td>
                    </tr>
                </tbody>
            </BTableSimple>
        </BCard>
    </div>
</template>