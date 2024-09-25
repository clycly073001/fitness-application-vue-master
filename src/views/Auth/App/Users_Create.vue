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
const endOfMembership = ref(''); // Add end_of_membership field
const router = useRouter();

const createUser = async () => {
  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(password.value, 10);

  // Calculate end_of_membership as now() + 1 month
  const endOfMembershipDate = new Date();
  endOfMembershipDate.setMonth(endOfMembershipDate.getMonth() + 1);
  endOfMembership.value = endOfMembershipDate.toISOString().slice(0, 16); // Set the value for display

  // Get the current date and time for created_at and updated_at
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('users')
    .insert([
      { 
        name: name.value, 
        email: email.value, 
        password: hashedPassword, 
        role: 'user', 
        age: age.value, 
        goals: goals.value, 
        weight: weight.value, 
        height: height.value,
        end_of_membership: endOfMembershipDate.toISOString(), // Save end_of_membership
        created_at: now, // Add created_at timestamp
        updated_at: now // Add updated_at timestamp
      }
    ]);

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while creating the user. Please try again.", "error");
  } else {
    swal("Success", "User created successfully!", "success");
    router.push('/application/users');
  }
};

// Initialize end_of_membership when the component is created
const initializeEndOfMembership = () => {
  const endOfMembershipDate = new Date();
  endOfMembershipDate.setMonth(endOfMembershipDate.getMonth() + 1);
  endOfMembership.value = endOfMembershipDate.toISOString().slice(0, 16); // Set the value for display
};

initializeEndOfMembership();
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
    <div class="max-w-xl w-full bg-white p-10 shadow-xl rounded-lg mt-6">
      <h1 class="text-4xl font-semibold mb-6 text-center text-gray-800">Add Member</h1>
      <form @submit.prevent="createUser" class="space-y-6">
        
        <!-- Name -->
        <div>
          <label class="block text-gray-600 text-sm font-medium mb-1" for="name">Name</label>
          <input 
            v-model="name" 
            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            id="name" 
            type="text" 
            placeholder="John Doe" 
            required>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-gray-600 text-sm font-medium mb-1" for="email">Email</label>
          <input 
            v-model="email" 
            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            id="email" 
            type="email" 
            placeholder="johndoe@email.com" 
            required>
        </div>

        <!-- Password -->
        <div>
          <label class="block text-gray-600 text-sm font-medium mb-1" for="password">Password</label>
          <input 
            v-model="password" 
            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            id="password" 
            type="password" 
            placeholder="********" 
            required>
        </div>

        <!-- Age -->
        <div>
          <label class="block text-gray-600 text-sm font-medium mb-1" for="age">Age</label>
          <input 
            v-model="age" 
            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            id="age" 
            type="number" 
            placeholder="30" 
            required>
        </div>

        <!-- Goals -->
        <div>
          <label class="block text-gray-600 text-sm font-medium mb-1" for="goals">Goals</label>
          <input 
            v-model="goals" 
            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            id="goals" 
            type="text" 
            placeholder="Fitness Goals" 
            required>
        </div>

        <!-- Weight -->
        <div>
          <label class="block text-gray-600 text-sm font-medium mb-1" for="weight">Weight (kg)</label>
          <input 
            v-model="weight" 
            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            id="weight" 
            type="number" 
            placeholder="70" 
            required>
        </div>

        <!-- Height -->
        <div>
          <label class="block text-gray-600 text-sm font-medium mb-1" for="height">Height (cm)</label>
          <input 
            v-model="height" 
            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            id="height" 
            type="number" 
            placeholder="170" 
            required>
        </div>

        <!-- End of Membership -->
        <div>
          <label class="block text-gray-600 text-sm font-medium mb-1" for="end_of_membership">End of Membership</label>
          <input 
            v-model="endOfMembership" 
            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            id="end_of_membership" 
            type="datetime-local" 
            readonly>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-center">
          <button 
            class="bg-blue-600 text-white font-semibold py-3 px-6 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-400 transition duration-200"
            type="submit">
            Create Member
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

  body {
    font-family: 'Inter', sans-serif;
  }

  input {
    transition: all 0.2s ease-in-out;
  }

  input:focus {
    transform: translateY(-2px);
  }
</style>