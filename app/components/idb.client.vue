<script setup lang="ts">
// const { $getItem } = useNuxtApp();
const { items } = storeToRefs(useItemStore());
</script>

<template>
  <pre>{{ items }}</pre>
</template>
