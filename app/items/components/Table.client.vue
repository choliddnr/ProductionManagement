<script setup lang="ts">
import { type Item, itemCategories } from "~~/schemas/item.schema";
import { LazyForm, LazyConfirm, LazyStock, LazyIngredients } from "#components";

const { itemsTable, selectedCategories, sort, onWorkingItem } = storeToRefs(
  useItemsTableStore()
);

const deleteMessage = "Apakah anda yakin akan menghapus data ini?";
const continueDeleteLabel = "Proses";
const cancelDeleteLabel = "Batal";

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

const selected = ref<Item[]>([]);
const selectedColumns = ref(defaultColumns);
const input = ref<{ input: HTMLInputElement }>();

const columns = computed(() =>
  defaultColumns.filter((column) => selectedColumns.value.includes(column))
);

function onSelect(row: Item) {
  const index = selected.value.findIndex((item) => item.id === row.id);
  if (index === -1) {
    selected.value.push(row);
  } else {
    selected.value.splice(index, 1);
  }
}

defineShortcuts({
  "/": () => {
    input.value?.input?.focus();
  },
});

const slideover = useSlideover();
const modal = useModal();
const toast = useToast();

const { $deleteData } = useNuxtApp();

const { fetch: updateItems } = useItemsStore();

const onDelete = async (id: string, lastUpdate: Date) => {
  await $fetch("/api/items", {
    method: "DELETE",
    params: { id: id },
    body: { updated: lastUpdate },
    onResponse: async () => {
      await $deleteData("items", id as string);
      await updateItems();
      toast.add({
        title: "Success",
        description: "Item berhasil dihapus.",
      });
    },
  });
};

// onMounted(() => {
//   watch(selectedCategories, () => {
//     console.log("categories on compo", selectedCategories);
//   });
//   watch(sort, () => {
//     console.log("sort", sort.value);
//   });
// });
</script>

<template>
  <UTable
    v-model="selected"
    v-model:sort="sort"
    :rows="itemsTable"
    :columns="columns"
    :loading="!itemsTable"
    sort-mode="manual"
    class="w-full"
    :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"
    @select="onSelect"
  >
    <template #title-data="{ row }">
      <div class="flex items-center gap-3">
        <span class="text-gray-900 dark:text-white font-medium">{{
          row.title
        }}</span>
        <UButton
          v-if="row.ingredients != null"
          variant="ghost"
          class="p-0"
          :ui="{ rounded: 'rounded-full' }"
          @click="
            slideover.open(LazyIngredients, {
              productId: row.id,
              onClose: () => {
                slideover.close();
              },
            })
          "
        >
          <UIcon
            name="i-heroicons-information-circle"
            class="w-5 h-5"
            color="blue"
          />
        </UButton>
      </div>
    </template>
    <template #forecast-data="{ row }">
      <div class="flex items-center gap-3">
        <UBadge
          :label="parseFloat(row.forecast).toFixed(2)"
          variant="soft"
          :color="parseFloat(row.forecast) <= 5 ? 'red' : 'primary'"
          size="xs"
        />
        <span class="text-gray-900 dark:text-white font-bold">
          {{ row.unit }}</span
        >
      </div>
    </template>
    <template #stock-data="{ row }">
      <div class="flex items-center gap-3">
        <UButton
          size="2xs"
          variant="ghost"
          icon="i-heroicons-arrow-path"
          @click="
            () => {
              slideover.open(LazyStock, {
                id: row.id,
                onClose: () => {
                  slideover.close();
                },
              });
            }
          "
        />
        <UBadge
          :label="parseFloat(row.stock).toFixed(2)"
          variant="soft"
          :color="parseFloat(row.stock) <= 5 ? 'red' : 'primary'"
          size="xs"
        />
        <span class="text-gray-900 dark:text-white font-bold">
          {{ row.unit }}</span
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
            @click="
              () => {
                onWorkingItem = row;
                slideover.open(LazyForm, {
                  id: row.id,
                  onClose: () => {
                    slideover.close();
                  },
                });
              }
            "
          />
        </div>
        <div class="flex-none">
          <UButton
            size="2xs"
            color="red"
            icon="i-heroicons-trash"
            @click="
              () => {
                onWorkingItem = row;
                modal.open(LazyConfirm, {
                  message: deleteMessage,
                  label: {
                    continue: continueDeleteLabel,
                    cancel: cancelDeleteLabel,
                  },
                  onContinue: async () => {
                    await onDelete(row.id, row.updated);
                    modal.close();
                  },
                  onCancel: () => {
                    modal.close();
                    console.log('cancel');
                  },
                });
              }
            "
          />
        </div>
      </div>
    </template>
  </UTable>
</template>
