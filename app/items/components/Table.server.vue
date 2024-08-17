<script setup lang="ts">
import { type Item, itemCategories } from "~/schemas/item.schema";
const defaultColumns = [
  {
    key: "title",
    label: "Title",
  },
  {
    key: "stock",
    label: "Stock",
  },
  {
    key: "forecast",
    label: "Forecast",
  },
  {
    key: "category",
    label: "Category",
    sortable: true,
  },
  {
    key: "actions",
    label: "#",
  },
];
// const columns = computed(() =>
//   defaultColumns.filter((column) => selectedColumns.value.includes(column))
// );
const q = ref("");
const selected = ref<Item[]>([]);
const selectedColumns = ref(defaultColumns);
const selectedCategories = ref([]);
const sort = ref({ column: "forecast", direction: "asc" as const });
const input = ref<{ input: HTMLInputElement }>();
</script>

<template>
  <!-- v-model="selected"
    v-model:sort="sort" -->
  <UTable
    v-model="selected"
    v-model:sort="sort"
    :rows="[]"
    :columns="defaultColumns"
    :loading="true"
    sort-mode="manual"
    class="w-full"
    :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"
  >
    <!-- @select="onSelect" -->
    <template #title-data="{ row }">
      <div class="flex items-center gap-3">
        <span class="text-gray-900 dark:text-white font-medium">{{
          row.title
        }}</span>
      </div>
    </template>
    <template #forecast-data="{ row }">
      <div class="flex items-center gap-3">
        <span class="text-gray-900 dark:text-white"
          >{{ row.forecast }} {{ row.unit }}</span
        >
      </div>
    </template>
    <template #stock-data="{ row }">
      <div class="flex items-center gap-3">
        <span class="text-gray-900 dark:text-white"
          >{{ row.stock }} {{ row.unit }}</span
        >
      </div>
    </template>

    <template #category-data="{ row }">
      <UBadge
        :label="row.category_info.title"
        :color="row.category_info.color"
        variant="subtle"
        class="capitalize"
      />
    </template>
    <template #actions-data="{ row }">
      <div class="flex gap-2">
        <div class="flex-none">
          <UButton
            size="2xs"
            color="primary"
            icon="i-heroicons-pencil-square"
          />
        </div>
        <div class="flex-none">
          <UButton size="2xs" color="red" icon="i-heroicons-trash" />
        </div>
      </div>
    </template>
  </UTable>
</template>
