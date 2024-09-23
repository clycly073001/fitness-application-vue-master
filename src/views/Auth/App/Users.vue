<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import swal from 'sweetalert';
import { useRouter } from 'vue-router';

const users = ref([]);
const currentPage = ref(1);
const pageSize = 5;
const totalUsers = ref(0);
const totalPages = ref(0);
const loading = ref(true); // Add loading state
const router = useRouter();

const fetchUsers = async (page) => {
  loading.value = true; // Set loading to true when fetching data
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let { data, error, count } = await supabase
    .from('users')
    .select('*', { count: 'exact' })
    .range(start, end);

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while fetching users. Please try again.", "error");
  } else {
    users.value = data;
    totalUsers.value = count;
    totalPages.value = Math.ceil(count / pageSize);
  }
  loading.value = false; // Set loading to false after fetching data
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1;
    fetchUsers(currentPage.value);
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value -= 1;
    fetchUsers(currentPage.value);
  }
};

const toPascalCase = (str) => {
  return str.replace(/\w+/g, 
    (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
};

const viewUserProfile = (userId) => {
  router.push(`/application/users/${userId}`);
};

const goToCreateUser = () => {
  router.push('/application/users/create');
};

onMounted(() => {
  fetchUsers(currentPage.value);
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-4 sm:p-6">
    <div class="flex flex-col sm:flex-row justify-between items-center mb-4">
      <h1 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-0">Members</h1>
      <button @click="goToCreateUser" class="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-700">
        Add Member
      </button>
    </div>
    <div v-if="loading" class="flex justify-center items-center h-full">
      <div class="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
    </div>
    <div v-else>
      <div v-if="users.length">
        <ul>
          <li v-for="user in users" :key="user.id" class="mb-2 p-4 bg-white shadow rounded cursor-pointer hover:bg-gray-800 hover:text-white" @click="viewUserProfile(user.id)">
            <p><strong>Name:</strong> {{ user.name }}</p>
            <p><strong>Email:</strong> {{ user.email }}</p>
            <p><strong>Role:</strong> {{ toPascalCase(user.role) }}</p>
          </li>
        </ul>
        <div class="flex flex-col sm:flex-row justify-between items-center mt-4">
          <button @click="prevPage" :disabled="currentPage === 1" class="bg-gray-800 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-gray-700 mb-2 sm:mb-0">
            Previous
          </button>
          <span class="mb-2 sm:mb-0">Page {{ currentPage }} of {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages" class="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700">
            Next
          </button>
        </div>
      </div>
      <div v-else>
        <p class="text-center">No users found.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

body {
  font-family: 'Roboto', sans-serif;
}

.loader {
  border-top-color: #3498db;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>