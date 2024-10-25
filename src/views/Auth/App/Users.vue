<script setup>
import { ref, onMounted, watch } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import swal from 'sweetalert';
import { useRouter } from 'vue-router';

const users = ref([]);
const currentPage = ref(1);
const pageSize = 9;
const totalUsers = ref(0);
const totalPages = ref(0);
const loading = ref(true); // Add loading state
const searchQuery = ref(''); // Add search query
const router = useRouter();

const fetchUsers = async (page, query = '') => {
  loading.value = true; // Set loading to true when fetching data
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let { data, error, count } = await supabase
    .from('users')
    .select('*', { count: 'exact' })
    .eq('role', 'user') // Filter users with role 'user'
    .ilike('name', `%${query}%`) // Add search query filter
    .range(start, end);

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while fetching users. Please try again.", "error");
  } else {
    // Check and update membership status
    const now = new Date();
    for (let user of data) {
      const endOfMembership = new Date(user.end_of_membership);
      if (endOfMembership <= now && user.membership_status) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ membership_status: false })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error:', updateError);
          swal("Error", "An error occurred while updating the membership status. Please try again.", "error");
        } else {
          user.membership_status = false;
        }
      }
    }

    users.value = data;
    totalUsers.value = count;
    totalPages.value = Math.ceil(count / pageSize);
  }
  loading.value = false; // Set loading to false after fetching data
};

const renewMembership = async (userId) => {
  const now = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(now.getMonth() + 1);

  const { error } = await supabase
    .from('users')
    .update({
      start_of_membership: now.toISOString(),
      end_of_membership: nextMonth.toISOString(),
      membership_status: true,
    })
    .eq('id', userId);

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while renewing the membership. Please try again.", "error");
  } else {
    swal("Success", "Membership renewed successfully!", "success");
    fetchUsers(currentPage.value, searchQuery.value); // Refresh users after renewal
  }
};

const deleteUser = async (userId) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while deleting the user. Please try again.", "error");
  } else {
    swal("Success", "User deleted successfully!", "success");
    fetchUsers(currentPage.value, searchQuery.value); // Refresh users after deletion
  }
};

const confirmDeleteUser = (userId) => {
  swal({
    title: "Are you sure?",
    text: "Once deleted, you will not be able to recover this user.",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
  .then((willDelete) => {
    if (willDelete) {
      deleteUser(userId);
    }
  });
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1;
    fetchUsers(currentPage.value, searchQuery.value);
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value -= 1;
    fetchUsers(currentPage.value, searchQuery.value);
  }
};

const viewUserProfile = (userId) => {
  router.push(`/application/users/${userId}`);
};

const goToCreateUser = () => {
  router.push('/application/users/create');
};

const editUser = (userId) => {
  router.push(`/application/users/edit/${userId}`);
};

onMounted(() => {
  fetchUsers(currentPage.value);
});

watch(searchQuery, (newQuery) => {
  currentPage.value = 1; // Reset to first page when search query changes
  fetchUsers(currentPage.value, newQuery);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row justify-between items-center mb-6">
      <h1 class="text-4xl font-bold text-gray-800 mb-4 sm:mb-0">Members</h1>
      <button 
        @click="goToCreateUser" 
        class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium shadow hover:bg-blue-500 transition-all duration-200"
      >
        Add Member
      </button>
    </div>

    <!-- Search Bar -->
    <div class="mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by name"
        class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    
    <!-- Loader -->
    <div v-if="loading" class="flex justify-center items-center h-full">
      <div class="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-24 w-24"></div>
    </div>

    <!-- User List -->
    <div v-else>
      <div v-if="users.length">
        <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <li 
            v-for="user in users" 
            :key="user.id" 
            class="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            @click="viewUserProfile(user.id)"
          >
            <div class="mb-4">
              <p class="text-xl font-semibold text-gray-800">{{ user.name }}</p>
              <p class="text-gray-500">{{ user.email }}</p>
            </div>
            <div class="flex justify-between items-center">
              <span 
                :class="user.membership_status ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'"
                class="px-3 py-1 rounded-full text-sm font-semibold"
              >
                {{ user.membership_status ? 'Active' : 'Expired' }}
              </span>

              <!-- Renew Button -->
              <button
                v-if="!user.membership_status"
                @click.stop="renewMembership(user.id)" 
                class="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow hover:bg-blue-400 transition-all duration-200"
              >
                Renew Membership
              </button>
            </div>
            <div class="flex justify-between items-center mt-4">
              <button
                @click.stop="editUser(user.id)" 
              >
                <img src="/public/item_images/edit.png" alt="">
              </button>
              <button
                @click.stop="confirmDeleteUser(user.id)" 
              >
              <img src="/public/item_images/delete.png" alt="">
              </button>
            </div>
          </li>
        </ul>

        <!-- Pagination Controls -->
        <div class="flex justify-between items-center mt-8">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1" 
            class="bg-gray-300 text-gray-700 px-5 py-3 rounded-lg shadow-sm font-medium disabled:opacity-50 hover:bg-gray-400 transition-all duration-200"
          >
            Previous
          </button>
          <span class="text-gray-600 font-semibold">Page {{ currentPage }} of {{ totalPages }}</span>
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages" 
            class="bg-gray-300 text-gray-700 px-5 py-3 rounded-lg shadow-sm font-medium disabled:opacity-50 hover:bg-gray-400 transition-all duration-200"
          >
            Next
          </button>
        </div>
      </div>

      <!-- No Users Found -->
      <div v-else>
        <p class="text-center text-lg text-gray-500">No users found.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

* {
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
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

/* Buttons */
button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  transform: translateY(-2px);
  transition: all 0.2s ease-in-out;
}
</style>