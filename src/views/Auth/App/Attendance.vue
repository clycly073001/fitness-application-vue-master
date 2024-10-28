<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import { useRoute } from 'vue-router';
import { QrcodeStream } from 'vue-qrcode-reader';

const user = ref(null);
const attendanceRecords = ref([]);
const showCamera = ref(false);
const route = useRoute();

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

const recordAttendance = async (type) => {
  const userId = user.value.id;
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
    } else {
      alert('Time in recorded successfully');
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
      } else {
        alert('Time out recorded successfully');
      }
    } else {
      alert('No time in record found for today');
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

onMounted(() => {
  fetchAttendanceRecords();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <h1 class="text-3xl font-bold mb-4">Attendance</h1>
    <button @click="toggleCamera" class="bg-blue-500 text-white px-4 py-2 rounded-lg mb-4">
      Scan QR Code
    </button>
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
.container {
  max-width: 1200px;
}
.grid {
  display: grid;
  gap: 1.5rem;
}
</style>