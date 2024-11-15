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
import AttendanceRecord from '@/views/Auth/App/AttendanceRecord.vue';
import Equipment from '@/views/Auth/App/Equipment.vue';
import Equipment_Create from '@/views/Auth/App/Equipment_Add.vue';
import Equipment_Edit from '@/views/Auth/App/Equipment_Edit.vue';
import Meals from '@/views/Auth/App/Meals.vue';
import Meals_Show from '@/views/Auth/App/Meals_Show.vue';

const routes = [
  {
    path: '/',
    name: 'landing-page',
    component: LandingPage,
    meta: { requiresUnauth: true, title: 'Fiber Muscle - Home' }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { requiresUnauth: true, title: 'Fiber Muscle - Login' }
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { requiresUnauth: true, title: 'Fiber Muscle - Register' }
  },
  {
    path: '/application',
    component: AuthenticatedLayout,
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: 'Fiber Muscle - Dashboard' }
      },
      {
        path: 'dashboard/time_in/:id',
        name: 'TimeIn',
        component: Dashboard,
        meta: { title: 'Fiber Muscle - Time In' },
        beforeEnter: (to, from, next) => {
          const recordAttendance = async () => {
            const userId = to.params.id;
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
        path: 'dashboard/time_out/:id',
        name: 'TimeOut',
        component: Dashboard,
        meta: { title: 'Fiber Muscle - Time Out' },
        beforeEnter: (to, from, next) => {
          const recordAttendance = async () => {
            const userId = to.params.id;
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
        component: Exercises,
        meta: { title: 'Fiber Muscle - Exercises' }
      },
      {
        path: 'nutrition',
        name: 'Nutrition',
        component: Nutrition,
        meta: { title: 'Fiber Muscle - Nutrition' }
      },
      {
        path: 'nutrition/saved-meals',
        name: 'SavedMeals',
        component: Meals,
        meta: { title: 'Fiber Muscle - Saved Meals' }
      },
      {
        path: 'nutrition/saved-meals/:id',
        name: 'SavedMeals_Show',
        component: Meals_Show,
        meta: { title: 'Fiber Muscle - Meal Details' }
      },
      {
        path: 'shop',
        name: 'Shop',
        component: Shop,
        meta: { title: 'Fiber Muscle - Shop' }
      },
      {
        path: 'users',
        name: 'Users',
        component: Users,
        meta: { title: 'Fiber Muscle - Users' }
      },
      {
        path: 'exercises/create',
        name: 'Exercises_Create',
        component: Exercises_Create,
        meta: { title: 'Fiber Muscle - Create Exercise' }
      },
      {
        path: 'exercises/:id',
        name: 'Exercises_Show',
        component: Exercises_Show,
        meta: { title: 'Fiber Muscle - Exercise Details' }
      },
      {
        path: 'exercises/:id/edit',
        name: 'Exercises_Edit',
        component: Exercises_Edit,
        meta: { title: 'Fiber Muscle - Edit Exercise' }
      },
      {
        path: 'users/:id',
        name: 'Users_Show',
        component: Users_Show,
        meta: { title: 'Fiber Muscle - User Details' }
      },
      {
        path: 'users/create',
        name: 'Users_Create',
        component: Users_Create,
        meta: { title: 'Fiber Muscle - Create User' }
      },
      {
        path: 'users//edit/:id',
        name: 'Users_Edit',
        component: Users_Edit,
        meta: { title: 'Fiber Muscle - Edit User' }
      },
      {
        path: 'shop/create',
        name: 'Create_Item',
        component: Create_Item,
        meta: { title: 'Fiber Muscle - Create Item' }
      },
      {
        path: 'shop/:id',
        name: 'Shop_Item_Show',
        component: Shop_Item_Show,
        meta: { title: 'Fiber Muscle - Item Details' }
      },
      {
        path: 'shop//edit/:id',
        name: 'Edit_Item',
        component: Edit_Item,
        meta: { title: 'Fiber Muscle - Edit Item' }
      },
      {
        path: 'your-attendance-record',
        name: 'Attendance',
        component: Attendance,
        meta: { title: 'Fiber Muscle - Attendance' }
      },
      {
        path: 'attendance-sheet',
        name: 'AttendanceSheet',
        component: AttendanceRecord,
        meta: { title: 'Fiber Muscle - Attendance Records' }
      },
      {
        path: 'equipment',
        name: 'Equipment',
        component: Equipment,
        meta: { title: 'Fiber Muscle - Equipment' }
      },      
      {
        path: 'equipment/add',
        name: 'Equipment-Create',
        component: Equipment_Create,
        meta: { title: 'Fiber Muscle - Add Equipment' }
      },
      {
        path: 'equipment/edit/:id',
        name: 'Equipment-Edit',
        component: Equipment_Edit,
        meta: { title: 'Fiber Muscle - Edit Equipment' }
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: Dashboard,
        meta: { title: 'Fiber Muscle - Dashboard' }
      },
    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Fiber Muscle';
  next();
});

export default router;