<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/lib/supabaseClient';
import swal from 'sweetalert';
import bcrypt from 'bcryptjs';

const router = useRouter();

let data = ref({
  email: '',
  password: ''
});

onMounted(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    router.push('/application/dashboard');
  }
});

const login = async () => {
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', data.value.email);

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while logging in. Please try again.", "error");
    return;
  }

  if (users.length === 0) {
    swal("Error", "Invalid email or password.", "error");
    return;
  }

  const user = users[0];
  const passwordMatch = await bcrypt.compare(data.value.password, user.password);

  if (passwordMatch) {
    if (user.role === 'admin') {
      swal("Logged In", "Logged in successfully!", "success");
      // Save user session
      localStorage.setItem('user', JSON.stringify(user));
      // Redirect to /application
      router.push('/application/dashboard');
    } else {
      swal("Error", "You do not have the necessary permissions to log in.", "error");
    }
  } else {
    swal("Error", "Invalid email or password.", "error");
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
    <img src="@/assets/muscle.png" alt="Fiber Muscle Logo" class="mb-4 w-10 h-10" />
    <h1 class="text-3xl font-bold mb-4">Login to Fiber Muscle</h1>
    <form class="w-full max-w-sm border border-gray-300 shadow-lg rounded-lg p-6 bg-white" @submit.prevent="login">
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="email">Email</label>
        <input 
        v-model="data.email"
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="email" type="email" placeholder="Email">
      </div>
      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="password">Password</label>
        <input 
        v-model="data.password"
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="Password">
      </div>
      <div class="flex items-center justify-between">
        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
          Sign In
        </button>
      </div>
    </form>
    <p class="mt-4">
      Don't have an account? 
      <router-link to="/register" class="text-blue-500 hover:underline">Create Account</router-link>
    </p>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

body {
  font-family: 'Roboto', sans-serif;
}
</style>