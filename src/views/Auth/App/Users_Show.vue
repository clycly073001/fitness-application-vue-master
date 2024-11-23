<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '@/lib/supabaseClient';
import { computed } from 'vue';
import swal from 'sweetalert';

const route = useRoute();
const router = useRouter();
const user = ref(null);
const loading = ref(true);
const showModal = ref(false);
const showSuggestModal = ref(false);
const exercises = ref([]);
const selectedExercises = ref([]);
const assignedExercises = ref([]);
const foodSuggestions = ref([]);
const foodSuggestion = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(5);

const showEditModal = ref(false);
const editFoodSuggestion = ref('');
const editFoodSuggestionId = ref(null);

const deleteFoodSuggestion = async (mealId) => {
  const { id: userId } = route.params;

  const { error } = await supabase
    .from('meals_users')
    .delete()
    .eq('user_id', userId)
    .eq('meal_id', mealId);

  if (error) {
    console.error('Error deleting food suggestion:', error);
    swal("Error", "An error occurred while deleting the food suggestion. Please try again.", "error");
  } else {
    foodSuggestions.value = foodSuggestions.value.filter(suggestion => suggestion.meal_id !== mealId);
    swal("Success", "Food suggestion deleted successfully!", "success");
  }
};

const confirmDeleteFoodSuggestion = (mealId) => {
  swal({
    title: "Are you sure?",
    text: "Once deleted, you will not be able to recover this food suggestion!",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
  .then((willDelete) => {
    if (willDelete) {
      deleteFoodSuggestion(mealId);
    } else {
      swal("Your food suggestion is safe!");
    }
  });
};

const editFoodSuggestionModal = (suggestion) => {
  editFoodSuggestionId.value = suggestion.id;
  editFoodSuggestion.value = suggestion.food_suggestion;
  showEditModal.value = true;
};

const updateFoodSuggestion = async () => {
  const { error } = await supabase
    .from('foods_for_users')
    .update({ food_suggestion: editFoodSuggestion.value })
    .eq('id', editFoodSuggestionId.value)
    .select();

  if (error) {
    console.error('Error updating food suggestion:', error);
    swal("Error", "An error occurred while updating the food suggestion. Please try again.", "error");
  } else {
    swal("Success", "Food suggestion updated successfully!", "success");
    showEditModal.value = false;
    fetchFoodSuggestions(); // Refresh the food suggestions list
  }
};

const fetchUser = async () => {
  const { id } = route.params;
  let { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while fetching the user. Please try again.", "error");
  } else {
    user.value = data;

    const now = new Date();
    const endOfMembership = new Date(user.value.end_of_membership);

    if (endOfMembership <= now && user.value.membership_status) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ membership_status: false })
        .eq('id', id);

      if (updateError) {
        console.error('Error:', updateError);
        swal("Error", "An error occurred while updating the membership status. Please try again.", "error");
      } else {
        user.value.membership_status = false;
      }
    }
  }
  loading.value = false;
};

const fetchExercises = async () => {
  let { data, error } = await supabase
    .from('exercises')
    .select('*');

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while fetching exercises. Please try again.", "error");
  } else {
    exercises.value = data;
  }
};

const fetchAssignedExercises = async (page = 1) => {
  const { id: userId } = route.params;
  const from = (page - 1) * itemsPerPage.value;
  const to = from + itemsPerPage.value - 1;

  let { data, error } = await supabase
    .from('exercises_users')
    .select('exercise_id, created_at')
    .eq('user_id', userId)
    .range(from, to);

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while fetching assigned exercises. Please try again.", "error");
  } else {
    assignedExercises.value = await Promise.all(data.map(async (assigned) => {
      const { data: exerciseDetails, error: exerciseError } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', assigned.exercise_id)
        .single();

      if (exerciseError) {
        console.error('Error:', exerciseError);
        return null;
      }

      return { ...assigned, ...exerciseDetails };
    }));
  }
};

