<script setup>
import { ref, onMounted, watch } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import swal from 'sweetalert';

const exercises = ref([]);
const currentPage = ref(1);
const pageSize = 5; // Adjust the page size as needed
const totalExercises = ref(0);
const totalPages = ref(0);
const selectedType = ref(''); // Add a ref for the selected type
const searchQuery = ref(''); // Add a ref for the search query

const exerciseTypes = [
  'Abs Workout',
  'Shoulders Workout',
  'Arms Workout',
  'Legs Workout',
  'Back Workout',
  'Chest Workout'
];

const fetchExercises = async (page) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let query = supabase
    .from('exercises')
    .select('*', { count: 'exact' })
    .range(start, end);

  if (selectedType.value) {
    query = query.eq('type', selectedType.value);
  }

  if (searchQuery.value) {
    query = query.ilike('name', `%${searchQuery.value}%`);
  }

  let { data, error, count } = await query;

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while fetching exercises. Please try again.", "error");
  } else {
    exercises.value = data;
    totalExercises.value = count;
    totalPages.value = Math.ceil(count / pageSize);
  }
};

const deleteExercise = async (id) => {
  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while deleting the exercise. Please try again.", "error");
  } else {
    swal("Success", "Exercise deleted successfully!", "success");
    fetchExercises(currentPage.value);
  }
};

const confirmDeleteExercise = (id) => {
  swal({
    title: "Are you sure?",
    text: "Once deleted, you will not be able to recover this exercise.",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
  .then((willDelete) => {
    if (willDelete) {
      deleteExercise(id);
    }
  });
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1;
    fetchExercises(currentPage.value);
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value -= 1;
    fetchExercises(currentPage.value);
  }
};

const subscribeToDeletes = () => {
  const channel = supabase.channel('custom-delete-channel')
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'exercises' },
      (payload) => {
        console.log('Change received!', payload);
        fetchExercises(currentPage.value);
      }
    )
    .subscribe();
};

onMounted(() => {
  fetchExercises(currentPage.value);
  subscribeToDeletes();
});

watch([selectedType, searchQuery], () => {
  currentPage.value = 1; // Reset to first page when filter or search query changes
  fetchExercises(currentPage.value);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-4xl font-extrabold text-gray-800">Exercises</h1>
    </div>
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center">
        <label for="type-filter" class="block text-gray-700 font-medium mr-2">Type:</label>
        <select id="type-filter" v-model="selectedType" class="block bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200">
          <option value="">All</option>
          <option v-for="type in exerciseTypes" :key="type" :value="type">{{ type }}</option>
        </select>
      </div>
      <div class="flex items-center justify-center p-5">
        <div class="rounded-lg bg-gray-200 p-5">
          <div class="flex">
            <div class="flex w-10 items-center justify-center rounded-tl-lg rounded-bl-lg border-r border-gray-200 bg-white p-5">
              <svg viewBox="0 0 20 20" aria-hidden="true" class="pointer-events-none absolute w-5 fill-gray-500 transition">
                <path d="M16.72 17.78a.75.75 0 1 0 1.06-1.06l-1.06 1.06ZM9 14.5A5.5 5.5 0 0 1 3.5 9H2a7 7 0 0 0 7 7v-1.5ZM3.5 9A5.5 5.5 0 0 1 9 3.5V2a7 7 0 0 0-7 7h1.5ZM9 3.5A5.5 5.5 0 0 1 14.5 9H16a7 7 0 0 0-7-7v1.5Zm3.89 10.45 3.83 3.83 1.06-1.06-3.83-3.83-1.06 1.06ZM14.5 9a5.48 5.48 0 0 1-1.61 3.89l1.06 1.06A6.98 6.98 0 0 0 16 9h-1.5Zm-1.61 3.89A5.48 5.48 0 0 1 9 14.5V16a6.98 6.98 0 0 0 4.95-2.05l-1.06-1.06Z"></path>
              </svg>
            </div>
            <input type="text" v-model="searchQuery" class="w-full max-w-[160px] bg-white pl-2 text-base font-semibold outline-0" placeholder="Exercise Name" id="search-input">
            <input type="button" value="Search" @click="fetchExercises(currentPage.value)" class="bg-blue-500 p-2 rounded-tr-lg rounded-br-lg text-white font-semibold hover:bg-blue-800 transition-colors">
          </div>
        </div>
      </div>
      <router-link to="/application/exercises/create" class="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-500 transition duration-200">
        Create Exercise
      </router-link>
    </div>
    <div v-if="exercises.length">
      <ul class="space-y-4">
        <li v-for="exercise in exercises" :key="exercise.id" class="p-5 bg-white shadow-md rounded-lg transition-transform transform hover:scale-105">
          <p class="text-lg font-semibold text-gray-700"><strong>Name:</strong> {{ exercise.name }}</p>
          <p class="text-gray-600"><strong>Type:</strong> {{ exercise.type }}</p>
          <div class="flex space-x-3 mt-3">
            <router-link :to="`/application/exercises/${exercise.id}`">
              <button class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200">
                View
              </button>
            </router-link>
            <router-link :to="`/application/exercises/edit/${exercise.id}`">
              <button class="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-200">
                Edit
              </button>
            </router-link>
            <button @click="confirmDeleteExercise(exercise.id)" class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200">
              Delete
            </button>
          </div>
        </li>
      </ul>
      <div class="flex justify-between items-center mt-6">
        <button @click="prevPage" :disabled="currentPage === 1" class="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-blue-500 transition duration-200">
          Previous
        </button>
        <span class="text-gray-600">Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition duration-200">
          Next
        </button>
      </div>
    </div>
    <div v-else class="flex justify-center items-center h-full min-h-screen">
      <p class="text-center text-gray-500 text-lg">No exercises found.</p>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

body {
  font-family: 'Roboto', sans-serif;
}

select {
  padding: 0.5rem 1rem; /* Increase padding for better touch targets */
  font-size: 1rem; /* Font size */
  background-color: #ffffff; /* Background color */
  border-radius: 0.375rem; /* Rounded corners */
  border: 1px solid #d1d5db; /* Border color */
  transition: border-color 0.2s ease, box-shadow 0.2s ease; /* Transition effects */
}

select:focus {
  border-color: #3b82f6; /* Focus border color */
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5); /* Focus shadow */
}
</style>