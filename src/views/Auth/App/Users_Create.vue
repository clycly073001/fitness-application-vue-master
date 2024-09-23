<script setup>
import { ref } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import swal from 'sweetalert';
import { useRouter } from 'vue-router';
import bcrypt from 'bcryptjs'; // Import bcryptjs

const name = ref('');
const email = ref('');
const password = ref(''); // Add password field
const role = ref('');
const age = ref('');
const goals = ref('');
const weight = ref('');
const height = ref('');
const router = useRouter();

const createUser = async () => {
  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(password.value, 10);

  const { data, error } = await supabase
    .from('users')
    .insert([
      { name: name.value, email: email.value, password: hashedPassword, role: role.value, age: age.value, goals: goals.value, weight: weight.value, height: height.value }
    ]);

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while creating the user. Please try again.", "error");
  } else {
    swal("Success", "User created successfully!", "success");
    router.push('/application/users');
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
    <div class="max-w-2xl w-full bg-white p-8 shadow-lg rounded-lg mt-6">
      <h1 class="text-3xl font-bold mb-4 text-center">Add Member</h1>
      <form @submit.prevent="createUser">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="name">Name</label>
          <input v-model="name" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name" type="text" placeholder="Name" required>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="email">Email</label>
          <input v-model="email" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="email" type="email" placeholder="Email" required>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="password">Password</label>
          <input v-model="password" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="Password" required>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="role">Role</label>
          <input v-model="role" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="role" type="text" placeholder="Role" required>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="age">Age</label>
          <input v-model="age" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="age" type="number" placeholder="Age" required>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="goals">Goals</label>
          <input v-model="goals" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="goals" type="text" placeholder="Goals" required>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="weight">Weight (kg)</label>
          <input v-model="weight" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="weight" type="number" placeholder="Weight" required>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="height">Height (cm)</label>
          <input v-model="height" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="height" type="number" placeholder="Height" required>
        </div>
        <div class="flex justify-center">
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
            Create
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

body {
  font-family: 'Roboto', sans-serif;
}
</style>