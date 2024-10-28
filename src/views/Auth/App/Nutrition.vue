<script setup>
import { ref } from 'vue';
import axios from 'axios';

const apiKey = '11b14482eaa440f8847a3eb904175ce7';
const query = ref('');
const diet = ref('');
const type = ref('');
const minCarbs = ref('');
const maxCarbs = ref('');
const minProtein = ref('');
const maxProtein = ref('');
const minCalories = ref('');
const maxCalories = ref('');
const minFat = ref('');
const maxFat = ref('');
const recipes = ref([]);

const searchRecipes = async () => {
  try {
    const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
      params: {
        apiKey,
        query: query.value,
        diet: diet.value,
        type: type.value,
        minCarbs: minCarbs.value,
        maxCarbs: maxCarbs.value,
        minProtein: minProtein.value,
        maxProtein: maxProtein.value,
        minCalories: minCalories.value,
        maxCalories: maxCalories.value,
        minFat: minFat.value,
        maxFat: maxFat.value,
      },
    });
    recipes.value = response.data.results;
  } catch (error) {
    console.error('Error fetching recipes:', error);
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <h1 class="text-3xl font-bold mb-4">Nutrition</h1>
    <p>Track your nutrition here.</p>

    <div class="mt-6">
      <form @submit.prevent="searchRecipes" class="space-y-4">
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2" for="query">Query</label>
          <input v-model="query" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="query" type="text" placeholder="e.g., chicken">
        </div>
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2" for="diet">Diet</label>
          <input v-model="diet" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="diet" type="text" placeholder="e.g., vegetarian">
        </div>
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2" for="type">Type</label>
          <input v-model="type" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="type" type="text" placeholder="e.g., main course">
        </div>
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2" for="minCarbs">Min Carbs</label>
          <input v-model="minCarbs" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="minCarbs" type="number" placeholder="e.g., 10">
        </div>
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2" for="maxCarbs">Max Carbs</label>
          <input v-model="maxCarbs" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="maxCarbs" type="number" placeholder="e.g., 50">
        </div>
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2" for="minProtein">Min Protein</label>
          <input v-model="minProtein" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="minProtein" type="number" placeholder="e.g., 10">
        </div>
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2" for="maxProtein">Max Protein</label>
          <input v-model="maxProtein" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="maxProtein" type="number" placeholder="e.g., 50">
        </div>
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2" for="minCalories">Min Calories</label>
          <input v-model="minCalories" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="minCalories" type="number" placeholder="e.g., 100">
        </div>
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2" for="maxCalories">Max Calories</label>
          <input v-model="maxCalories" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="maxCalories" type="number" placeholder="e.g., 500">
        </div>
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2" for="minFat">Min Fat</label>
          <input v-model="minFat" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="minFat" type="number" placeholder="e.g., 5">
        </div>
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2" for="maxFat">Max Fat</label>
          <input v-model="maxFat" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="maxFat" type="number" placeholder="e.g., 20">
        </div>
        <div>
          <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Search
          </button>
        </div>
      </form>
    </div>

    <div class="mt-8">
      <h2 class="text-2xl font-bold mb-4">Recipes</h2>
      <div v-if="recipes.length">
        <ul class="space-y-4">
          <li v-for="recipe in recipes" :key="recipe.id" class="bg-white p-4 rounded-lg shadow-md">
            <h3 class="text-xl font-semibold text-gray-800">{{ recipe.title }}</h3>
            <img :src="recipe.image" :alt="recipe.title" class="w-full h-auto rounded-lg mt-2">
          </li>
        </ul>
      </div>
      <div v-else>
        <p class="text-center text-lg text-gray-500">No recipes found.</p>
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