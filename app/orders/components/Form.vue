<script setup lang="ts">
import {
  orderSchema,
  orderStatuses,
  type Order,
  type OrderProducts,
} from "~~/schemas/order.schema";
import type { FormSubmitEvent } from "#ui/types";

const emits = defineEmits(["close"]);
type State = Order & { products: Omit<OrderProducts, "order" | "is_ready">[] };
const state = reactive<State>({
  products: [],
  customer: undefined,
  note: undefined,
  status: "order accepted",
});
const numberOfProducts = ref<number>(1);
state.products.push({
  product: undefined,
  qty: undefined,
  note: undefined,
});
const { customers } = storeToRefs(useCustomersStore());
const { items } = storeToRefs(useItemsStore());

const onSubmit = () => {
  console.log("onsubmit", state);
};
</script>
<template>
  <UDashboardSlideover
    prevent-close
    :ui="{ header: { base: 'grid grid-cols-12' } }"
  >
    <template #header>
      <h3
        class="text-base font-semibold leading-6 text-gray-900 dark:text-white col-span-10"
      >
        Tambah Pesanan
        <!-- {{ itemsMap.get(productId).title }} -->
      </h3>
      <div class="col-span-2">
        <UTooltip text="Tambah Bahan" :popper="{ arrow: true }"
          ><UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-plus-20-solid"
            class="-my-1"
          />
          <!-- @click="
                () => {
                  ingIdToEdit = undefined;
                  openForm();
                }
              " -->
        </UTooltip>

        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark-20-solid"
          class="-my-1"
          @click="emits('close')"
        />
      </div>
    </template>
    <UForm
      :schema="orderSchema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <UFormGroup label="Customer" name="customer">
        <USelectMenu
          v-model="state.customer"
          :options="customers"
          option-attribute="name"
          value-attribute="id"
          icon="i-heroicons-document-text"
          placeholder="Pilih Pelanggan"
        >
          <template #option="{ option: customer }">
            <span class="truncate">{{ customer.name }}</span>
          </template>
        </USelectMenu>
      </UFormGroup>
      <UFormGroup label="Catatan" name="note">
        <UTextarea v-model="state.note" />
      </UFormGroup>
      <UFormGroup label="Status" name="status">
        <USelectMenu v-model="state.status" :options="[...orderStatuses]" />
      </UFormGroup>
      <UFormGroup label="Produk" name="products">
        <template #hint>
          <UButton
            icon="i-heroicons-plus-16-solid"
            color="gray"
            @click="
              state.products.push({
                product: undefined,
                qty: undefined,
                note: undefined,
              })
            "
          />
        </template>
        <div
          class="grid grid-cols-12 gap-1 mb-3"
          v-for="i in state.products.length"
        >
          <USelectMenu
            v-model="state.products[i - 1].product"
            :options="[...orderStatuses]"
            class="col-span-8"
            placeholder="Pilih Produk"
          />
          <UInput
            v-model="state.products[i - 1].qty"
            type="number"
            placeholder="Jumlah"
            class="col-span-3"
          />
          <UButton
            icon="i-heroicons-minus-16-solid"
            color="red"
            @click="state.products.splice(i - 1, 1)"
          />
        </div>
        <div class="grid grid-cols-2 gap-1">
          <UButton label="Simpan" type="submit" />

          <UButton label="Batal" color="red" @click="emits('close')" />
        </div>
      </UFormGroup>

      <!-- <UButton @click="onSubmit">Submit</UButton> -->
    </UForm>
  </UDashboardSlideover>
</template>
