<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/lib/supabaseClient';

const user = ref(null);
const attendanceRecords = ref([]);

const fetchAttendanceRecords = async () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    user.value = JSON.parse(storedUser);
  }

  if (user.value) {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', user.value.id);

    if (error) {
      console.error('Error fetching attendance records:', error);
    } else {
      attendanceRecords.value = data;
    }
  }
};

onMounted(() => {
  fetchAttendanceRecords();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <h1 class="text-3xl font-bold mb-4">Attendance</h1>
    <div v-if="attendanceRecords.length">
      <ul class="space-y-4">
        <li v-for="record in attendanceRecords" :key="record.id" class="bg-white p-4 rounded-lg shadow-md">
          <p><strong>Date:</strong> {{ record.date }}</p>
          <p><strong>Time In:</strong> {{ new Date(record.time_in).toLocaleString() }}</p>
          <p><strong>Time Out:</strong> {{ record.time_out ? new Date(record.time_out).toLocaleString() : 'N/A' }}</p>
        </li>
      </ul>
    </div>
    <div v-else>
      <p class="text-center text-lg text-gray-500">No attendance records found.</p>
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