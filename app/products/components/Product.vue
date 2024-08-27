<script setup lang="ts">
import { LazyModalConfirm } from "#components";
import { orderStatuses } from "~/schemas/order.schema";

const emits = defineEmits<{
  close: [];
}>();

const toast = useToast();
const modal = useModal();
const { itemsMap } = storeToRefs(useItemsStore());
const { product } = storeToRefs(useProductsStore());
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
            {{ product.title }}
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
      <!-- <UFormGroup label="Update status">
        <div class="flex flex-row gap-2">
          <USelectMenu
            :options="[...orderStatuses]"
            v-model="status"
            class="grow"
          />
          <UButton
            icon="i-heroicons-paper-airplane-16-solid"
            class="content-end"
          />
        </div>
      </UFormGroup> -->
      <UDivider class="mt-5" />
      <UDivider />
    </UCard>
  </USlideover>
</template>
