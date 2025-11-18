<!-- src/views/Register.vue -->
<template>
  <div class="container">
    <h2>Register</h2>

    <form @submit.prevent="submit">
      <div>
        <label>Username:</label>
        <input v-model="username" type="text" />
      </div>

      <div>
        <label>Email:</label>
        <input v-model="email" type="email" />
      </div>

      <div>
        <label>Password:</label>
        <input v-model="password" type="password" />
      </div>

      <button type="submit">Register</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { register } from "../api/auth";

const username = ref("");
const email = ref("");
const password = ref("");

const submit = async () => {
  const res = await register({
    username: username.value,
    email: email.value,
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
