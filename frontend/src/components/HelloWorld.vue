<script setup>
import { ref, onMounted } from "vue";
import api from "../api/axios.js";

const users = ref([]);

onMounted(async () => {
  try {
    const res = await api.get("/users");
    users.value = res.data;
  } catch (err) {
    console.error("Error fetching users:", err);
  }
});
</script>

<template>
  <div>
    <h2>Danh sách users:</h2>
    <pre>{{ users }}</pre>
  </div>
</template>
