<!-- src/views/Exercises_Create.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import swal from 'sweetalert';

let form = ref({
  name: '',
  description: '',
  content: '',
  assigned_to: ''
});

const users = ref([]);
const errors = ref({
  name: '',
  description: '',
  content: '',
  assigned_to: ''
});

const fetchUsers = async () => {
  let { data, error } = await supabase
    .from('users')
    .select('id, name');

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while fetching users. Please try again.", "error");
  } else {
    users.value = data;
  }
};

const validateForm = () => {
  let valid = true;
  errors.value = {
    name: '',
    description: '',
    content: '',
    assigned_to: ''
  };

  if (!form.value.name) {
    errors.value.name = 'Exercise name is required';
    valid = false;
  }
  if (!form.value.description) {
    errors.value.description = 'Exercise description is required';
    valid = false;
  }
  if (!form.value.content) {
    errors.value.content = 'Exercise content is required';
    valid = false;
  }
  if (!form.value.assigned_to) {
    errors.value.assigned_to = 'Assigning to a user is required';
    valid = false;
  }

  return valid;
};

const createExercise = async () => {
  if (!validateForm()) {
    return;
  }

  const { error } = await supabase
    .from('exercises')
    .insert([
      {
        name: form.value.name,
        description: form.value.description,
        content: form.value.content,
        assigned_to: form.value.assigned_to,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while creating the exercise. Please try again.", "error");
  } else {
    swal("Success", "Exercise created successfully!", "success");
    form.value = {
      name: '',
      description: '',
      content: '',
      assigned_to: ''
    };
  }
};

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <h1 class="text-3xl font-bold mb-4">Create Exercise</h1>
    <div class="flex justify-center mt-10">
      <div class="w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Exercise Details</h3>
        <form @submit.prevent="createExercise" class="border border-gray-300 shadow-lg p-6 rounded-lg bg-white">
          <div class="mb-6">
            <label class="block mb-2 uppercase font-bold text-xs text-gray-700" for="name">
              Exercise Name
            </label>
            <input
              v-model="form.name"
              type="text"
              class="border border-gray-400 p-2 w-full rounded-lg"
              name="name"
              id="name"
              required
            />
            <span class="text-red-500 text-sm">{{ errors.name }}</span>
          </div>

          <div class="mb-6">
            <label class="block mb-2 uppercase font-bold text-xs text-gray-700" for="description">
              Exercise Description
            </label>
            <textarea
              v-model="form.description"
              class="border border-gray-400 p-2 w-full rounded-lg"
              name="description"
              id="description"
              required
            />
            <span class="text-red-500 text-sm">{{ errors.description }}</span>
          </div>

          <div class="mb-6">
            <label class="block mb-2 uppercase font-bold text-xs text-gray-700" for="content">
              Exercise Content
            </label>
            <textarea
              v-model="form.content"
              class="border border-gray-400 p-2 w-full h-40 rounded-lg"
              name="content"
              id="content"
              required
            />
            <span class="text-red-500 text-sm">{{ errors.content }}</span>
          </div>

          <div class="mb-6">
            <label class="block mb-2 uppercase font-bold text-xs text-gray-700" for="assigned_to">
              Assign To
            </label>
            <select
              v-model="form.assigned_to"
              class="border border-gray-400 p-2 w-full rounded-lg"
              name="assigned_to"
              id="assigned_to"
              required
            >
              <option value="" disabled>Select a user</option>
              <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
            </select>
            <span class="text-red-500 text-sm">{{ errors.assigned_to }}</span>
          </div>

          <div class="mb-6">
            <button
              type="submit"
              class="bg-gray-800 text-white rounded-lg px-4 py-2 hover:bg-gray-900"
            >
              Create Exercise
            </button>
          </div>  
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

body {
  font-family: 'Roboto', sans-serif;
}
</style>