const fetchFoodSuggestions = async (page = 1) => {
  const { id: userId } = route.params;
  const from = (page - 1) * itemsPerPage.value;
  const to = from + itemsPerPage.value - 1;

  let { data, error } = await supabase
    .from('meals_users')
    .select('meal_id, created_at')
    .eq('user_id', userId)
    .range(from, to);

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while fetching food suggestions. Please try again.", "error");
  } else {
    foodSuggestions.value = await Promise.all(data.map(async (suggested) => {
      const { data: mealDetails, error: mealError } = await supabase
        .from('meals')
        .select('*')
        .eq('id', suggested.meal_id)
        .single();

      if (mealError) {
        console.error('Error:', mealError);
        return null;
      }

      return { ...suggested, ...mealDetails };
    }));
  }
};

const assignExercises = async () => {
  const { id: userId } = route.params;
  const now = new Date().toISOString();
  const rows = selectedExercises.value.map(exerciseId => ({
    user_id: userId,
    exercise_id: exerciseId,
    created_at: now
  }));

  console.log('Rows to insert:', rows); // Debugging line

  const { error } = await supabase
    .from('exercises_users')
    .insert(rows)
    .select();

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while assigning exercises. Please try again.", "error");
  } else {
    swal("Success", "Exercises assigned successfully!", "success");
    showModal.value = false;
    selectedExercises.value = [];
    fetchAssignedExercises(currentPage.value); // Refresh the assigned exercises list
  }
};

const deleteAssignedExercise = async (exerciseId) => {
  const { id: userId } = route.params;

  const { error } = await supabase
    .from('exercises_users')
    .delete()
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId);

  if (error) {
    console.error('Error deleting assigned exercise:', error);
    swal("Error", "An error occurred while deleting the assigned exercise. Please try again.", "error");
  } else {
    assignedExercises.value = assignedExercises.value.filter(exercise => exercise.exercise_id !== exerciseId);
    swal("Success", "Assigned exercise deleted successfully!", "success");
  }
};

