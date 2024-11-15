<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '@/lib/supabaseClient';

const route = useRoute();
const meal = ref(null);
const error = ref(null);

const fetchMeal = async () => {
  const { id } = route.params;
  let { data, error: fetchError } = await supabase
    .from('meals')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) {
    error.value = fetchError.message;
  } else {
    meal.value = data;
  }
};

onMounted(() => {
  fetchMeal();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div v-if="error" class="text-red-500 text-lg">{{ error }}</div>
    <div v-else-if="meal" class="max-w-2xl mx-auto bg-white p-8 shadow-lg rounded-lg">
      <h1 class="text-4xl font-extrabold text-gray-800 mb-4">{{ meal.title }}</h1>
      <div class="space-y-4">
        <p class="text-lg text-gray-700" v-html="meal.summary"></p>
        <p class="text-lg text-gray-700"><strong>Calories:</strong> <span class="text-gray-500">{{ meal.calories }}</span></p>
      </div>
      <router-link to="/application/nutrition/saved-meals" class="mt-6 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-500 transition duration-200">
        Back to Saved Meals
      </router-link>
    </div>
    <div v-else class="flex justify-center items-center h-full min-h-screen">
      <p class="text-center text-gray-500 text-lg">Loading...</p>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}
</style>