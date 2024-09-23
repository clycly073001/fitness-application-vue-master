<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import swal from 'sweetalert';

const exercises = ref([]);
const users = ref([]);
const currentPage = ref(1);
const pageSize = 5; // Adjust the page size as needed
const totalExercises = ref(0);
const totalPages = ref(0);

const fetchUsers = async () => {
  let { data, error } = await supabase
    .from('users')
    .select('id, name');

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while fetching users. Please try again.", "error");
  } else {
    users.value = data;
  }
};

const fetchExercises = async (page) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let { data, error, count } = await supabase
    .from('exercises')
    .select('*', { count: 'exact' })
    .range(start, end);

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while fetching exercises. Please try again.", "error");
  } else {
    exercises.value = data.map(exercise => {
      const user = users.value.find(user => user.id === exercise.assigned_to);
      return {
        ...exercise,
        assigned_to_name: user ? user.name : 'Unknown'
      };
    });
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

onMounted(async () => {
  await fetchUsers();
  fetchExercises(currentPage.value);
  subscribeToDeletes();
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="flex justify-between">
      <h1 class="text-3xl font-bold mb-4">Exercises</h1>
      <router-link to="/application/exercises/create" class="bg-blue-900 text-white px-4 py-2 rounded mb-4 inline-block hover:bg-blue-800">
        Create Exercise
      </router-link>
    </div>
    <div v-if="exercises.length">
      <ul>
        <li v-for="exercise in exercises" :key="exercise.id" class="mb-3 p-4 bg-white shadow rounded">
          <p><strong>Name:</strong> {{ exercise.name }}</p>
          <p><strong>Description:</strong> {{ exercise.description }}</p>
          <p><strong>Content:</strong> <span v-html="exercise.content"></span></p>
          <p><strong>Assigned To:</strong> {{ exercise.assigned_to_name }}</p>
          <div class="flex space-x-2 mt-2">
            <router-link :to="`/application/exercises/${exercise.id}`" class="text-blue-500 hover:underline inline-block">
              <button class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                View
              </button>
            </router-link>
            <router-link :to="`/application/exercises/edit/${exercise.id}`" class="text-blue-500 hover:underline inline-block">
              <button class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                Edit
              </button>
            </router-link>
            <button @click="confirmDeleteExercise(exercise.id)" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
              Delete
            </button>
          </div>
        </li>
      </ul>
      <div class="flex justify-between mt-4">
        <button @click="prevPage" :disabled="currentPage === 1" class="bg-blue-900 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-blue-800">
          Previous
        </button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800">
          Next
        </button>
      </div>
    </div>
    <div v-else class="flex justify-center items-center h-full min-h-screen">
      <p class="text-center">No exercises found.</p>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

body {
  font-family: 'Roboto', sans-serif;
}
</style>