<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'vue-router';

const apiKey = 'be3c7db77b8e4535986e7e694e2d88a2';
const query = ref('');
const mealType = ref(''); // Add a ref for the meal type
const recipes = ref([]);
const loading = ref(false); // Add loading state
const router = useRouter();

const searchRecipes = async () => {
  loading.value = true; // Set loading to true when search starts
  try {
    const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
      params: {
        apiKey,
        query: query.value,
        type: mealType.value, // Include meal type in the search parameters
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
        };
      })
    );

    recipes.value = detailedRecipes;

    // Save the relevant data to the database
    await saveRecipesToDatabase(detailedRecipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
  } finally {
    loading.value = false; // Set loading to false when search completes
  }
};

const saveRecipesToDatabase = async (recipes) => {
  try {
    const meals = recipes.map(recipe => {
      const nutrients = recipe.nutrition.nutrients.reduce((acc, nutrient) => {
        acc[nutrient.name.toLowerCase()] = nutrient.amount;
        return acc;
      }, {});

      return {
        title: recipe.title,
        summary: recipe.summary,
        calories: nutrients.calories || 0,
        fat: nutrients.fat || 0,
        carbohydrates: nutrients.carbohydrates || 0,
        sugar: nutrients.sugar || 0,
        cholesterol: nutrients.cholesterol || 0,
        protein: nutrients.protein || 0,
        potassium: nutrients.potassium || 0,
        fiber: nutrients.fiber || 0,
        mealtype: mealType.value // Include meal type
      };
    });

    const { error } = await supabase
      .from('meals')
      .insert(meals);

    if (error) {
      console.error('Error saving meals to database:', error);
    } else {
      console.log('Meals saved to database successfully');
    }
  } catch (error) {
    console.error('Error saving recipes to database:', error);
  }
};

const suggestFoodsBasedOnBMI = async () => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, weight, height');

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    for (const user of users) {
      const bmi = user.weight / ((user.height / 100) ** 2);
      let suggestion = '';

      if (bmi < 18.5) {
        suggestion = 'Focus on energy-dense foods like nuts, seeds, avocados, whole-grain bread, dairy, and lean proteins to promote healthy weight gain while avoiding empty-calorie junk foods.';
      } else if (bmi >= 18.5 && bmi <= 24.9) {
        suggestion = 'Maintain a balanced diet rich in whole grains, fruits, vegetables, lean proteins, and healthy fats to sustain good health and energy levels.';
      } else if (bmi >= 25 && bmi <= 29.9) {
        suggestion = 'Prioritize high-fiber, low-calorie foods such as leafy greens, whole grains, legumes, lean proteins, and fruits with moderate glycemic indices to help manage weight while staying nourished.';
      } else if (bmi >= 30) {
        suggestion = 'Emphasize vegetables, high-quality proteins like fish or tofu, low-fat dairy, and whole grains while limiting processed foods, sugary snacks, and refined carbs to support weight loss efforts.';
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ auto_food_suggestion: suggestion })
        .eq('id', user.id)
        .select();

      if (updateError) {
        console.error(`Error updating user ${user.id}:`, updateError);
      }
    }

    swal("Success", "Food suggestions based on BMI have been updated for all users.", "success");
  } catch (error) {
    console.error('Error suggesting foods based on BMI:', error);
  }
};

const goToSavedMeals = () => {
  router.push('/application/nutrition/saved-meals');
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
          <label class="block text-gray-700 text-sm font-bold mb-2" for="meal-type">Meal Type</label>
          <select v-model="mealType" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="meal-type">
            <option value="">Select Meal Type</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>
        <div>
          <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Search
          </button>
        </div>
      </form>
    </div>

    <div class="mt-6">
      <button @click="suggestFoodsBasedOnBMI" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
        Auto Suggest Foods for Users Based on Their BMI
      </button>
    </div>

    <div class="mt-6">
      <button @click="goToSavedMeals" class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
        Saved Meals
      </button>
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