<script setup>
import { ref } from 'vue';
import axios from 'axios';

const appId = 'bb8816fa';
const appKey = 'bf8cafae26b20ea99ff088bde54bd215';
const query = ref('');
const foods = ref([]);
const loading = ref(false);

const searchFoods = async () => {
  loading.value = true;
  try {
    const response = await axios.get('https://api.edamam.com/api/food-database/v2/parser', {
      params: {
        app_id: appId,
        app_key: appKey,
        ingr: query.value,
      },
    });

    const detailedFoods = await Promise.all(
      response.data.hints.map(async (hint) => {
        const food = hint.food;
        const nutrientsResponse = await axios.post('https://api.edamam.com/api/food-database/v2/nutrients', {
          ingredients: [{ quantity: 1, measureURI: "http://www.edamam.com/ontologies/edamam.owl#Measure_unit", foodId: food.foodId }]
        }, {
          params: {
            app_id: appId,
            app_key: appKey
          },
          headers: {
            'Content-Type': 'application/json'
          }
        });

        return {
          ...food,
          nutrients: nutrientsResponse.data.totalNutrients,
        };
      })
    );

    foods.value = detailedFoods;
  } catch (error) {
    console.error('Error fetching foods:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <h1 class="text-3xl font-bold mb-4">Nutrition</h1>
    <p>Search for foods according to your liking.</p>

    <div class="mt-6">
      <form @submit.prevent="searchFoods" class="space-y-4">
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
      <h2 class="text-2xl font-bold mb-4">Foods</h2>
      <div v-if="loading" class="flex justify-center items-center">
        <div class="loader"></div>
      </div>
      <div v-else-if="foods.length">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="food in foods" :key="food.foodId" class="bg-white p-4 rounded-lg shadow-md">
            <h3 class="text-xl font-semibold text-gray-800">{{ food.label }}</h3>
            <img :src="food.image" :alt="food.label" class="w-full h-40 object-cover rounded-lg mt-2">
            <p class="mt-2 text-gray-600"><strong>Known As:</strong> {{ food.knownAs }}</p>
            <p class="mt-2 text-gray-600"><strong>Brand:</strong> {{ food.brand }}</p>
            <p class="mt-2 text-gray-600"><strong>Category:</strong> {{ food.category }}</p>
            <p class="mt-2 text-gray-600"><strong>Category Label:</strong> {{ food.categoryLabel }}</p>
            <p class="mt-2 text-gray-600"><strong>Food Contents Label:</strong> {{ food.foodContentsLabel }}</p>
            <div class="mt-4">
              <h4 class="text-lg font-semibold text-gray-800">Nutrients</h4>
              <ul class="list-disc list-inside">
                <li v-for="(value, key) in food.nutrients" :key="key">{{ key }}: {{ value.quantity }}{{ value.unit }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <p class="text-center text-lg text-gray-500">No foods found.</p>
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