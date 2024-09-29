<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '@/lib/supabaseClient';
import swal from 'sweetalert';

const route = useRoute();
const exercise = ref(null);

const fetchExercise = async () => {
  const { id } = route.params;
  let { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while fetching the exercise. Please try again.", "error");
  } else {
    exercise.value = data;
  }
};

onMounted(() => {
  fetchExercise();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div v-if="exercise" class="max-w-2xl mx-auto bg-white p-8 shadow-lg rounded-lg transition-transform transform hover:scale-105">
      <h1 class="text-4xl font-extrabold text-gray-800 mb-4">{{ exercise.name }}</h1>
      <p class="text-lg text-gray-700"><strong>Type:</strong> {{ exercise.type }}</p>
      <p class="text-lg text-gray-700"><strong>Equipment:</strong> {{ exercise.equipment }}</p>
      <p class="text-lg text-gray-700"><strong>Execution:</strong> <span v-html="exercise.execution"></span></p>
      <p class="text-lg text-gray-700"><strong>Rest:</strong> {{ exercise.rest }} seconds</p>
      <p class="text-lg text-gray-700"><strong>Created At:</strong> {{ formatDate(exercise.created_at) }}</p>
      <p class="text-lg text-gray-700"><strong>Updated At:</strong> {{ formatDate(exercise.updated_at) }}</p>
      <router-link to="/application/exercises" class="mt-6 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-500 transition duration-200">
        Back to Exercises
      </router-link>
    </div>
    <div v-else class="flex justify-center items-center h-full min-h-screen">
      <p class="text-center text-gray-500 text-lg">Loading...</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      exercise: null, // Assuming exercise data is fetched here
    };
  },
  methods: {
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

body {
  font-family: 'Roboto', sans-serif;
}
</style>

