<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '@/lib/supabaseClient';
import swal from 'sweetalert';

const route = useRoute();
const exercise = ref(null);

const fetchExercise = async () => {
  const { id } = route.params;
  let { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error:', error);
    swal("Error", "An error occurred while fetching the exercise. Please try again.", "error");
  } else {
    exercise.value = data;
  }
};

onMounted(() => {
  fetchExercise();
});

const limit = (string, length) => {
  return string.length > length ? string.substring(0, length) + '...' : string;
};

const getYouTubeEmbedUrl = (url) => {
  const videoId = url.split('v=')[1] || url.split('/shorts/')[1];
  const ampersandPosition = videoId.indexOf('&');
  if (ampersandPosition !== -1) {
    return `https://www.youtube.com/embed/${videoId.substring(0, ampersandPosition)}`;
  }
  return `https://www.youtube.com/embed/${videoId}`;
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div v-if="exercise" class="max-w-2xl mx-auto bg-white p-8 shadow-lg rounded-lg transition-transform transform hover:scale-105">
      <h1 class="text-4xl font-extrabold text-gray-800 mb-4">{{ exercise.name }}</h1>
      <div class="space-y-4">
        <p class="text-lg text-gray-700"><strong>Type:</strong> <span class="text-gray-500">{{ exercise.type }}</span></p>
        <p class="text-lg text-gray-700"><strong>Equipment:</strong> <span class="text-gray-500">{{ exercise.equipment }}</span></p>
        <p class="text-lg text-gray-700"><strong>Execution:</strong> <span class="text-gray-500" v-html="exercise.execution"></span></p>
        <p class="text-lg text-gray-700"><strong>Rest:</strong> <span class="text-gray-500">{{ exercise.rest }} seconds</span></p>
        <p class="text-lg text-gray-700"><strong>Link:</strong> <span class="text-gray-500"><a :href="exercise.link" target="_blank">{{ exercise.link }}</a></span></p>
        <div v-if="exercise.link && (exercise.link.includes('youtube.com') || exercise.link.includes('youtu.be') || exercise.link.includes('shorts'))">
          <iframe :src="getYouTubeEmbedUrl(exercise.link)" frameborder="0" allowfullscreen class="w-full h-60"></iframe>
        </div>
        <p class="text-lg text-gray-700"><strong>Created At:</strong> <span class="text-gray-500">{{ formatDate(exercise.created_at) }}</span></p>
        <p class="text-lg text-gray-700"><strong>Updated At:</strong> <span class="text-gray-500">{{ formatDate(exercise.updated_at) }}</span></p>
      </div>
      <router-link to="/application/exercises" class="mt-6 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-500 transition duration-200">
        Back to Exercises
      </router-link>
    </div>
    <div v-else class="flex justify-center items-center h-full min-h-screen">
      <p class="text-center text-gray-500 text-lg">Loading...</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      exercise: null, // Assuming exercise data is fetched here
    };
  },
  methods: {
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

body {
  font-family: 'Roboto', sans-serif;
}

h1 {
  border-bottom: 2px solid #3b82f6; /* Add a bottom border to the title */
  padding-bottom: 10px; /* Space below the title */
}

strong {
  color: #1f2937; /* Color for strong text */
}

.text-gray-500 {
  font-weight: 500; /* Slightly bolder text for sub-details */
}

.bg-blue-600 {
  background-color: #3b82f6; /* Consistent blue color for buttons */
}
</style>