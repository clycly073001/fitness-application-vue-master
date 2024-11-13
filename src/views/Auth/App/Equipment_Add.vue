<script setup>
import { ref } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'vue-router';
import swal from 'sweetalert';

const router = useRouter();
const name = ref('');
const quantity = ref(0);
const error = ref(null);

const addEquipment = async () => {
  if (!name.value || quantity.value <= 0) {
    error.value = 'Please provide valid name and quantity.';
    return;
  }

  const { data, error: insertError } = await supabase
    .from('equipment')
    .insert([{ name: name.value, quantity: quantity.value }]);

  if (insertError) {
    error.value = insertError.message;
    swal("Error", "An error occurred while adding the equipment. Please try again.", "error");
  } else {
    swal("Success", "Equipment added successfully!", "success");
    router.push('/application/equipment');
  }
};
</script>

<template>
  <div class="container mx-auto p-6">
    <h1 class="text-4xl font-bold text-gray-800 mb-6">Add Equipment</h1>
    <div v-if="error" class="text-red-500 text-lg mb-4">{{ error }}</div>
    <div class="bg-white p-6 rounded-lg shadow-lg">
      <div class="mb-4">
        <label for="name" class="block text-gray-700 font-bold mb-2">Name</label>
        <input 
          type="text" 
          id="name" 
          v-model="name" 
          class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div class="mb-4">
        <label for="quantity" class="block text-gray-700 font-bold mb-2">Quantity</label>
        <input 
          type="number" 
          id="quantity" 
          v-model="quantity" 
          min="0"
          class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div class="flex justify-end">
        <button 
          @click="addEquipment" 
          class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:bg-blue-500 transition-all duration-200"
        >
          Add Equipment
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 600px;
}
</style>