<!-- src/views/Dashboard.vue -->
<script setup>
import { ref, onMounted } from 'vue';

const user = ref(null);

onMounted(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    user.value = JSON.parse(storedUser);
  }
});
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-4">Dashboard</h1>
    <p>Welcome to the Dashboard!</p>
    <div v-if="user">
      <p><strong>Name:</strong> {{ user.name }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>Role:</strong> {{ user.role }}</p>
    </div>
  </div>
</template>

<style scoped>
</style>