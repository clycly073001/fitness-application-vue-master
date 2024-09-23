// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/LandingPage.vue'
import Login from '@/views/Auth/Login.vue'
import Register from '@/views/Auth/Register.vue'
import AuthenticatedLayout from '@/components/AuthenticatedLayout.vue'
import Dashboard from '@/views/Auth/App/Dashboard.vue'
import Exercises from '@/views/Auth/App/Exercises.vue'
import Nutrition from '@/views/Auth/App/Nutrition.vue'
import Progress from '@/views/Auth/App/Progress.vue'
import Users from '@/views/Auth/App/Users.vue'
import Exercises_Create from '@/views/Auth/App/Exercises_Create.vue'
import Exercises_Show from '@/views/Auth/App/Exercises_Show.vue'
import Exercises_Edit from '@/views/Auth/App/Exercises_Edit.vue'
import Users_Show from '@/views/Auth/App/Users_Show.vue'
import Users_Create from '@/views/Auth/App/Users_Create.vue' // Import the Users_Create component

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
        path: 'progress',
        name: 'Progress',
        component: Progress
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: Dashboard
      },
    ],
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const user = localStorage.getItem('user');
  if (to.matched.some(record => record.meta.requiresAuth) && !user) {
    next({ name: 'login' });
  } else if (to.matched.some(record => record.meta.requiresUnauth) && user) {
    next({ name: 'NotFound' });
  } else {
    next();
  }
})

export default router