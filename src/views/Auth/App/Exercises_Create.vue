<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import swal from 'sweetalert';

let form = ref({
  name: '',
  type: '',
  equipment: '',
  execution: '',
  rest: ''
});

const errors = ref({
  name: '',
  type: '',
  equipment: '',
  execution: '',
  rest: ''
});

const validateForm = () => {
  let valid = true;
  errors.value = {
    name: '',
    type: '',
    equipment: '',
    execution: '',
    rest: ''
  };

  if (!form.value.name) {
    errors.value.name = 'Exercise name is required';
    valid = false;
  }
  if (!form.value.type) {
    errors.value.type = 'Exercise type is required';
    valid = false;
  }
  if (!form.value.equipment) {
    errors.value.equipment = 'Exercise equipment is required';
    valid = false;
  }
  if (!form.value.execution) {
    errors.value.execution = 'Exercise execution is required';
    valid = false;
  }
  if (!form.value.rest) {
    errors.value.rest = 'Rest time is required';
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
        type: form.value.type,
        equipment: form.value.equipment,
        execution: form.value.execution,
        rest: form.value.rest,
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
      type: '',
      equipment: '',
      execution: '',
      rest: ''
    };
  }
};
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
            <label class="block mb-2 uppercase font-bold text-xs text-gray-700" for="type">
              Exercise Type
            </label>
            <input
              v-model="form.type"
              type="text"
              class="border border-gray-400 p-2 w-full rounded-lg"
              name="type"
              id="type"
              required
            />
            <span class="text-red-500 text-sm">{{ errors.type }}</span>
          </div>

          <div class="mb-6">
            <label class="block mb-2 uppercase font-bold text-xs text-gray-700" for="equipment">
              Exercise Equipment
            </label>
            <input
              v-model="form.equipment"
              type="text"
              class="border border-gray-400 p-2 w-full rounded-lg"
              name="equipment"
              id="equipment"
              required
            />
            <span class="text-red-500 text-sm">{{ errors.equipment }}</span>
          </div>

          <div class="mb-6">
            <label class="block mb-2 uppercase font-bold text-xs text-gray-700" for="execution">
              Exercise Execution
            </label>
            <textarea
              v-model="form.execution"
              class="border border-gray-400 p-2 w-full h-40 rounded-lg"
              name="execution"
              id="execution"
              required
            />
            <span class="text-red-500 text-sm">{{ errors.execution }}</span>
          </div>

          <div class="mb-6">
            <label class="block mb-2 uppercase font-bold text-xs text-gray-700" for="rest">
              Rest Time (seconds)
            </label>
            <input
              v-model="form.rest"
              type="number"
              class="border border-gray-400 p-2 w-full rounded-lg"
              name="rest"
              id="rest"
              required
            />
            <span class="text-red-500 text-sm">{{ errors.rest }}</span>
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