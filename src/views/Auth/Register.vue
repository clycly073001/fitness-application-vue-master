<!-- src/views/Register.vue -->
<script setup>
import { ref } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';
import swal from 'sweetalert';
import { useRouter } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import * as yup from 'yup';

// Define validation schema
const schema = yup.object({
  name: yup.string().required('Name is required').max(255, 'Name must be at most 255 characters'),
  email: yup.string().required('Email is required').email('Email must be a valid email').max(255, 'Email must be at most 255 characters'),
  password: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters')
});

// Set up form and fields
const { handleSubmit, resetForm } = useForm({
  validationSchema: schema
});
const { value: name, errorMessage: nameError } = useField('name');
const { value: email, errorMessage: emailError } = useField('email');
const { value: password, errorMessage: passwordError } = useField('password');

const router = useRouter();

const register = handleSubmit(async (values) => {
  // Hash the password
  const hashedPassword = await bcrypt.hash(values.password, 10);

  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        name: values.name,
        email: values.email,
        password: hashedPassword,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ])
    .select();

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while registering. Please try again.", "error");
  } else {
    console.log('User registered:', data);
    // Show success alert
    swal("Success", "User registered successfully!", "success");
    // Clear form data
    resetForm();
    // Redirect to login page
    router.push('/login');
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
    <img src="@/assets/muscle.png" alt="Fiber Muscle Logo" class="mb-4 w-10 h-10" />
    <h1 class="text-3xl font-bold mb-4">Register to Fiber Muscle</h1>
    <form class="w-full max-w-sm border border-gray-300 shadow-lg rounded-lg p-6 bg-white" @submit.prevent="register">
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="name">Name</label>
        <input 
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
          v-model="name"
          id="name" 
          type="text" 
          placeholder="Name">
        <span class="text-red-500 text-sm">{{ nameError }}</span>
      </div>
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="email">Email</label>
        <input 
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
          v-model="email"
          id="email" 
          type="email" 
          placeholder="Email">
        <span class="text-red-500 text-sm">{{ emailError }}</span>
      </div>
      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="password">Password</label>
        <input 
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" 
          v-model="password"
          id="password" 
          type="password" 
          placeholder="Password">
        <span class="text-red-500 text-sm">{{ passwordError }}</span>
      </div>
      <div class="flex items-center justify-between">
        <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
          Register
        </button>
      </div>
    </form>
    <p class="mt-4">
      Already have an account? 
      <router-link to="/login" class="text-blue-500 hover:underline">Login</router-link>
    </p>
  </div>
</template>

<style scoped>
body {
  font-family: 'Arial', sans-serif;
}
</style>