const confirmDelete = (exerciseId) => {
  swal({
    title: "Are you sure?",
    text: "Once deleted, you will not be able to recover this assigned exercise!",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
  .then((willDelete) => {
    if (willDelete) {
      deleteAssignedExercise(exerciseId);
    } else {
      swal("Your assigned exercise is safe!");
    }
  });
};

const meals = ref([]);
const selectedMeals = ref([]);

const fetchMeals = async () => {
  let { data, error } = await supabase
    .from('meals')
    .select('*');

  if (error) {
    console.error('Error fetching meals:', error);
    swal("Error", "An error occurred while fetching meals. Please try again.", "error");
  } else {
    meals.value = data;
  }
};

const suggestFood = async () => {
  const { id: userId } = route.params;
  const now = new Date().toISOString();
  const rows = selectedMeals.value.map(mealId => ({
    user_id: userId,
    meal_id: mealId,
    created_at: now
  }));

  const { error } = await supabase
    .from('meals_users')
    .insert(rows)
    .select();

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while suggesting foods. Please try again.", "error");
  } else {
    swal("Success", "Foods suggested successfully!", "success");
    showSuggestModal.value = false;
    selectedMeals.value = [];
    fetchFoodSuggestions(); // Refresh the food suggestions list
  }
};
const searchExerciseQuery = ref('');
const selectedExerciseType = ref('');

const filteredExercises = computed(() => {
  return exercises.value.filter(exercise => {
    const matchesQuery = exercise.name.toLowerCase().includes(searchExerciseQuery.value.toLowerCase());
    const matchesType = selectedExerciseType.value ? exercise.type === selectedExerciseType.value : true;
    return matchesQuery && matchesType;
  });
});

onMounted(() => {
  fetchUser();
  fetchExercises();
  fetchAssignedExercises();
  fetchFoodSuggestions();
  fetchMeals(); // Fetch meals for the suggest food modal
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
    <div v-if="loading" class="flex justify-center items-center mt-6">
      <div class="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
    </div>
    <div v-else-if="user" class="max-w-2xl w-full bg-white p-8 shadow-lg rounded-lg mt-6">
      <div class="text-center mb-6">
        <h1 class="text-4xl font-bold mb-2 text-gray-800">
          {{ user.name }}
        </h1>
        <p class="text-gray-600">{{ user.email }}</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-gray-100 p-4 rounded-lg shadow-inner">
          <p class="text-gray-600"><strong>Role:</strong> {{ user.role }}</p>
        </div>
        <div class="bg-gray-100 p-4 rounded-lg shadow-inner">
          <p class="text-gray-600"><strong>Age:</strong> {{ user.age }}</p>
        </div>
        <div class="bg-gray-100 p-4 rounded-lg shadow-inner">
          <p class="text-gray-600"><strong>Goal:</strong> {{ user.goals }}</p>
        </div>
        <div class="bg-gray-100 p-4 rounded-lg shadow-inner">
          <p class="text-gray-600"><strong>Weight:</strong> {{ user.weight }} kg</p>
        </div>
        <div class="bg-gray-100 p-4 rounded-lg shadow-inner">
          <p class="text-gray-600"><strong>Height:</strong> {{ user.height }} cm</p>
        </div>
        <div class="bg-gray-100 p-4 rounded-lg shadow-inner">
          <p class="text-gray-600"><strong>Start of Membership:</strong> {{ new Date(user.start_of_membership).toLocaleString() }}</p>
        </div>
        <div class="bg-gray-100 p-4 rounded-lg shadow-inner">
          <p class="text-gray-600"><strong>End of Membership:</strong> {{ new Date(user.end_of_membership).toLocaleString() }}</p>
        </div>
        <div class="bg-gray-100 p-4 rounded-lg shadow-inner">
          <p class="text-gray-600"><strong>Membership Status:</strong>
            <span 
            :class="new Date(user.end_of_membership) > new Date() ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'"
            class="px-3 py-1 rounded-full text-sm font-semibold"
          >
            {{ new Date(user.end_of_membership) > new Date() ? 'Active' : 'Expired' }}
          </span>
          </p>
        </div>
      </div>
      <div class="mt-6 text-center">
        <button @click="showModal = true" class="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-500 transition duration-200">
          Assign Exercise(s)
        </button>
        <button @click="showSuggestModal = true" class="bg-green-600 text-white px-5 py-2 rounded-lg shadow hover:bg-green-500 transition duration-200 ml-4">
          Suggest Foods
        </button>
      </div>
      <div class="mt-6">
        <h2 class="text-2xl font-bold mb-4">Assigned Exercises</h2>
        <div class="overflow-x-auto">
          <table v-if="assignedExercises.length > 0" class="min-w-full bg-white">
            <thead>
              <tr>
                <th class="py-2 px-4 border-b">Exercise Name</th>
                <th class="py-2 px-4 border-b">Type</th>
                <th class="py-2 px-4 border-b">Assigned At</th>
                <th class="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="assigned in assignedExercises" :key="assigned.exercise_id">
                <td class="py-2 px-4 border-b">
                  <router-link :to="{ name: 'Exercises_Show', params: { id: assigned.exercise_id } }" class="text-blue-600 hover:underline">
                    {{ assigned.name }}
                  </router-link>
                </td>
                <td class="py-2 px-4 border-b">{{ assigned.type }}</td>
                <td class="py-2 px-4 border-b">{{ new Date(assigned.created_at).toLocaleString() }}</td>
                <td class="py-2 px-4 border-b">
                  <button @click="confirmDelete(assigned.exercise_id)" class="bg-red-500 text-white px-4 py-2 rounded-lg">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="text-center text-gray-600">No assigned exercises</p>
        </div>
        <div v-if="assignedExercises.length > 0" class="mt-4 flex justify-center">
          <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="px-4 py-2 mx-1 bg-gray-300 rounded-lg">Previous</button>
          <button @click="changePage(currentPage + 1)" :disabled="assignedExercises.length < itemsPerPage" class="px-4 py-2 mx-1 bg-gray-300 rounded-lg">Next</button>
        </div>
      </div>
      <div class="mt-6">
  <h2 class="text-2xl font-bold mb-4">Food Suggestions</h2>
  <div class="overflow-x-auto">
    <table v-if="foodSuggestions.length > 0" class="min-w-full bg-white">
      <thead>
        <tr>
          <th class="py-2 px-4 border-b">Meal Name</th>
          <th class="py-2 px-4 border-b">Calories</th>
          <th class="py-2 px-4 border-b">Suggested At</th>
          <th class="py-2 px-4 border-b">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="suggestion in foodSuggestions" :key="suggestion.meal_id">
          <td class="py-2 px-4 border-b">
            <router-link :to="{ name: 'SavedMeals_Show', params: { id: suggestion.meal_id } }" class="text-blue-600 hover:underline">
              {{ suggestion.title }}
            </router-link>
          </td>
          <td class="py-2 px-4 border-b">{{ suggestion.calories }}</td>
          <td class="py-2 px-4 border-b">{{ new Date(suggestion.created_at).toLocaleString() }}</td>
          <td class="py-2 px-4 border-b">
            <button @click="confirmDeleteFoodSuggestion(suggestion.meal_id)" class="bg-red-500 text-white px-4 py-2 rounded-lg">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else class="text-center text-gray-600">No food suggestions</p>
  </div>
</div>
    </div>
    <div v-else class="flex justify-center items-center h-full min-h-screen">
      <p class="text-center">No user found.</p>
    </div>

 <!-- Assign Exercises Modal -->
<div v-if="showModal" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
  <div class="bg-white p-6 rounded-lg shadow-lg w-96">
    <h2 class="text-2xl font-bold mb-4">Assign Exercise(s)</h2>
    <div class="mb-4">
      <input type="text" v-model="searchExerciseQuery" placeholder="Search exercises..." class="w-full p-2 border rounded mb-2">
      <select v-model="selectedExerciseType" class="w-full p-2 border rounded">
        <option value="">All Types</option>
        <option value="Abs Workout">Abs Workout</option>
        <option value="Shoulders Workout">Shoulders Workout</option>
        <option value="Arms Workout">Arms Workout</option>
        <option value="Legs Workout">Legs Workout</option>
        <option value="Back Workout">Back Workout</option>
        <option value="Chest Workout">Chest Workout</option>
      </select>
    </div>
    <div class="max-h-60 overflow-y-auto mb-4">
      <ul>
        <li v-for="exercise in filteredExercises" :key="exercise.id" class="mb-2">
          <label class="flex items-center">
            <input type="checkbox" v-model="selectedExercises" :value="exercise.id" class="mr-2">
            {{ exercise.name }}
          </label>
        </li>
      </ul>
    </div>
    <div class="flex justify-end">
      <button @click="showModal = false" class="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-gray-600 transition duration-200">
        Cancel
      </button>
      <button @click="assignExercises" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition duration-200">
        Assign
      </button>
    </div>
  </div>
</div>

    <!-- Suggest Foods Modal -->
<!-- Suggest Foods Modal -->
<div v-if="showSuggestModal" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
  <div class="bg-white p-6 rounded-lg shadow-lg w-96">
    <h2 class="text-2xl font-bold mb-4">Suggest Food(s)</h2>
    <div class="max-h-60 overflow-y-auto mb-4">
      <ul>
        <li v-for="meal in meals" :key="meal.id" class="mb-2">
          <label class="flex items-center">
            <input type="checkbox" v-model="selectedMeals" :value="meal.id" class="mr-2">
            {{ meal.title }}
          </label>
        </li>
      </ul>
    </div>
    <div class="flex justify-end">
      <button @click="showSuggestModal = false" class="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-gray-600 transition duration-200">
        Cancel
      </button>
      <button @click="suggestFood" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition duration-200">
        Suggest
      </button>
    </div>
  </div>
</div>
<!-- Edit Food Suggestion Modal -->
<div v-if="showEditModal" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
  <div class="bg-white p-6 rounded-lg shadow-lg w-96">
    <h2 class="text-2xl font-bold mb-4">Edit Food Suggestion</h2>
    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2" for="editFoodSuggestion">Food Suggestion</label>
      <textarea v-model="editFoodSuggestion" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="editFoodSuggestion" rows="5" placeholder="Enter your food suggestion here..."></textarea>
    </div>
    <div class="flex justify-end">
      <button @click="showEditModal = false" class="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-gray-600 transition duration-200">
        Cancel
      </button>
      <button @click="updateFoodSuggestion" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition duration-200">
        Update
      </button>
    </div>
  </div>
</div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

body {
  font-family: 'Roboto', sans-serif;
}

.loader {
  border-top-color: #3498db;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>