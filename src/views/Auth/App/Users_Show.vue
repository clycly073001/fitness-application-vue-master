<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '@/lib/supabaseClient';
import swal from 'sweetalert';

const route = useRoute();
const user = ref(null);
const loading = ref(true); // Add loading state

const fetchUser = async () => {
  const { id } = route.params;
  let { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while fetching the user. Please try again.", "error");
  } else {
    user.value = data;

    // Check if end_of_membership is the same as the current time
    const now = new Date();
    const endOfMembership = new Date(user.value.end_of_membership);

    if (endOfMembership <= now && user.value.membership_status) {
      // Update membership_status to false
      const { error: updateError } = await supabase
        .from('users')
        .update({ membership_status: false })
        .eq('id', id);

      if (updateError) {
        console.error('Error:', updateError);
        swal("Error", "An error occurred while updating the membership status. Please try again.", "error");
      } else {
        user.value.membership_status = false;
      }
    }
  }
  loading.value = false; // Set loading to false after fetching data
};

onMounted(() => {
  fetchUser();
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
    <div v-if="loading" class="flex justify-center items-center mt-6">
      <div class="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
    </div>
    <div v-else-if="user" class="max-w-2xl w-full bg-white p-8 shadow-lg rounded-lg mt-6">
      <div class="text-center mb-6">
        <h1 class="text-4xl font-bold mb-2 text-gray-800">
          {{ user.name }}
        </h1>
        <p class="text-gray-600">{{ user.email }}</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-gray-100 p-4 rounded-lg shadow-inner">
          <p class="text-gray-600"><strong>Role:</strong> {{ user.role }}</p>
        </div>
        <div class="bg-gray-100 p-4 rounded-lg shadow-inner">
          <p class="text-gray-600"><strong>Age:</strong> {{ user.age }}</p>
        </div>
        <div class="bg-gray-100 p-4 rounded-lg shadow-inner">
          <p class="text-gray-600"><strong>Goal:</strong> {{ user.goals }}</p>
        </div>
        <div class="bg-gray-100 p-4 rounded-lg shadow-inner">
          <p class="text-gray-600"><strong>Weight:</strong> {{ user.weight }} kg</p>
        </div>
        <div class="bg-gray-100 p-4 rounded-lg shadow-inner">
          <p class="text-gray-600"><strong>Height:</strong> {{ user.height }} cm</p>
        </div>
        <div class="bg-gray-100 p-4 rounded-lg shadow-inner">
          <p class="text-gray-600"><strong>Start of Membership:</strong> {{ new Date(user.start_of_membership).toLocaleString() }}</p>
        </div>
        <div class="bg-gray-100 p-4 rounded-lg shadow-inner">
          <p class="text-gray-600"><strong>End of Membership:</strong> {{ new Date(user.end_of_membership).toLocaleString() }}</p>
        </div>
        <div class="bg-gray-100 p-4 rounded-lg shadow-inner">
          <p class="text-gray-600"><strong>Membership Status:</strong>
            <span v-if="user.membership_status === true || user.membership_status === 1" class="ml-2 bg-green-500 text-white px-2 py-1 rounded-full">Active</span>
            <span v-else class="ml-2 bg-red-500 text-white px-2 py-1 rounded-full">Expired</span>
          </p>
        </div>
      </div>
    </div>
    <div v-else class="flex justify-center items-center h-full min-h-screen">
      <p class="text-center">No user found.</p>
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