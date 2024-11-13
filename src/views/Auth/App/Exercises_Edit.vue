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
  execution: '',
  rest: '',
  link: ''
});

const errors = ref({
  name: '',
  type: '',
  execution: '',
  rest: '',
  link: ''
});

const equipmentList = ref([]);
const selectedEquipment = ref([]);
const showModal = ref(false);

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

    // Fetch the selected equipment for this exercise
    const { data: equipmentData, error: equipmentError } = await supabase
      .from('exercise_equipment')
      .select('equipment_id')
      .eq('exercise_id', id);

    if (equipmentError) {
      console.error('Error fetching equipment:', equipmentError);
    } else {
      selectedEquipment.value = equipmentData.map(e => e.equipment_id);
    }
  }
};

const fetchEquipment = async () => {
  let { data, error } = await supabase
    .from('equipment')
    .select('*');

  if (error) {
    console.error('Error fetching equipment:', error);
  } else {
    equipmentList.value = data;
  }
};

const validateForm = () => {
  let valid = true;
  errors.value = {
    name: '',
    type: '',
    execution: '',
    rest: '',
    link: ''
  };

  if (!form.value.name) {
    errors.value.name = 'Exercise name is required';
    valid = false;
  }
  if (!form.value.type) {
    errors.value.type = 'Exercise type is required';
    valid = false;
  }
  if (selectedEquipment.value.length === 0) {
    errors.value.equipment_id = 'At least one equipment is required';
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
      execution: form.value.execution,
      rest: form.value.rest,
      link: form.value.link,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while updating the exercise. Please try again.", "error");
  } else {
    // Update the exercise_equipment table
    const { error: deleteError } = await supabase
      .from('exercise_equipment')
      .delete()
      .eq('exercise_id', id);

    if (deleteError) {
      console.error('Error:', deleteError);
      swal("Error", "An error occurred while updating the equipment. Please try again.", "error");
    } else {
      const exerciseEquipmentRecords = selectedEquipment.value.map(equipmentId => ({
        exercise_id: id,
        equipment_id: equipmentId
      }));

      const { error: insertError } = await supabase
        .from('exercise_equipment')
        .insert(exerciseEquipmentRecords);

      if (insertError) {
        console.error('Error:', insertError);
        swal("Error", "An error occurred while linking the equipment. Please try again.", "error");
      } else {
        swal("Success", "Exercise updated successfully!", "success");
        router.push('/application/exercises');
      }
    }
  }
};

onMounted(() => {
  fetchExercise();
  fetchEquipment();
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
            <select
              v-model="form.type"
              class="border border-gray-400 p-2 w-full rounded-lg"
              name="type"
              id="type"
              required
            >
              <option value="" disabled>Select Exercise Type</option>
              <option value="Abs Workout">Abs Workout</option>
              <option value="Shoulders Workout">Shoulders Workout</option>
              <option value="Arms Workout">Arms Workout</option>
              <option value="Legs Workout">Legs Workout</option>
              <option value="Back Workout">Back Workout</option>
              <option value="Chest Workout">Chest Workout</option>
              <option value="Cardio Workout">Cardio Workout</option>
            </select>
            <span class="text-red-500 text-sm">{{ errors.type }}</span>
          </div>

          <div class="mb-6">
            <label class="block mb-2 uppercase font-bold text-xs text-gray-700" for="equipment">
              Exercise Equipment
            </label>
            <input
              type="text"
              class="border border-gray-400 p-2 w-full rounded-lg"
              name="equipment"
              id="equipment"
              readonly
              @click="showModal = true"
              :value="selectedEquipment.map(id => equipmentList.find(e => e.id === id)?.name).filter(Boolean).join(', ')"
            />
            <span class="text-red-500 text-sm">{{ errors.equipment_id }}</span>
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

    <!-- Equipment Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 class="text-2xl font-bold mb-4">Select Equipment</h2>
        <ul class="max-h-60 overflow-y-auto">
          <li v-for="equipment in equipmentList" :key="equipment.id" class="flex items-center mb-2">
            <input 
              type="checkbox" 
              :id="`equipment-${equipment.id}`" 
              v-model="selectedEquipment" 
              :value="equipment.id" 
              class="mr-2"
            />
            <label :for="`equipment-${equipment.id}`" class="text-gray-700">{{ equipment.name }}</label>
          </li>
        </ul>
        <div class="flex justify-end mt-4">
          <button @click="showModal = false" class="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-blue-400 transition-all duration-200">
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 600px;
}
</style>