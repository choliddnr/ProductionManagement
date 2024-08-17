<script setup lang="ts">
import { ModalConfirm } from "#components";
import { type Item, EditItemStockSchema } from "~/schemas/item.schema";

const props = defineProps<{
  id: string;
}>();
const { data: item } = await useFetch<Item>("/api/items", {
  method: "GET",
  query: {
    id: props.id,
  },
});
const stockState = reactive<{ stock: number; description: string }>({
  stock: undefined,
  description: undefined,
});
const emits = defineEmits(["close"]);
const modal = useModal();
const toast = useToast();
const { fetch: updateItems } = useItemsStore();
const { $editData } = useNuxtApp();

const syncStock = (currentStock: number) => {
  modal.open(ModalConfirm, {
    message: "Apakah anda yakin stok yang baru sudah sesuai?",
    label: {
      continue: "Iya, Simpan",
      cancel: "Tinjau Kembali",
    },
    onContinue: async () => {
      await $fetch("/api/items/stock", {
        method: "PATCH",
        params: { id: item.value.id },
        body: {
          stock: stockState.stock - currentStock,
          description: stockState.description,
          updated: item.value.updated,
        },
        onResponse: async ({ response }) => {
          await $editData("items", response._data.data);
          await updateItems();
          modal.close();
          emits("close");
          toast.add({
            title: "Success",
            description: "Stock berhasil diperbarui!",
          });
        },
      });
    },
    onCancel: () => {
      modal.close();
    },
  });
};
</script>

<template>
  <USlideover prevent-close>
    <UCard
      :ui="{
        ring: '',
        body: {
          base: 'flex-1',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        },
      }"
      class="flex flex-col flex-1"
    >
      <template #header>
        <div class="justify-between items-center flex">
          <h3
            class="text-base font-semibold leading-6 dark:text-white text-gray-900"
          >
            Perbarui Stock
          </h3>
        </div>
      </template>
      <UForm
        :schema="EditItemStockSchema"
        :state="stockState"
        class="space-y-4"
      >
        <UBadge size="md" variant="outline"
          >Stock sekarang: {{ item.stock.toFixed(2) }} {{ item.unit }}</UBadge
        >
        <UFormGroup label="Stock terbaru" name="newStock">
          <UInput v-model="stockState.stock" type="number" />
        </UFormGroup>
        <UFormGroup label="Description" name="description">
          <UTextarea v-model="stockState.description" />
        </UFormGroup>
        <UButton
          @click="syncStock(item.stock)"
          class="w-min-20 justify-center mr-3"
          >Simpan</UButton
        >
        <UButton color="red" @click="emits('close')">Batal</UButton>
      </UForm>
    </UCard>
  </USlideover>
</template>
