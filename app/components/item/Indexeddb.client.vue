<script setup lang="ts">
import { type Item, itemCategories } from "../../../schemas/item.schema";
import { useItemStore } from "~/stores/item";

const { items, onFetching } = storeToRefs(useItemStore());
const { $addItem, $getItem, $getItemsByCategory } = useNuxtApp();
watch(items, async () => {
  if (items.value) {
    const item = await $getItem();
    if (item.length === 0) {
      await $addItem(items.value);
    }
  }
});
const filteredItems = ref();
const filterByCategory = async (cat: string[]) => {
  filteredItems.value = await $getItemsByCategory(cat);
};
</script>

<template>
  <h1>IndexedDB Page clinet</h1>
  <div>
    <UButton
      @click="filterByCategory(['final product', 'semi-finished'])"
      variant="outline"
      size="sm"
    >
      getItemsByCategory
    </UButton>
  </div>
  <pre>{{ filteredItems }}</pre>
</template>
