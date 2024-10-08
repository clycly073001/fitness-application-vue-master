<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '@/lib/supabaseClient';
import swal from 'sweetalert';

const route = useRoute();
const router = useRouter();
const item = ref({
  name: '',
  description: '',
  price: 0,
  quantity: 0,
});
const error = ref(null);

const fetchItem = async () => {
  const { id } = route.params;
  let { data, error: fetchError } = await supabase
    .from('items_for_sale')
    .select('name, description, price, quantity')
    .eq('id', id)
    .single();

  if (fetchError) {
    error.value = fetchError.message;
  } else {
    item.value = data;
  }
};

const updateItem = async () => {
  const { id } = route.params;
  const { error: updateError } = await supabase
    .from('items_for_sale')
    .update({
      name: item.value.name,
      description: item.value.description,
      price: item.value.price,
      quantity: item.value.quantity,
    })
    .eq('id', id);

  if (updateError) {
    swal("Error", "An error occurred while updating the item. Please try again.", "error");
  } else {
    swal("Success", "Item updated successfully!", "success").then(() => {
      router.push('/application/shop');
    });
  }
};

onMounted(() => {
  fetchItem();
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
    <div class="max-w-2xl w-full bg-white p-8 shadow-lg rounded-lg mt-6">
      <h1 class="text-3xl font-bold mb-4 text-center">Edit Item</h1>
      <form @submit.prevent="updateItem">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="name">Name</label>
          <input v-model="item.name" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name" type="text" placeholder="Name" required>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="description">Description</label>
          <textarea v-model="item.description" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="description" placeholder="Description" required></textarea>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="price">Price</label>
          <input v-model="item.price" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="price" type="number" step="0.01" placeholder="Price" required>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="quantity">Quantity</label>
          <input v-model="item.quantity" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="quantity" type="number" placeholder="Quantity" required>
        </div>
        <div class="flex justify-center">
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
            Update
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
</style>