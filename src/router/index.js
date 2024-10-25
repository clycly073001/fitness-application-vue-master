// src/router/index.js
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
        path: 'users',
        name: 'Users',
        component: Users
      },
      {
        path: 'users/create',
        name: 'CreateUser',
        component: Users_Create
      },
      {
        path: 'users/:id',
        name: 'ShowUser',
        component: Users_Show
      },
      {
        path: 'users/edit/:id',
        name: 'EditUser',
        component: Users_Edit // Add route for editing a user
      },
      {
        path: 'exercises',
        name: 'Exercises',
        component: Exercises
      },
      {
        path: 'exercises/create',
        name: 'CreateExercise',
        component: Exercises_Create
      },
      {
        path: 'exercises/:id',
        name: 'ShowExercise',
        component: Exercises_Show
      },
      {
        path: 'exercises/edit/:id',
        name: 'EditExercise',
        component: Exercises_Edit
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
        path: 'shop/create',
        name: 'CreateItem', 
        component: Create_Item
      },
      {
        path: 'shop/:id',
        name: 'ShowItem',
        component: Shop_Item_Show
      },
      {
        path: 'shop/edit/:id',
        name: 'EditItem',
        component: Edit_Item
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: Dashboard
      },
    ],
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach((to, from, next) => {
  const user = localStorage.getItem('user');
  if (to.matched.some(record => record.meta.requiresAuth) && !user) {
    next({ name: 'login' });
  } else if (to.matched.some(record => record.meta.requiresUnauth) && user) {
    next({ name: 'NotFound' });
  } else {
    next();
  }
});

export default router;