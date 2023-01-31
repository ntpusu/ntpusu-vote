<template>
  <div>
    <h1>Index Page</h1>
    <p>My first Nuxt.js app</p>
  </div>
</template>

<script setup>
const { data: candidate, error, pending, refresh } = await useFetch('/api/candidate')
</script>