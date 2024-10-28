<script setup>
import { ref } from 'vue';
import axios from 'axios';

const apiKey = 'be3c7db77b8e4535986e7e694e2d88a2';
const query = ref('');
const recipes = ref([]);
const loading = ref(false); // Add loading state

const searchRecipes = async () => {
  loading.value = true; // Set loading to true when search starts
  try {
    const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
      params: {
        apiKey,
        query: query.value,
        addRecipeInformation: true,
        addRecipeNutrition: true,
      },
    });

    const detailedRecipes = await Promise.all(
      response.data.results.map(async (recipe) => {
        const [nutritionResponse, tasteResponse] = await Promise.all([
          axios.get(`https://api.spoonacular.com/recipes/${recipe.id}/nutritionWidget.json`, {
            params: { apiKey },
          }),
          axios.get(`https://api.spoonacular.com/recipes/${recipe.id}/tasteWidget.json`, {
            params: { apiKey },
          }),
        ]);

        return {
          ...recipe,
          nutrition: nutritionResponse.data,
          taste: tasteResponse.data,
        };
      })
    );

    recipes.value = detailedRecipes;
  } catch (error) {
    console.error('Error fetching recipes:', error);
  } finally {
    loading.value = false; // Set loading to false when search completes
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <h1 class="text-3xl font-bold mb-4">Nutrition</h1>
    <p>Search for foods according to your liking.</p>

    <div class="mt-6">
      <form @submit.prevent="searchRecipes" class="space-y-4">
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2" for="query">Query</label>
          <input v-model="query" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="query" type="text" placeholder="e.g., chicken">
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
      <div v-if="loading" class="flex justify-center items-center">
        <div class="loader"></div>
      </div>
      <div v-else-if="recipes.length">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="recipe in recipes" :key="recipe.id" class="bg-white p-4 rounded-lg shadow-md">
            <h3 class="text-xl font-semibold text-gray-800">{{ recipe.title }}</h3>
            <img :src="recipe.image" :alt="recipe.title" class="w-full h-40 object-cover rounded-lg mt-2">
            <p class="mt-2 text-gray-600" v-html="recipe.summary"></p>
            <div class="mt-4">
              <h4 class="text-lg font-semibold text-gray-800">Nutrition</h4>
              <ul class="list-disc list-inside">
                <li v-for="nutrient in recipe.nutrition.nutrients" :key="nutrient.name">{{ nutrient.name }}: {{ nutrient.amount }}{{ nutrient.unit }} ({{ nutrient.percentOfDailyNeeds }}% DV)</li>
              </ul>
            </div>
            <div class="mt-4">
              <h4 class="text-lg font-semibold text-gray-800">Taste</h4>
              <ul class="list-disc list-inside">
                <li>Sweetness: {{ recipe.taste.sweetness }}</li>
                <li>Saltiness: {{ recipe.taste.saltiness }}</li>
                <li>Sourness: {{ recipe.taste.sourness }}</li>
                <li>Bitterness: {{ recipe.taste.bitterness }}</li>
                <li>Savoriness: {{ recipe.taste.savoriness }}</li>
                <li>Fattiness: {{ recipe.taste.fattiness }}</li>
                <li>Spiciness: {{ recipe.taste.spiciness }}</li>
              </ul>
            </div>
          </div>
        </div>
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
.loader {
  width: 50px;
  height: 50px;
  display: flex;
  color: #514b82;
  background:
    linear-gradient(currentColor 0 0) right  /51% 100%,
    linear-gradient(currentColor 0 0) bottom /100% 51%;
  background-repeat: no-repeat;
  animation: l17-0 2s infinite linear .25s;
}
.loader::before{
  content:"";
  width: 50%;
  height: 50%;
  background: currentColor;
  transform-origin: 10% 10%;
  animation: l17-1 .5s infinite linear;
}
@keyframes l17-0 {
  0%   ,12.49% {transform: rotate(0deg)}
  12.5%,37.49% {transform: rotate(90deg)}
  37.5%,62.49% {transform: rotate(180deg)}
  62.5%,87.49% {transform: rotate(270deg)}
  87.5%,100%   {transform: rotate(360deg)}
}
@keyframes l17-1 {
  0%      {transform: perspective(80px) rotate3d(-1,1,0, 0)}
  80%,100%{transform: perspective(80px) rotate3d(-1,1,0,-360deg)}
}
</style>