<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const meals = ref([]);
const error = ref(null);
const currentPage = ref(1);
const itemsPerPage = 10;
const totalItems = ref(0);
const router = useRouter();

const fetchMeals = async (page = 1) => {
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage - 1;

  let { data, error: fetchError, count } = await supabase
    .from('meals')
    .select('*', { count: 'exact' })
    .range(start, end);

  if (fetchError) {
    error.value = fetchError.message;
  } else {
    meals.value = data;
    totalItems.value = count;
  }
};

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

const goToPage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
    fetchMeals(page);
  }
};

onMounted(() => {
  fetchMeals();
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-8">Saved Meals from Nutrition Search</h1>

    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="meal in meals" :key="meal.id" class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-4">
          <router-link :to="{ name: 'SavedMeals_Show', params: { id: meal.id } }" class="text-xl font-semibold text-blue-800 mb-2 hover:underline">
            {{ meal.title }}
          </router-link>
          <p class="text-gray-600 mb-4" v-html="meal.summary"></p>
          <div class="flex justify-between items-center mb-2">
            <p class="text-gray-700 font-medium">Calories: {{ meal.calories }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-center mt-8">
      <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:shadow-outline">
        Previous
      </button>
      <span class="mx-4 text-lg font-semibold">{{ currentPage }} / {{ totalPages }}</span>
      <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:shadow-outline">
        Next
      </button>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}
.grid {
  display: grid;
  gap: 1.5rem;
}
</style>