<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '@/lib/supabaseClient';
import swal from 'sweetalert';

const route = useRoute();
const router = useRouter();
const form = ref({
  name: '',
  type: '',
  equipment: '',
  execution: '',
  rest: '',
  link: '' // Add link field
});

const errors = ref({
  name: '',
  type: '',
  equipment: '',
  execution: '',
  rest: '',
  link: '' // Add link field
});

const fetchExercise = async () => {
  const { id } = route.params;
  let { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while fetching the exercise. Please try again.", "error");
  } else {
    form.value = data;
  }
};

const validateForm = () => {
  let valid = true;
  errors.value = {
    name: '',
    type: '',
    equipment: '',
    execution: '',
    rest: '',
    link: '' // Add link field
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
  if (!form.value.link) {
    errors.value.link = 'Exercise link is required';
    valid = false;
  } else if (!form.value.link.includes('youtube.com') && !form.value.link.includes('youtu.be')) {
    errors.value.link = 'Exercise link must be a YouTube link';
    valid = false;
  }

  return valid;
};

const updateExercise = async () => {
  if (!validateForm()) {
    return;
  }

  const { id } = route.params;
  const { error } = await supabase
    .from('exercises')
    .update({
      name: form.value.name,
      type: form.value.type,
      equipment: form.value.equipment,
      execution: form.value.execution,
      rest: form.value.rest,
      link: form.value.link, // Add link field
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while updating the exercise. Please try again.", "error");
  } else {
    swal("Success", "Exercise updated successfully!", "success");
    router.push('/application/exercises');
  }
};

onMounted(() => {
  fetchExercise();
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <h1 class="text-3xl font-bold mb-4">Edit Exercise</h1>
    <div class="flex justify-center mt-10">
      <div class="w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Exercise Details</h3>
        <form @submit.prevent="updateExercise" class="border border-gray-300 shadow-lg p-6 rounded-lg bg-white">
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
              Rest Time
            </label>
            <input
              v-model="form.rest"
              type="text"
              class="border border-gray-400 p-2 w-full rounded-lg"
              name="rest"
              id="rest"
              required
            />
            <span class="text-red-500 text-sm">{{ errors.rest }}</span>
          </div>

          <div class="mb-6">
            <label class="block mb-2 uppercase font-bold text-xs text-gray-700" for="link">
              Exercise Link
            </label>
            <input
              v-model="form.link"
              type="url"
              class="border border-gray-400 p-2 w-full rounded-lg"
              name="link"
              id="link"
              required
            />
            <span class="text-red-500 text-sm">{{ errors.link }}</span>
          </div>

          <div class="mb-6">
            <button
              type="submit"
              class="bg-gray-800 text-white rounded-lg px-4 py-2 hover:bg-gray-900"
            >
              Update Exercise
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