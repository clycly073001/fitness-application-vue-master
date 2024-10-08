<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '@/lib/supabaseClient';
import swal from 'sweetalert';

const route = useRoute();
const router = useRouter();
const item = ref(null);
const error = ref(null);

const fetchItem = async () => {
  const { id } = route.params;
  let { data, error: fetchError } = await supabase
    .from('items_for_sale')
    .select('name, description, price, quantity, created_at')
    .eq('id', id)
    .single();

  if (fetchError) {
    error.value = fetchError.message;
  } else {
    item.value = data;
  }
};

const deleteItem = async (id) => {
  const { error: deleteError } = await supabase
    .from('items_for_sale')
    .delete()
    .eq('id', id);

  if (deleteError) {
    console.error('Error:', deleteError);
    swal("Error", "An error occurred while deleting the item. Please try again.", "error");
  } else {
    swal("Success", "Item deleted successfully!", "success").then(() => {
      router.push('/application/shop');
    });
  }
};

const confirmDeleteItem = (id) => {
  swal({
    title: "Delete?",
    text: "You will not be able to recover this item.",
    icon: "warning",
    buttons: {
      cancel: {
        text: "Cancel",
        visible: true,
        closeModal: true,
      },
      confirm: {
        text: "Delete",
        visible: true,
        closeModal: false,
      },
    },
    dangerMode: true,
  })
  .then((willDelete) => {
    if (willDelete) {
      deleteItem(id);
    }
  });
};

const goToEditItem = (id) => {
  router.push(`/application/shop/edit/${id}`);
};

onMounted(() => {
  fetchItem();
});
</script>

<template>
  <div v-if="error" class="text-red-500">{{ error }}</div>
  <div v-else-if="item" class="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg mt-6">
    <h1 class="text-3xl font-bold mb-4">{{ item.name }}</h1>
    <p class="text-gray-700 mb-4">{{ item.description }}</p>
    <p class="text-gray-900 font-bold mb-4">Price: ${{ item.price.toFixed(2) }}</p>
    <p class="text-gray-600 mb-4">Quantity: {{ item.quantity }}</p>
    <p class="text-gray-500">Created At: {{ new Date(item.created_at).toLocaleString() }}</p>
    <div class="flex space-x-4 mt-4">
      <button 
        @click="confirmDeleteItem(route.params.id)" 
        class="bg-red-600 text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-red-500 transition-all duration-200"
      >
        Delete
      </button>
      <button 
        @click="goToEditItem(route.params.id)" 
        class="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-blue-500 transition-all duration-200"
      >
        Edit
      </button>
    </div>
  </div>
  <div v-else class="text-center">Loading...</div>
</template>

<style scoped>
</style>