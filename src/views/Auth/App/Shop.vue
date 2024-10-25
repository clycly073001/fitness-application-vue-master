<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'vue-router';

const router = useRouter();
const itemsForSale = ref([]);
const soldItems = ref([]); // Add soldItems ref
const error = ref(null);
const currentPage = ref(1);
const itemsPerPage = 8;
const totalItems = ref(0);
const showModal = ref(false); // Add showModal ref
const selectedItem = ref(null); // Add selectedItem ref
const users = ref([]); // Add users ref
const searchQuery = ref(''); // Add searchQuery ref
const selectedUsers = ref([]); // Add selectedUsers ref
const userQuantities = ref({}); // Add userQuantities ref

const soldItemsCurrentPage = ref(1); // Add current page for sold items
const soldItemsPerPage = 5; // Maximum of 5 sold items per page

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

const fetchSoldItems = async () => {
  let { data, error } = await supabase
    .from('sold_items_to_users')
    .select('id, created_at, item_id, user_id, quantity, items_for_sale(name), users(name)');

  if (error) {
    console.error('Error:', error);
  } else {
    soldItems.value = data;
  }
};

const fetchUsers = async (query = '') => {
  let { data, error } = await supabase
    .from('users')
    .select('*')
    .ilike('name', `%${query}%`);

  if (error) {
    console.error('Error:', error);
  } else {
    users.value = data;
  }
};

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));
const soldItemsTotalPages = computed(() => Math.ceil(soldItems.value.length / soldItemsPerPage)); // Total pages for sold items

const goToPage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
    fetchItems(page);
  }
};

const goToSoldItemsPage = (page) => {
  if (page > 0 && page <= soldItemsTotalPages.value) {
    soldItemsCurrentPage.value = page;
  }
};

const paginatedSoldItems = computed(() => {
  const start = (soldItemsCurrentPage.value - 1) * soldItemsPerPage;
  const end = start + soldItemsPerPage;
  return soldItems.value.slice(start, end);
});

const openModal = (item) => {
  selectedItem.value = item;
  showModal.value = true;
  fetchUsers(); // Fetch users when opening the modal
};

const closeModal = () => {
  showModal.value = false;
  selectedItem.value = null;
  selectedUsers.value = []; // Clear selected users when closing the modal
  userQuantities.value = {}; // Clear user quantities when closing the modal
};

const sellItemToUsers = async () => {
  if (!selectedItem.value || selectedUsers.value.length === 0) {
    return;
  }

  const records = selectedUsers.value.map(userId => ({
    item_id: selectedItem.value.id,
    user_id: userId,
    quantity: userQuantities.value[userId] || 1 // Default to 1 if not specified
  }));

  const { error: insertError } = await supabase
    .from('sold_items_to_users')
    .insert(records);

  if (insertError) {
    console.error('Error:', insertError);
    swal("Error", "An error occurred while saving the records. Please try again.", "error");
    return;
  }

  // Update the quantity of the item
  const totalQuantitySold = selectedUsers.value.reduce((sum, userId) => sum + (userQuantities.value[userId] || 1), 0);
  const newQuantity = selectedItem.value.quantity - totalQuantitySold;
  const { error: updateError } = await supabase
    .from('items_for_sale')
    .update({ quantity: newQuantity })
    .eq('id', selectedItem.value.id);

  if (updateError) {
    console.error('Error:', updateError);
    swal("Error", "An error occurred while updating the item quantity. Please try again.", "error");
  } else {
    swal("Success", "Item sold to selected users successfully!", "success");
    closeModal();
    fetchItems(currentPage.value); // Refresh items after updating quantity
    fetchSoldItems(); // Refresh sold items after selling
  }
};

onMounted(() => {
  fetchItems();
  fetchSoldItems(); // Fetch sold items on mount
});

watch(searchQuery, (newQuery) => {
  fetchUsers(newQuery);
});

const goToCreateItem = () => {
  router.push('/application/shop/create');
};

const goToShowItem = (id) => {
  router.push(`/application/shop/${id}`);
};
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-4xl font-bold text-gray-800">Shop</h1>
      <button 
        @click="goToCreateItem" 
        class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:bg-blue-500 transition-all duration-200"
      >
        Add Item
      </button>
    </div>
    <div v-if="error" class="text-red-500 text-lg">{{ error }}</div>
    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
        <div v-for="item in itemsForSale" :key="item.id" class="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
          <button @click="goToShowItem(item.id)" class="w-full text-left">
            <h2 class="text-xl font-semibold mb-2 text-blue-600 hover:underline">{{ item.name }}</h2> 
            <p class="text-gray-900 font-bold mb-2">₱{{ item.price.toFixed(2) }}</p>
            <p class="text-gray-600">Quantity: {{ item.quantity }}</p>
          </button>
          <button 
            @click="openModal(item)"
            class="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-green-400 transition-all duration-200"
          >
            Sold to
          </button>
        </div>
      </div>
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

    <!-- Sold Items List -->
    <div class="mt-12">
      <h2 class="text-3xl font-bold text-gray-800 mb-6">Sold Items</h2>
      <div v-if="soldItems.length">
        <ul class="space-y-4">
          <li v-for="soldItem in paginatedSoldItems" :key="soldItem.id" class="bg-white p-4 rounded-lg shadow-md">
            <p class="text-lg font-semibold text-gray-800">Item: {{ soldItem.items_for_sale.name }}</p>
            <p class="text-gray-600">Sold to: {{ soldItem.users.name }}</p>
            <p class="text-gray-600">Quantity: {{ soldItem.quantity }}</p>
            <p class="text-gray-500 text-sm">Date: {{ new Date(soldItem.created_at).toLocaleString() }}</p>
          </li>
        </ul>
        <div class="flex justify-center space-x-2 mt-6">
          <button 
            @click="goToSoldItemsPage(soldItemsCurrentPage - 1)" 
            :disabled="soldItemsCurrentPage === 1" 
            class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium shadow hover:bg-gray-400 transition-all duration-200"
          >
            Previous
          </button>
          <span class="px-4 py-2 text-lg">{{ soldItemsCurrentPage }} / {{ soldItemsTotalPages }}</span>
          <button 
            @click="goToSoldItemsPage(soldItemsCurrentPage + 1)" 
            :disabled="soldItemsCurrentPage === soldItemsTotalPages" 
            class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium shadow hover:bg-gray-400 transition-all duration-200"
          >
            Next
          </button>
        </div>
      </div>
      <div v-else>
        <p class="text-center text-lg text-gray-500">No items sold yet.</p>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 class="text-2xl font-bold mb-4">Select User</h2>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name"
          class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />
        <ul class="max-h-60 overflow-y-auto">
          <li v-for="user in users" :key="user.id" class="flex items-center mb-2">
            <input type="checkbox" :id="`user-${user.id}`" v-model="selectedUsers" :value="user.id" class="mr-2">
            <label :for="`user-${user.id}`" class="text-gray-700">{{ user.name }}</label>
            <input 
              type="number" 
              v-model="userQuantities[user.id]" 
              min="1" 
              class="ml-2 w-16 p-1 border border-gray-300 rounded-lg"
              placeholder="Qty"
            />
          </li>
        </ul>
        <div class="flex justify-end mt-4">
          <button @click="sellItemToUsers" class="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-blue-400 transition-all duration-200 mr-2">
            Sold
          </button>
          <button @click="closeModal" class="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-gray-400 transition-all duration-200">
            Close
          </button>
        </div>
      </div>
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