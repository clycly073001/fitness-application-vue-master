<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '@/lib/supabaseClient';
import swal from 'sweetalert';

const route = useRoute();
const router = useRouter();
const user = ref(null);
const loading = ref(true);
const showModal = ref(false);
const exercises = ref([]);
const selectedExercises = ref([]);
const assignedExercises = ref([]);
const currentPage = ref(1);
const itemsPerPage = 5;

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

    const now = new Date();
    const endOfMembership = new Date(user.value.end_of_membership);

    if (endOfMembership <= now && user.value.membership_status) {
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
  loading.value = false;
};

const fetchExercises = async () => {
  let { data, error } = await supabase
    .from('exercises')
    .select('*');

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while fetching exercises. Please try again.", "error");
  } else {
    exercises.value = data;
  }
};

const fetchAssignedExercises = async (page = 1) => {
  const { id: userId } = route.params;
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  let { data, error } = await supabase
    .from('exercises_users')
    .select('exercise_id, created_at')
    .eq('user_id', userId)
    .range(from, to);

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while fetching assigned exercises. Please try again.", "error");
  } else {
    assignedExercises.value = await Promise.all(data.map(async (assigned) => {
      const { data: exerciseDetails, error: exerciseError } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', assigned.exercise_id)
        .single();

      if (exerciseError) {
        console.error('Error:', exerciseError);
        return null;
      }

      return { ...assigned, ...exerciseDetails };
    }));
  }
};

const assignExercises = async () => {
  const { id: userId } = route.params;
  const now = new Date().toISOString();
  const rows = selectedExercises.value.map(exerciseId => ({
    user_id: userId,
    exercise_id: exerciseId,
    created_at: now
  }));

  console.log('Rows to insert:', rows); // Debugging line

  const { error } = await supabase
    .from('exercises_users')
    .insert(rows)
    .select();

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while assigning exercises. Please try again.", "error");
  } else {
    swal("Success", "Exercises assigned successfully!", "success");
    showModal.value = false;
    selectedExercises.value = [];
    fetchAssignedExercises(currentPage.value); // Refresh the assigned exercises list
  }
};

const changePage = (page) => {
  currentPage.value = page;
  fetchAssignedExercises(page);
};

onMounted(() => {
  fetchUser();
  fetchExercises();
  fetchAssignedExercises();
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
      <div class="mt-6 text-center">
        <button @click="showModal = true" class="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-500 transition duration-200">
          Assign Exercise(s)
        </button>
      </div>
      <div class="mt-6">
        <h2 class="text-2xl font-bold mb-4">Assigned Exercises</h2>
        <div class="overflow-x-auto">
          <table v-if="assignedExercises.length > 0" class="min-w-full bg-white">
            <thead>
              <tr>
                <th class="py-2 px-4 border-b">Exercise Name</th>
                <th class="py-2 px-4 border-b">Type</th>
                <th class="py-2 px-4 border-b">Assigned At</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="assigned in assignedExercises" :key="assigned.exercise_id">
                <td class="py-2 px-4 border-b">
                  <router-link :to="{ name: 'ShowExercise', params: { id: assigned.exercise_id } }" class="text-blue-600 hover:underline">
                    {{ assigned.name }}
                  </router-link>
                </td>
                <td class="py-2 px-4 border-b">{{ assigned.type }}</td>
                <td class="py-2 px-4 border-b">{{ new Date(assigned.created_at).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="text-center text-gray-600">No assigned exercises</p>
        </div>
        <div v-if="assignedExercises.length > 0" class="mt-4 flex justify-center">
          <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="px-4 py-2 mx-1 bg-gray-300 rounded-lg">Previous</button>
          <button @click="changePage(currentPage + 1)" :disabled="assignedExercises.length < itemsPerPage" class="px-4 py-2 mx-1 bg-gray-300 rounded-lg">Next</button>
        </div>
      </div>
    </div>
    <div v-else class="flex justify-center items-center h-full min-h-screen">
      <p class="text-center">No user found.</p>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 class="text-2xl font-bold mb-4">Assign Exercise(s)</h2>
        <div class="max-h-60 overflow-y-auto mb-4">
          <ul>
            <li v-for="exercise in exercises" :key="exercise.id" class="mb-2">
              <label class="flex items-center">
                <input type="checkbox" v-model="selectedExercises" :value="exercise.id" class="mr-2">
                {{ exercise.name }}
              </label>
            </li>
          </ul>
        </div>
        <div class="flex justify-end">
          <button @click="showModal = false" class="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-gray-600 transition duration-200">
            Cancel
          </button>
          <button @click="assignExercises" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition duration-200">
            Assign
          </button>
        </div>
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