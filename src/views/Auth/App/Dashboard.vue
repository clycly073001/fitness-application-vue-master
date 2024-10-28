<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/lib/supabaseClient';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js';
import QRCode from 'qrcode';
import swal from 'sweetalert';
import { QrcodeStream } from 'vue-qrcode-reader';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

const router = useRouter();
const user = ref(null);
const totalActiveMembers = ref(0);
const newMembersLast7Days = ref(0);
const membershipsExpiringSoon = ref(0);
const averageAge = ref(0);
const totalExercises = ref(0);
const mostPopularExercises = ref([]);
const ageDistribution = ref([]);
const weightDistribution = ref([]);
const heightDistribution = ref([]);
const timeInQRCode = ref('');
const timeOutQRCode = ref('');
const showCamera = ref(false);

const calculateMembershipStatistics = async () => {
  const now = new Date();
  const last7Days = new Date();
  last7Days.setDate(now.getDate() - 7);
  const next30Days = new Date();
  next30Days.setDate(now.getDate() + 30);

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .neq('role', 'admin');

  if (error) {
    console.error('Error:', error);
    return;
  }

  totalActiveMembers.value = users.filter(user => user.membership_status).length;
  newMembersLast7Days.value = users.filter(user => new Date(user.start_of_membership) >= last7Days).length;
  membershipsExpiringSoon.value = users.filter(user => new Date(user.end_of_membership) <= next30Days).length;
  averageAge.value = (users.reduce((sum, user) => sum + user.age, 0) / users.length).toFixed(2);

  // Prepare age distribution data
  const ageGroups = users.reduce((acc, user) => {
    const ageGroup = Math.floor(user.age / 10) * 10;
    acc[ageGroup] = (acc[ageGroup] || 0) + 1;
    return acc;
  }, {});

  ageDistribution.value = Object.keys(ageGroups).map(ageGroup => ({
    ageGroup: `${ageGroup}-${Number(ageGroup) + 9}`,
    count: ageGroups[ageGroup]
  }));

  // Prepare weight distribution data
  const weightGroups = users.reduce((acc, user) => {
    const weightGroup = Math.floor(user.weight / 10) * 10;
    acc[weightGroup] = (acc[weightGroup] || 0) + 1;
    return acc;
  }, {});

  weightDistribution.value = Object.keys(weightGroups).map(weightGroup => ({
    weightGroup: `${weightGroup}-${Number(weightGroup) + 9}`,
    count: weightGroups[weightGroup]
  }));

  // Prepare height distribution data
  const heightGroups = users.reduce((acc, user) => {
    const heightGroup = Math.floor(user.height / 10) * 10;
    acc[heightGroup] = (acc[heightGroup] || 0) + 1;
    return acc;
  }, {});

  heightDistribution.value = Object.keys(heightGroups).map(heightGroup => ({
    heightGroup: `${heightGroup}-${Number(heightGroup) + 9}`,
    count: heightGroups[heightGroup]
  }));
};

const calculateExerciseStatistics = async () => {
  const { data: exercises, error } = await supabase
    .from('exercises')
    .select('*');

  if (error) {
    console.error('Error:', error);
    return;
  }

  totalExercises.value = exercises.length;

  const { data: exercisesUsers, error: exercisesUsersError } = await supabase
    .from('exercises_users')
    .select('exercise_id, count:count(*)')
    .order('count', { ascending: false })
    .limit(5);

  if (!exercisesUsersError) {
    mostPopularExercises.value = exercisesUsers.map(exerciseUser => {
      const exercise = exercises.find(ex => ex.id === exerciseUser.exercise_id);
      return { name: exercise.name, count: exerciseUser.count };
    });
  }
};

const generateQRCode = async (type) => {
  const url = `${window.location.origin}/attendance?type=${type}`;
  const qrCodeDataUrl = await QRCode.toDataURL(url);
  if (type === 'time_in') {
    timeInQRCode.value = qrCodeDataUrl;
  } else if (type === 'time_out') {
    timeOutQRCode.value = qrCodeDataUrl;
  }
};

const recordAttendance = async (type) => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    swal("Error", "User not found. Please log in again.", "error");
    return;
  }

  const userId = JSON.parse(storedUser).id;
  const now = new Date().toISOString();

  if (type === 'time_in') {
    const { data, error } = await supabase
      .from('attendance')
      .insert([
        { user_id: userId, time_in: now, date: new Date().toISOString().split('T')[0] },
      ])
      .select();

    if (error) {
      console.error('Error recording time in:', error);
      swal("Error", "An error occurred while recording time in. Please try again.", "error");
    } else {
      swal("Success", "Time in recorded successfully!", "success");
    }
  } else if (type === 'time_out') {
    const { data: attendanceRecords, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .is('time_out', null)
      .order('time_in', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching attendance record:', error);
      swal("Error", "An error occurred while fetching attendance record. Please try again.", "error");
      return;
    }

    if (attendanceRecords.length > 0) {
      const attendanceId = attendanceRecords[0].id;
      const { data, error } = await supabase
        .from('attendance')
        .update({ time_out: now })
        .eq('id', attendanceId)
        .select();

      if (error) {
        console.error('Error recording time out:', error);
        swal("Error", "An error occurred while recording time out. Please try again.", "error");
      } else {
        swal("Success", "Time out recorded successfully!", "success");
      }
    } else {
      swal("Error", "No time in record found for today.", "error");
    }
  }
};

