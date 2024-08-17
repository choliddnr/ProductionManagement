<script setup lang="ts">
import { Category, ModalConfirm } from "#components";
import type { ItemCategory as ItemCategoryType } from "~/schemas/item.schema";

const toast = useToast();
const slideover = useSlideover();
const { $deleteData } = useNuxtApp();
const { fetch: updateCategories } = useItemCategoriesStore();

const settings = [
  {
    label: "Kategori",
    description: "desc",
    icon: "i-heroicons-arrow-down-tray",
    content: "lorem lorem",
    slot: "category",
  },
  {
    label: "Lainnya",
    description: "desc",
    icon: "i-heroicons-arrow-down-tray",
    content: "Under development",
  },
];
const { item_categories } = storeToRefs(useItemCategoriesStore());
const deleteCategory = async (category: ItemCategoryType & { id: string }) => {
  slideover.open(ModalConfirm, {
    message: `Semua data terkait akan dihapus secara permanen dan tidak dapat dipulihkan. \nApakah anda yakin mau menghapus kategory ${category.title}`,
    label: {
      continue: "Hapus",
      cancel: "Batal",
    },
    onContinue: async () => {
      try {
        await $fetch("/api/item_categories", {
          method: "DELETE",
          query: { id: category.id },
          onResponse: async () => {
            await $deleteData("item_categories", category.id);
            await updateCategories();
            toast.add({
              title: "Success",
              description: "Kategory berhasil dihapus",
            });
          },
        });
        slideover.close();
      } catch (error) {}
    },
    onCancel: () => {},
  });
};
</script>

<template>
  <UDashboardPanelContent class="pb-24">
    <UAccordion :items="settings" :ui="{ wrapper: 'flex flex-col w-full' }">
      <template #default="{ item, index, open }">
        <UButton
          color="gray"
          :ui="{
            rounded: 'rounded-none',
            padding: { sm: 'p-3 pl-0' },
            block: 'items-start justify-start',
            inline: 'flex items-start',
          }"
          class="border-b border-gray-200 dark:border-gray-700 hover:dark:bg-gray-900"
          variant="ghost"
        >
          <div class="flex flex-col items-start">
            <span
              class="truncate text-gray-900 dark:text-white font-semibold text-base"
              >{{ item.label }}</span
            >
            <span class="mt-1 text-gray-500 dark:text-gray-400">{{
              item.description
            }}</span>
          </div>
          <template #trailing>
            <UIcon
              name="i-heroicons-chevron-right-20-solid"
              class="w-5 h-5 ms-auto transition-transform duration-200 mt-2.5"
              :class="[open && 'rorate-90']"
            />
          </template>
        </UButton>
      </template>
      <template #category>
        <div class="ml-3" v-for="category in item_categories">
          <UDashboardSection
            :title="category.title"
            :description="category.description"
            class="mt-4"
          >
            <template #links>
              <UButton
                variant="outline"
                :color="category.color"
                class="p-2 mr-3"
                :ui="{ rounded: 'rounded-full' }"
                @click="
                  () => {
                    slideover.open(Category, {
                      id: category.id,
                      onClose: () => slideover.close(),
                    });
                  }
                "
              >
                <UIcon
                  name="i-heroicons-cog-6-tooth"
                  class="text-xl"
                  size="md"
                />
              </UButton>
              <UButton
                variant="outline"
                color="red"
                class="p-2 mr-3"
                :ui="{ rounded: 'rounded-full' }"
                @click="deleteCategory(category)"
              >
                <UIcon name="i-heroicons-trash" class="text-xl" size="md" />
              </UButton>

              <!-- <ColorPicker /> -->
            </template>
          </UDashboardSection>
          <UDivider />
        </div>
        <UButton
          label="New Category"
          color="primary"
          variant="outline"
          class="ml-3 mt-3"
          @click="
            () => {
              slideover.open(Category, {
                onClose: () => slideover.close(),
              });
            }
          "
        >
          <template #trailing>
            <UIcon name="i-heroicons-plus-small" class="w-5 h-5" />
          </template>
        </UButton>
      </template>
    </UAccordion>
  </UDashboardPanelContent>
</template>
