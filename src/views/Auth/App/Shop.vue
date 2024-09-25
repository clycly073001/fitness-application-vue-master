<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'vue-router';

const router = useRouter();
const itemsForSale = ref([]);
const error = ref(null);
const currentPage = ref(1);
const itemsPerPage = 8;
const totalItems = ref(0);

const fetchItems = async (page = 1) => {
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage - 1;

  let { data, error: fetchError, count } = await supabase
    .from('items_for_sale')
    .select('*', { count: 'exact' })
    .range(start, end);

  if (fetchError) {
    error.value = fetchError.message;
  } else {
    itemsForSale.value = data;
    totalItems.value = count;
  }
};

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

const goToPage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
    fetchItems(page);
  }
};

onMounted(() => {
  fetchItems();
});

const goToCreateItem = () => {
  router.push('/application/shop/create');
};
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-3xl font-bold">Shop</h1>
      <button 
        @click="goToCreateItem" 
        class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium shadow hover:bg-blue-500 transition-all duration-200"
      >
        Add Item
      </button>
    </div>
    <div v-if="error" class="text-red-500">{{ error }}</div>
    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
        <div v-for="item in itemsForSale" :key="item.id" class="bg-white p-4 rounded-lg shadow">
          <h2 class="text-xl font-bold mb-2">{{ item.name }}</h2>
          <p class="text-gray-700 mb-2">{{ item.description }}</p>
          <p class="text-gray-900 font-bold mb-2">${{ item.price.toFixed(2) }}</p>
          <p class="text-gray-600">Quantity: {{ item.quantity }}</p>
        </div>
      </div>
      <div class="flex justify-center space-x-2">
        <button 
          @click="goToPage(currentPage - 1)" 
          :disabled="currentPage === 1" 
          class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium shadow hover:bg-gray-400 transition-all duration-200"
        >
          Previous
        </button>
        <span class="px-4 py-2">{{ currentPage }} / {{ totalPages }}</span>
        <button 
          @click="goToPage(currentPage + 1)" 
          :disabled="currentPage === totalPages" 
          class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium shadow hover:bg-gray-400 transition-all duration-200"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  gap: 1.5rem;
}
</style>