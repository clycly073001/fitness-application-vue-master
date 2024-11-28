<script setup>
import { ref, onMounted, watch } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import * as XLSX from 'xlsx';
import swal from 'sweetalert';

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

const deleteAttendanceRecord = async (recordId) => {
  const { error } = await supabase
    .from('attendance')
    .delete()
    .eq('id', recordId);

  if (error) {
    console.error('Error deleting attendance record:', error);
  } else {
    attendance.value = attendance.value.filter(record => record.id !== recordId);
  }
};

const confirmDelete = (recordId) => {
  swal({
    title: "Are you sure?",
    text: "Once deleted, you will not be able to recover this attendance record!",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
  .then((willDelete) => {
    if (willDelete) {
      deleteAttendanceRecord(recordId);
      swal("Poof! Your attendance record has been deleted!", {
        icon: "success",
      });
    } else {
      swal("Your attendance record is safe!");
    }
  });
};

const exportToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(attendance.value.map(record => ({
    ID: record.id,
    'User Name': record.users?.name || 'N/A',
    'Time In': new Date(record.time_in).toLocaleString(),
    'Time Out': record.time_out ? new Date(record.time_out).toLocaleString() : 'N/A'
  })));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Records');
  XLSX.writeFile(workbook, 'AttendanceRecords.xlsx');
};

const updateUserLoginData = async () => {
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id');

    if (usersError) {
      throw usersError;
    }

    for (const user of users) {
      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance')
        .select('time_in')
        .eq('user_id', user.id)
        .order('time_in', { ascending: false });

      if (attendanceError) {
        throw attendanceError;
      }

      if (attendance.length > 0) {
        const lastLoginDate = attendance[0].time_in;
        const loginStreak = attendance.length;

        const { error: updateError } = await supabase
          .from('users')
          .update({ last_login_date: lastLoginDate, login_streak: loginStreak })
          .eq('id', user.id);

        if (updateError) {
          throw updateError;
        }
      }
    }

    swal("Success", "User login data updated successfully!", "success");
  } catch (error) {
    console.error('Error updating user login data:', error);
    swal("Error", "An error occurred while updating user login data. Please try again.", "error");
  }
};

watch(searchDate, (newDate) => {
  currentPage.value = 1;
  fetchAttendance(1, newDate);
});

const videoAttendance = ref([]);
const videoAttendanceType = ref('Time In');
const videoAttendancePage = ref(1);
const videoItemsPerPage = 5;

const fetchVideoAttendance = async (page = 1, type = 'Time In') => {
  const start = (page - 1) * videoItemsPerPage;
  const end = start + videoItemsPerPage - 1;

  let queryBuilder;
  if (type === 'Time In') {
    queryBuilder = supabase
      .from('time_in_attendance_video')
      .select('id, created_at, user_id, video_link, users (name)')
      .range(start, end);
  } else {
    queryBuilder = supabase
      .from('time_out_attendance_video')
      .select('id, created_at, user_id, video_link, users (name)')
      .range(start, end);
  }

  let { data, error } = await queryBuilder;

  if (error) {
    console.error(`Error fetching ${type.toLowerCase()} attendance video:`, error);
  } else {
    videoAttendance.value = data;
  }
};

const nextVideoPage = () => {
  videoAttendancePage.value++;
  fetchVideoAttendance(videoAttendancePage.value, videoAttendanceType.value);
};

const prevVideoPage = () => {
  if (videoAttendancePage.value > 1) {
    videoAttendancePage.value--;
    fetchVideoAttendance(videoAttendancePage.value, videoAttendanceType.value);
  }
};

watch(videoAttendanceType, (newType) => {
  videoAttendancePage.value = 1;
  fetchVideoAttendance(1, newType);
});

onMounted(() => {
  fetchAttendance();
  fetchVideoAttendance();
});

onMounted(() => {
  fetchAttendance();
});
</script><template>
  <div class="min-h-screen bg-gray-100 p-8">
    <h1 class="text-3xl font-bold mb-4 text-gray-800">Attendance Records</h1>
    <div class="mb-4 flex space-x-4">
      <input
        v-model="searchDate"
        type="date"
        placeholder="Search by Date"
        class="w-full p-2 border rounded-lg"
      />
      <button @click="exportToExcel" class="bg-green-500 text-white px-4 py-2 rounded-lg">
        Save as Spreadsheet
      </button>
      <button @click="updateUserLoginData" class="bg-blue-500 text-white px-4 py-2 rounded-lg">
        Update User Login Data
      </button>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white text-center">
        <thead>
          <tr>
            <th class="py-2 px-4 border-b">ID</th>
            <th class="py-2 px-4 border-b">User Name</th>
            <th class="py-2 px-4 border-b">Time In</th>
            <th class="py-2 px-4 border-b">Time Out</th>
            <th class="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="attendance.length === 0">
            <td colspan="5" class="py-2 px-4 border-b">No result</td>
          </tr>
          <tr v-else v-for="record in attendance" :key="record.id">
            <td class="py-2 px-4 border-b">{{ record.id }}</td>
            <td class="py-2 px-4 border-b">{{ record.users?.name || 'N/A' }}</td>
            <td class="py-2 px-4 border-b">{{ new Date(record.time_in).toLocaleString() }}</td>
            <td class="py-2 px-4 border-b">{{ record.time_out ? new Date(record.time_out).toLocaleString() : 'N/A' }}</td>
            <td class="py-2 px-4 border-b">
              <button @click="confirmDelete(record.id)" class="px-4 py-2 rounded-lg hover:bg-red-100"><img src="/public/item_images/delete (1).png" alt=""></button>
            </td>
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

    <h2 class="text-2xl font-bold mt-8 mb-4">Online Attendance With Videos</h2>
    <div class="mb-4 flex space-x-4">
      <select v-model="videoAttendanceType" class="w-full p-2 border rounded-lg">
        <option value="Time In">Time In</option>
        <option value="Time Out">Time Out</option>
      </select>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white text-center">
        <thead>
          <tr>
            <th class="py-2 px-4 border-b">ID</th>
            <th class="py-2 px-4 border-b">Date and Time</th>
            <th class="py-2 px-4 border-b">User Name</th>
            <th class="py-2 px-4 border-b">Video Link</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="videoAttendance.length === 0">
            <td colspan="4" class="py-2 px-4 border-b">No result</td>
          </tr>
          <tr v-else v-for="record in videoAttendance" :key="record.id">
            <td class="py-2 px-4 border-b">{{ record.id }}</td>
            <td class="py-2 px-4 border-b">{{ new Date(record.created_at).toLocaleString() }}</td>
            <td class="py-2 px-4 border-b">{{ record.users?.name || 'N/A' }}</td>
            <td class="py-2 px-4 border-b"><a :href="record.video_link" target="_blank" class="text-blue-600 hover:underline">View Video</a></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex justify-between mt-4">
      <button @click="prevVideoPage" :disabled="videoAttendancePage === 1" class="bg-gray-500 text-white px-4 py-2 rounded-lg">
        Previous
      </button>
      <button @click="nextVideoPage" class="bg-gray-500 text-white px-4 py-2 rounded-lg">
        Next
      </button>
    </div>
  </div>
</template>