const handleScan = async (result) => {
  if (!result) return;

  const url = new URL(result);
  const type = url.searchParams.get('type');
  await recordAttendance(type);

  showCamera.value = false;
};

const toggleCamera = () => {
  showCamera.value = !showCamera.value;
};

onMounted(async () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    user.value = JSON.parse(storedUser);
  }

  await calculateMembershipStatistics();
  await calculateExerciseStatistics();
  await generateQRCode('time_in');
  await generateQRCode('time_out');
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="flex justify-between">
      <h1 class="text-4xl font-bold mb-4 text-gray-800">Dashboard</h1>
      <div class="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 mb-10">
        <h2 class="text-xl font-bold mb-2 text-blue-600">Quick Actions</h2>
        <button @click="navigateTo('CreateExercise')" class="bg-blue-500 text-white px-4 py-2 rounded-lg mr-2 transition-colors duration-300 hover:bg-blue-600">Add New Exercise</button>
        <button @click="navigateTo('CreateUser')" class="bg-green-500 text-white px-4 py-2 rounded-lg mr-2 transition-colors duration-300 hover:bg-green-600">Add New Member</button>
        <button @click="navigateTo('Exercises')" class="bg-purple-500 text-white px-4 py-2 rounded-lg mb-2 transition-colors duration-300 hover:bg-purple-600">Assign Exercises</button>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-if="user" class="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
        <h2 class="text-xl font-bold mb-2 text-blue-600">User Information</h2>
        <p><strong>Name:</strong> {{ user.name }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Role:</strong> {{ user.role }}</p>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
        <h2 class="text-xl font-bold mb-2 text-blue-600">Membership Overview</h2>
        <p><strong>Total Active Members:</strong> {{ totalActiveMembers }}</p>
        <p><strong>New Members (Last 7 Days):</strong> {{ newMembersLast7Days }}</p>
        <p><strong>Memberships Expiring Soon:</strong> {{ membershipsExpiringSoon }}</p>
        <p><strong>Average Age of Members:</strong> {{ averageAge }}</p>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
        <h2 class="text-xl font-bold mb-2 text-blue-600">Exercise Overview</h2>
        <p><strong>Total Exercises:</strong> {{ totalExercises }}</p>
        <p><strong>Most Popular Exercises:</strong></p>
        <ul class="list-disc list-inside">
          <li v-for="exercise in mostPopularExercises" :key="exercise.name">{{ exercise.name }} ({{ exercise.count }} assignments)</li>
        </ul>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
        <h2 class="text-xl font-bold mb-2 text-blue-600">Attendance</h2>
        <div class="flex flex-col items-center">
          <div>
            <h3 class="text-lg font-semibold text-gray-800">Time In</h3>
            <img :src="timeInQRCode" alt="Time In QR Code" class="w-40 h-40 mt-2">
          </div>
          <div class="mt-4">
            <h3 class="text-lg font-semibold text-gray-800">Time Out</h3>
            <img :src="timeOutQRCode" alt="Time Out QR Code" class="w-40 h-40 mt-2">
          </div>
        </div>
        <button @click="toggleCamera" class="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4">
          Scan QR Code
        </button>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
        <h2 class="text-xl font-bold mb-2 text-blue-600">Members Age Distribution</h2>
        <div class="chart-container">
          <Line
            :data="{
              labels: ageDistribution.map(item => item.ageGroup),
              datasets: [{
                label: 'Number of Members',
                backgroundColor: 'rgba(66, 165, 245, 0.2)',
                borderColor: '#42A5F5',
                data: ageDistribution.map(item => item.count),
                fill: true
              }]
            }"
            :options="{
              responsive: true,
              maintainAspectRatio: true
            }"
          />
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
        <h2 class="text-xl font-bold mb-2 text-blue-600">Members Weight Distribution</h2>
        <div class="chart-container">
          <Line
            :data="{
              labels: weightDistribution.map(item => item.weightGroup),
              datasets: [{
                label: 'Number of Members',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: '#FF6384',
                data: weightDistribution.map(item => item.count),
                fill: true
              }]
            }"
            :options="{
              responsive: true,
              maintainAspectRatio: true
            }"
          />
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
        <h2 class="text-xl font-bold mb-2 text-blue-600">Members Height Distribution</h2>
        <div class="chart-container">
          <Line
            :data="{
              labels: heightDistribution.map(item => item.heightGroup),
              datasets: [{
                label: 'Number of Members',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: '#4BC0C0',
                data: heightDistribution.map(item => item.count),
                fill: true
              }]
            }"
            :options="{
              responsive: true,
              maintainAspectRatio: true
            }"
          />
        </div>
      </div>
    </div>

    <div v-if="showCamera" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 class="text-2xl font-bold mb-4">Scan QR Code</h2>
        <QrcodeStream @decode="handleScan" />
        <button @click="toggleCamera" class="mt-4 bg-gray-500 text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-gray-400 transition-all duration-200">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any additional styles here if needed */
button {
  margin-bottom: 0.5rem;
}

.chart-container {
  width: 100%;
  max-width: 400px;
  height: 300px;
  margin: 0 auto;
}
</style>