import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '@/LandingPage.vue';
import Login from '@/views/Auth/Login.vue';
import Register from '@/views/Auth/Register.vue';
import AuthenticatedLayout from '@/components/AuthenticatedLayout.vue';
import Dashboard from '@/views/Auth/App/Dashboard.vue';
import Exercises from '@/views/Auth/App/Exercises.vue';
import Nutrition from '@/views/Auth/App/Nutrition.vue';
import Shop from '@/views/Auth/App/Shop.vue';
import Users from '@/views/Auth/App/Users.vue';
import Exercises_Create from '@/views/Auth/App/Exercises_Create.vue';
import Exercises_Show from '@/views/Auth/App/Exercises_Show.vue';
import Exercises_Edit from '@/views/Auth/App/Exercises_Edit.vue';
import Users_Show from '@/views/Auth/App/Users_Show.vue';
import Users_Create from '@/views/Auth/App/Users_Create.vue';
import Users_Edit from '@/views/Auth/App/Users_Edit.vue'; // Import Users_Edit component
import Create_Item from '@/views/Auth/App/Create_Item.vue'; // Ensure this import is correct
import Shop_Item_Show from '@/views/Auth/App/Shop_Item_Show.vue';
import Edit_Item from '@/views/Auth/App/Edit_Item.vue';
import Attendance from '@/views/Auth/App/Attendance.vue';
import swal from 'sweetalert';
import { supabase } from '@/lib/supabaseClient';

const routes = [
  {
    path: '/',
    name: 'landing-page',
    component: LandingPage,
    meta: { requiresUnauth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { requiresUnauth: true }
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { requiresUnauth: true }
  },
  {
    path: '/application',
    component: AuthenticatedLayout,
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: 'dashboard/time_in',
        name: 'TimeIn',
        component: Dashboard,
        beforeEnter: (to, from, next) => {
          const recordAttendance = async () => {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) {
              swal("Error", "User not found. Please log in again.", "error");
              return;
            }

            const userId = JSON.parse(storedUser).id;
            const now = new Date().toISOString();

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
          };

          recordAttendance().then(() => next());
        }
      },
      {
        path: 'dashboard/time_out',
        name: 'TimeOut',
        component: Dashboard,
        beforeEnter: (to, from, next) => {
          const recordAttendance = async () => {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) {
              swal("Error", "User not found. Please log in again.", "error");
              return;
            }

            const userId = JSON.parse(storedUser).id;
            const now = new Date().toISOString();

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
          };

          recordAttendance().then(() => next());
        }
      },
      {
        path: 'exercises',
        name: 'Exercises',
        component: Exercises
      },
      {
        path: 'nutrition',
        name: 'Nutrition',
        component: Nutrition
      },
      {
        path: 'shop',
        name: 'Shop',
        component: Shop
      },
      {
        path: 'users',
        name: 'Users',
        component: Users
      },
      {
        path: 'exercises/create',
        name: 'Exercises_Create',
        component: Exercises_Create
      },
      {
        path: 'exercises/:id',
        name: 'Exercises_Show',
        component: Exercises_Show
      },
      {
        path: 'exercises/:id/edit',
        name: 'Exercises_Edit',
        component: Exercises_Edit
      },
      {
        path: 'users/:id',
        name: 'Users_Show',
        component: Users_Show
      },
      {
        path: 'users/create',
        name: 'Users_Create',
        component: Users_Create
      },
      {
        path: 'users/:id/edit',
        name: 'Users_Edit',
        component: Users_Edit
      },
      {
        path: 'shop/create',
        name: 'Create_Item',
        component: Create_Item
      },
      {
        path: 'shop/:id',
        name: 'Shop_Item_Show',
        component: Shop_Item_Show
      },
      {
        path: 'shop/:id/edit',
        name: 'Edit_Item',
        component: Edit_Item
      },
      {
        path: 'attendance',
        name: 'Attendance',
        component: Attendance
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: Dashboard
      },
    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;