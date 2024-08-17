<script lang="ts" setup>
import { Form } from "#components";
import type { Item } from "~/schemas/item.schema";

const { item_categories } = storeToRefs(useItemCategoriesStore());
const { items } = storeToRefs(useItemsStore());
const { selectedCategories, search } = storeToRefs(useItemsTableStore());
const searchItem = ref<string>();
const searchDebounch = useDebounceFn(
  () => {
    search.value = searchItem.value;
  },
  1500,
  { maxWait: 5000 }
);
const isOpen = ref<boolean>(false);
const slideover = useSlideover();
const item = ref<Item>();
const openAddForm = () => {
  console.log("open form");

  slideover.open(Form, {
    onClose: slideover.close,
  });
};

const { $getData, $clearStore } = useNuxtApp();

const test = async () => {
  await $clearStore("items");
  console.log("calling", await $getData("items"));

  // await $fetch("/api/items/test", { method: "PATCH" });
};
</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Total Items" :badge="items ? items.length : 0">
        <template #right>
          <!-- ref="searchItem" -->
          <UInput
            v-model="searchItem"
            @keyup="searchDebounch"
            icon="i-heroicons-funnel"
            autocomplete="off"
            placeholder="Filter items..."
            class="hidden lg:block"
            @keydown.esc="$event.target.blur()"
          >
            <template #trailing>
              <UKbd value="/" />
            </template>
          </UInput>

          <UButton
            label="New Item"
            trailing-icon="i-heroicons-plus"
            color="gray"
            @click="openAddForm"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <USelectMenu
            v-model="selectedCategories"
            icon="i-heroicons-document-text"
            placeholder="Categories"
            :options="item_categories"
            optionAttribute="title"
            valueAttribute="id"
            multiple
          />
        </template>
      </UDashboardToolbar>

      <Table />
    </UDashboardPanel>
  </UDashboardPage>
</template>
