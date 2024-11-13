<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'vue-router';
import swal from 'sweetalert';

const router = useRouter();
const equipment = ref([]);
const error = ref(null);
const currentPage = ref(1);
const itemsPerPage = 10;
const totalItems = ref(0);
const searchQuery = ref('');

const fetchEquipment = async (page = 1, query = '') => {
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage - 1;

  let { data, error: fetchError, count } = await supabase
    .from('equipment')
    .select('*', { count: 'exact' })
    .ilike('name', `%${query}%`)
    .range(start, end);

  if (fetchError) {
    error.value = fetchError.message;
  } else {
    equipment.value = data;
    totalItems.value = count;
  }
};

const deleteEquipment = async (id) => {
  const { error: deleteError } = await supabase
    .from('equipment')
    .delete()
    .eq('id', id);

  if (deleteError) {
    swal("Error", "An error occurred while deleting the equipment. Please try again.", "error");
  } else {
    swal("Success", "Equipment deleted successfully!", "success");
    fetchEquipment(currentPage.value, searchQuery.value);
  }
};

const confirmDelete = (id) => {
  swal({
    title: "Are you sure?",
    text: "Once deleted, you will not be able to recover this equipment!",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
  .then((willDelete) => {
    if (willDelete) {
      deleteEquipment(id);
    }
  });
};

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

const goToPage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
    fetchEquipment(page, searchQuery.value);
  }
};

const goToAddEquipment = () => {
  router.push('/application/equipment/add');
};

const goToEditEquipment = (id) => {
  router.push(`/application/equipment/edit/${id}`);
};

watch(searchQuery, (newQuery) => {
  fetchEquipment(currentPage.value, newQuery);
});

onMounted(() => {
  fetchEquipment();
});
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-4xl font-bold text-gray-800">Equipment List</h1>
      <button 
        @click="goToAddEquipment" 
        class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:bg-blue-500 transition-all duration-200"
      >
        Add Equipment
      </button>
    </div>
    <div class="mb-6">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Search by name" 
        class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div v-if="error" class="text-red-500 text-lg">{{ error }}</div>
    <div v-else>
      <table class="min-w-full bg-white">
        <thead>
          <tr>
            <th class="py-2 px-4 border-b">ID</th>
            <th class="py-2 px-4 border-b">Name</th>
            <th class="py-2 px-4 border-b">Quantity</th>
            <th class="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in equipment" :key="item.id">
            <td class="py-2 px-4 border-b text-center">{{ item.id }}</td>
            <td class="py-2 px-4 border-b text-center">{{ item.name }}</td>
            <td class="py-2 px-4 border-b text-center">{{ item.quantity }}</td>
            <td class="py-2 px-4 border-b text-center">
              <button 
                @click="goToEditEquipment(item.id)" 
                class="bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-yellow-400 transition-all duration-200 mr-2"
              >
                Edit
              </button>
              <button 
                @click="confirmDelete(item.id)" 
                class="bg-red-500 text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-red-400 transition-all duration-200"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="flex justify-center space-x-2 mt-6">
        <button 
          @click="goToPage(currentPage - 1)" 
          :disabled="currentPage === 1" 
          class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium shadow hover:bg-gray-400 transition-all duration-200"
        >
          Previous
        </button>
        <span class="px-4 py-2 text-lg">{{ currentPage }} / {{ totalPages }}</span>
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
.container {
  max-width: 1200px;
}
</style>