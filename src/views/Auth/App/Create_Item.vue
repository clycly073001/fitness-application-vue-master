<script setup>
import { ref } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import swal from 'sweetalert';
import { useRouter } from 'vue-router';

const name = ref('');
const description = ref('');
const price = ref('');
const quantity = ref('');
// const image = ref(null);
const router = useRouter();

// const uploadImage = async (file) => {
//   try {
//     // Upload the file to the 'item_image' bucket in the 'public' folder
//     const { data, error: uploadError } = await supabase.storage
//       .from('item_image')
//       .upload(`public/${file.name}`, file, {
//         cacheControl: '3600',
//         upsert: false
//       });

//     if (uploadError) {
//       console.error('Upload error:', uploadError.message);
//       swal("Error", "An error occurred while uploading the image. Please try again.", "error");
//       return null;
//     }

//     // Get the public URL of the uploaded image
//     const { publicURL, error: urlError } = supabase.storage
//       .from('item_image')
//       .getPublicUrl(`public/${file.name}`);

//     if (urlError) {
//       console.error('Error getting image URL:', urlError.message);
//       swal("Error", "An error occurred while getting the image URL. Please try again.", "error");
//       return null;
//     }

//     return publicURL; // Make sure to return the public URL
//   } catch (e) {
//     console.error('Unexpected error:', e);
//     swal("Error", "An unexpected error occurred. Please try again.", "error");
//     return null;
//   }
// };

const createItem = async () => {
  const now = new Date().toISOString();

  let imageUrl = '';
  if (image.value) { // Check if image is defined and has a value
    imageUrl = await uploadImage(image.value);
    if (!imageUrl) return;
  }

  const { data, error } = await supabase
    .from('items_for_sale')
    .insert([
      {
        name: name.value,
        description: description.value,
        price: parseFloat(price.value),
        quantity: parseInt(quantity.value),
        // image: imageUrl,
        created_at: now,
        updated_at: now
      }
    ])
    .select();

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while creating the item. Please try again.", "error");
  } else {
    swal("Success", "Item created successfully!", "success");
    router.push('/application/shop');
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
    <div class="max-w-2xl w-full bg-white p-8 shadow-lg rounded-lg mt-6">
      <h1 class="text-3xl font-bold mb-4 text-center">Add Item</h1>
      <form @submit.prevent="createItem">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="name">Name</label>
          <input v-model="name" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name" type="text" placeholder="Name" required>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="description">Description</label>
          <textarea v-model="description" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="description" placeholder="Description" required></textarea>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="price">Price</label>
          <input v-model="price" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="price" type="number" step="0.01" placeholder="Price" required>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="quantity">Quantity</label>
          <input v-model="quantity" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="quantity" type="number" placeholder="Quantity" required>
        </div>
        <!-- <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="image">Image</label>
          <input @change="e => image.value = e.target.files[0]" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="image" type="file" accept="image/*">
        </div> -->
        <div class="flex justify-center">
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
            Create
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

body {
  font-family: 'Roboto', sans-serif;
}
</style>