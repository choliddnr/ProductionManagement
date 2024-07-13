<script lang="ts" setup>
import type { FormSubmitEvent } from "#ui/types";
import { ItemConfirm } from "#components";

import { type output as zodOutput } from "zod";
import {
  AddItemSchema,
  EditItemSchema,
  type Item,
} from "~~/schemas/item.schema";

const props = defineProps<{
  id?: string;
}>();

const emits = defineEmits<{
  close: [];
}>();
const isEdit = !props.id ? false : true;

const { $addData, $editData } = useNuxtApp();
const { item_categories } = storeToRefs(useItemCategoriesStore());
const { fetch: updateItems } = useItemsStore();

const modal = useModal();
const toast = useToast();

const Schema = !isEdit ? AddItemSchema : EditItemSchema;
type FormSchema = zodOutput<typeof Schema>;
const state = reactive<Partial<Item>>({
  title: undefined,
  description: undefined,
  barcode: undefined,
  category: undefined,
  unit: undefined,
  updated: undefined,
});
const { data: item } = await useFetch<Item>("/api/items", {
  method: "GET",
  query: {
    id: props.id,
  },
});
if (isEdit) {
  state.title = item.value.title;
  state.description = item.value.description;
  state.updated = item.value.updated;
  // console.log("state", state);
}

const createMessage =
  "Category, Unit, dan Barcode bersifat permanen dan tidak dapat dirubah. Apakah data yang anda masukan sudah benar?";
const updateMessage = "Apakah anda yakin data yang anda masukan sudah benar?";
const continueLabel = "Iya, Simpan";
const cancelLabel = "Tinjau kembali";

const onSubmit = async (event: FormSubmitEvent<FormSchema>) => {
  modal.open(ItemConfirm, {
    message: isEdit ? updateMessage : createMessage,
    label: { continue: continueLabel, cancel: cancelLabel },
    onContinue: async () => {
      modal.close();
      await $fetch("/api/items", {
        method: isEdit ? "PATCH" : "POST",
        params: isEdit ? { id: item.value.id } : {},
        body: isEdit
          ? {
              title: state.title,
              description: state.description,
              updated: state.updated,
            }
          : state,
        onResponse: async ({ response }) => {
          // console.log("response", response.status, response.statusText);
          if (response.status === 404) {
            toast.add({
              icon: "i-heroicons-exclamation-triangle",
              color: "red",
              title: "Gagal",
              description: response.statusText,
            });
          } else {
            try {
              isEdit
                ? await $editData("items", response._data)
                : await $addData("items", response._data);
              await updateItems();
            } catch (error) {
              toast.add({
                title: "Peringatan",
                description:
                  "Item baru berhasil ditambahkan tapi gagal memperbaharui local database anda. Local database anda mungkin tidak uptodate. Silahkan di sinkronisasi secara manual.",
              });
            }
          }
        },
      });
      emits("close");
      toast.add({
        title: "Success",
        description: isEdit
          ? "Item berhasil diperbarui"
          : "Item baru berhasil ditambahkan",
      });
    },
    onCancel: () => modal.close(),
  });
};
</script>

<template>
  <USlideover prevent-close>
    <UCard
      class="flex flex-col flex-1"
      :ui="{
        body: { base: 'flex-1' },
        ring: '',
        divide: 'divide-y divide-gray-100 dark:divide-gray-800',
      }"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <h3
            class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
          >
            {{ isEdit ? "Edit Item " + item.title : "Item Baru" }}
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            class="-my-1"
            @click="emits('close')"
          />
        </div>
      </template>

      <!-- <Placeholder class="h-full" /> -->
      <UForm :schema="Schema" :state="state" class="space-y-4">
        <UFormGroup label="Title" name="title">
          <UInput v-model="state.title" />
        </UFormGroup>
        <UFormGroup label="Description" name="description">
          <UTextarea v-model="state.description" />
        </UFormGroup>
        <div v-if="!isEdit">
          <UDivider
            label="Permanen: tidak dapat dirubah setelah disimpan!"
            :ui="{ label: 'text-red-500' }"
            size="sm"
          />
          <UFormGroup label="Barcode" name="barcode">
            <UInput v-model="state.barcode" type="number" />
          </UFormGroup>
          <UFormGroup label="Category" name="category">
            <USelectMenu
              v-model="state.category"
              :options="item_categories"
              option-attribute="title"
              value-attribute="id"
              icon="i-heroicons-document-text"
              placeholder="Categories"
            />
          </UFormGroup>
          <UFormGroup label="Unit" name="unit">
            <UInput v-model="state.unit" />
          </UFormGroup>
        </div>
        <UButton @click="onSubmit">Submit</UButton>
      </UForm>
    </UCard>
  </USlideover>
</template>
