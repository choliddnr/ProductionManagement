<script setup lang="ts">
import {
  LazyModalConfirm,
  LazyProductionForm,
  LazyProductionIngredients,
} from "#components";

// import { type Item, itemCategories } from "~/schemas/item.schema";
// import { LazyForm, LazyModalConfirm, LazyStock } from "#components";

// const { itemsTable, selectedCategories, sort, onWorkingItem } = storeToRefs(
//   useItemsTableStore()
// );
const modal = useModal();
const toast = useToast();
const slideover = useSlideover();

const deleteMessage = "Apakah anda yakin akan menghapus data ini?";
const continueDeleteLabel = "Proses";
const cancelDeleteLabel = "Batal";

const { selfProduced, sort } = storeToRefs(useSelfProducedStore());
const { selfProducedProduct } = storeToRefs(useIngredientsStore());

/**
 * Define table columns
 */

const columns = [
  {
    key: "item_title",
    label: "Product",
    sortable: true,
  },
  {
    key: "description",
    label: "Description",
  },
  {
    key: "actions",
    label: "#",
  },
];

// const selected = ref<Item[]>([]);
// const selectedColumns = ref(defaultColumns);
// const input = ref<{ input: HTMLInputElement }>();

// function onSelect(row: Item) {
//   const index = selected.value.findIndex((item) => item.id === row.id);
//   if (index === -1) {
//     selected.value.push(row);
//   } else {
//     selected.value.splice(index, 1);
//   }
// }

// defineShortcuts({
//   "/": () => {
//     input.value?.input?.focus();
//   },
// });

// const slideover = useSlideover();
// const { $deleteData } = useNuxtApp();

// const { fetch: updateItems } = useItemsStore();

const onDelete = async (id: string) => {
  await $fetch("/api/production/self_produced", {
    method: "DELETE",
    params: { id: id },
    onResponse: async () => {
      selfProduced.value = selfProduced.value.filter((sp) => sp.id != id);
      toast.add({
        title: "Success",
        description: "Item berhasil dihapus.",
      });
    },
  });
};
</script>

<template>
  <UTable
    v-model:sort="sort"
    :rows="selfProduced"
    :columns="columns"
    :loading="!selfProduced"
    sort-mode="manual"
    class="w-full"
    :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"
  >
    <template #actions-data="{ row }">
      <div class="flex gap-2">
        <div class="flex-none">
          <UButton
            size="2xs"
            color="green"
            icon="i-heroicons-clipboard-document-list-solid"
            @click="
              () => {
                selfProducedProduct = row.item;
                slideover.open(LazyProductionIngredients, {
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
            color="primary"
            icon="i-heroicons-pencil-square"
            @click="
              () => {
                slideover.open(LazyProductionForm, {
                  update: { id: row.id, title: row.item_title },
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
                modal.open(LazyModalConfirm, {
                  message: deleteMessage,
                  label: {
                    continue: continueDeleteLabel,
                    cancel: cancelDeleteLabel,
                  },
                  onContinue: async () => {
                    await onDelete(row.id);
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
