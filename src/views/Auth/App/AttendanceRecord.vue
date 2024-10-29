<script setup>
import { ref, onMounted, watch } from 'vue';
import { supabase } from '@/lib/supabaseClient';

const attendance = ref([]);
const currentPage = ref(1);
const itemsPerPage = 10;
const totalItems = ref(0);
const searchDate = ref('');

const fetchAttendance = async (page = 1, dateQuery = '') => {
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage - 1;

  let queryBuilder = supabase
    .from('attendance')
    .select('id, time_in, user_id, time_out, users (name)', { count: 'exact' })
    .range(start, end);

  if (dateQuery) {
    queryBuilder = queryBuilder.gte('time_in', `${dateQuery}T00:00:00`).lt('time_in', `${dateQuery}T23:59:59`);
  }

  let { data, error, count } = await queryBuilder;

  if (error) {
    console.error('Error fetching attendance:', error);
  } else {
    attendance.value = data;
    totalItems.value = count;
  }
};

const nextPage = () => {
  if (currentPage.value * itemsPerPage < totalItems.value) {
    currentPage.value++;
    fetchAttendance(currentPage.value, searchDate.value);
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchAttendance(currentPage.value, searchDate.value);
  }
};

watch(searchDate, (newDate) => {
  currentPage.value = 1;
  fetchAttendance(1, newDate);
});

onMounted(() => {
  fetchAttendance();
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <h1 class="text-3xl font-bold mb-4 text-gray-800">Attendance Records</h1>
    <div class="mb-4">
      <input
        v-model="searchDate"
        type="date"
        placeholder="Search by Date"
        class="w-full p-2 border rounded-lg"
      />
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white text-center">
        <thead>
          <tr>
            <th class="py-2 px-4 border-b">ID</th>
            <th class="py-2 px-4 border-b">User Name</th>
            <th class="py-2 px-4 border-b">Time In</th>
            <th class="py-2 px-4 border-b">Time Out</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="attendance.length === 0">
            <td colspan="4" class="py-2 px-4 border-b">No result</td>
          </tr>
          <tr v-else v-for="record in attendance" :key="record.id">
            <td class="py-2 px-4 border-b">{{ record.id }}</td>
            <td class="py-2 px-4 border-b">{{ record.users?.name || 'N/A' }}</td>
            <td class="py-2 px-4 border-b">{{ new Date(record.time_in).toLocaleString() }}</td>
            <td class="py-2 px-4 border-b">{{ record.time_out ? new Date(record.time_out).toLocaleString() : 'N/A' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex justify-between mt-4">
      <button @click="prevPage" :disabled="currentPage === 1" class="bg-gray-500 text-white px-4 py-2 rounded-lg">
        Previous
      </button>
      <button @click="nextPage" :disabled="currentPage * itemsPerPage >= totalItems" class="bg-gray-500 text-white px-4 py-2 rounded-lg">
        Next
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Add any additional styles here if needed */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

table th, table td {
  text-align: center;
}
</style>