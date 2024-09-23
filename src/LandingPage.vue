<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
    <header class="text-center mb-8">
      <img src="@/assets/muscle.png" alt="Fiber Muscle Logo" class="mx-auto mb-4 w-10 h-10" />
      <h1 class="text-5xl font-bold mb-4">Fiber Muscle</h1>
      <p class="text-lg text-gray-700">Your ultimate fitness companion</p>
    </header>

    <div class="mb-8">
      <RouterLink to="/login">
        <button class="bg-blue-500 text-white px-4 py-2 rounded mr-4 hover:bg-blue-700">Login</button>
      </RouterLink>
      <RouterLink to="/register">
        <button class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700">Register</button>
      </RouterLink>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl px-4">
      <div class="bg-white shadow-md rounded-lg p-6 text-center">
        <h2 class="text-xl font-semibold mb-2">Personalized Workouts</h2>
        <p class="text-gray-600">Get workout plans tailored to your fitness goals.</p>
      </div>
      <div class="bg-white shadow-md rounded-lg p-6 text-center">
        <h2 class="text-xl font-semibold mb-2">Nutrition Tracking</h2>
        <p class="text-gray-600">Track your daily nutrition and stay on top of your diet.</p>
      </div>
      <div class="bg-white shadow-md rounded-lg p-6 text-center">
        <h2 class="text-xl font-semibold mb-2">Progress Monitoring</h2>
        <p class="text-gray-600">Monitor your progress with detailed analytics and reports.</p>
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
