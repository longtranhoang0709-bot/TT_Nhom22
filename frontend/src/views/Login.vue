<!-- src/views/Login.vue -->
<template>
  <div class="container">
    <h2>Login</h2>

    <form @submit.prevent="submit">
      <div>
        <label>Username:</label>
        <input v-model="username" type="text" />
      </div>

      <div>
        <label>Password:</label>
        <input v-model="password" type="password" />
      </div>

      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { login } from "../api/auth";

const username = ref("");
const password = ref("");

const submit = async () => {
  const res = await login({
    username: username.value,
    password: password.value,
  });
  alert(res.data.message);
};
</script>

<style scoped>
.container {
  width: 300px;
  margin: 50px auto;
}
input {
  width: 100%;
  margin-bottom: 10px;
  padding: 5px;
}
button {
  padding: 6px 15px;
}
</style>
