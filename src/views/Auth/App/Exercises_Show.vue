<!-- src/views/Exercises_Show.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '@/lib/supabaseClient';
import swal from 'sweetalert';

const route = useRoute();
const exercise = ref(null);
const assignedToUser = ref(null);

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
    fetchAssignedToUser(data.assigned_to);
  }
};

const fetchAssignedToUser = async (userId) => {
  let { data, error } = await supabase
    .from('users')
    .select('name')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while fetching the user. Please try again.", "error");
  } else {
    assignedToUser.value = data.name;
  }
};

onMounted(() => {
  fetchExercise();
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div v-if="exercise" class="max-w-2xl mx-auto bg-white p-6 shadow rounded">
      <h1 class="text-3xl font-bold mb-4">{{ exercise.name }}</h1>
      <p><strong>Description:</strong> {{ exercise.description }}</p>
      <p><strong>Content:</strong> <span v-html="exercise.content"></span></p>
      <p><strong>Assigned To:</strong> {{ assignedToUser || 'Unknown' }}</p>
    </div>
    <div v-else class="flex justify-center items-center h-full min-h-screen">
      <p class="text-center">Loading...</p>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

body {
  font-family: 'Roboto', sans-serif;
}
</style>