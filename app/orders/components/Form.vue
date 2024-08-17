<script setup lang="ts">
import {
  orderSchema,
  orderStatuses,
  today,
  type Order,
  type OrderProducts,
} from "~/schemas/order.schema";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { Product } from "~/schemas/products.schema";
import ModalConfirm from "~/base/components/ModalConfirm.vue";

const emits = defineEmits(["close"]);
const modal = useModal();
const toast = useToast();

type State = Omit<Order, "ready" | "total"> & {
  products: Omit<OrderProducts, "order" | "is_ready" | "id">[];
};
const state = reactive<State>({
  products: [],
  customer: undefined,
  note: undefined,
  status: "order accepted",
  date: new Date(),
});

state.products.push({
  product: undefined,
  quantity: 1,
  note: undefined,
});
const forSaleProducts = computed<Product[]>(() => {
  console.log("log", state.products.length, products.value);
  if (!products.value) return [];
  if (state.products.length === 0) return products.value;
  return products.value.filter(
    (p) => !state.products.map((i) => i.product).includes(p.id)
  );
});
const { customers } = storeToRefs(useCustomersStore());
const { products } = storeToRefs(useProductsStore());
const { orders } = storeToRefs(useOrdersStore());

const onSubmit = async () => {
  modal.open(ModalConfirm, {
    label: {
      cancel: "Tinjau kembali",
      continue: "Lanjut",
    },
    message: "Apakah semua data sudah benar?",
    onCancel: () => {
      modal.close();
    },
    onContinue: async () => {
      await $fetch<Order>("/api/orders", {
        method: "POST",
        body: state,
        onResponse: ({ response }) => {
          orders.value.push(response._data);
          toast.add({
            description: "Pesanan berhasil dibuat",
          });
          modal.close();
          emits("close");
        },
        onResponseError: ({ error }) => {
          toast.add({
            color: "red",
            title: error.name,
            description: error.message,
          });
        },
      });
    },
  });
};
</script>
<template>
  <UDashboardSlideover
    prevent-close
    :ui="{ header: { base: 'grid grid-cols-12' } }"
  >
    <template #header>
      <h3
        class="text-base font-semibold leading-6 text-gray-900 dark:text-white col-span-11"
      >
        Tambah Pesanan
        <!-- {{ itemsMap.get(productId).title }} -->
      </h3>
      <div class="">
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
      :state="state"
      class="space-y-4"
      :schema="orderSchema"
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
      <UFormGroup label="Tanggal" name="date">
        <!-- <USelectMenu v-model="state.status" :options="[...orderStatuses]" /> -->
        <UPopover :popper="{ placement: 'bottom-start' }">
          <UButton
            icon="i-heroicons-calendar-days-20-solid"
            :label="format(state.date, 'eeee, d MMM yyy', { locale: id })"
          />

          <template #panel="{ close }">
            <DatePicker v-model="state.date" is-required @close="close" />
          </template>
        </UPopover>
      </UFormGroup>
      <UFormGroup label="Penanan" name="products">
        <template #hint>
          <UButton
            icon="i-heroicons-plus-16-solid"
            color="gray"
            @click="
              state.products.push({
                product: undefined,
                quantity: 1,
                note: '',
              })
            "
          />
        </template>
      </UFormGroup>
      <div
        class="grid grid-cols-12 gap-1 mb-3 mt-1"
        v-for="i in state.products.length"
      >
        <UFormGroup
          :name="'products.' + (i - 1).toString() + '.product'"
          class="col-span-7"
        >
          <USelectMenu
            v-model="state.products[i - 1].product"
            :options="forSaleProducts"
            option-attribute="title"
            value-attribute="id"
            :placeholder="
              state.products[i - 1].product
                ? products.find((e) => e.id === state.products[i - 1].product)
                    .title
                : 'Pilih Produk'
            "
          />
        </UFormGroup>
        <UFormGroup
          :name="'products.' + (i - 1).toString() + '.quantity'"
          class="col-span-3"
        >
          <UInput
            v-model="state.products[i - 1].quantity"
            type="number"
            placeholder="Jumlah"
          />
        </UFormGroup>
        <UFormGroup>
          <UPopover>
            <UChip
              :color="state.products[i - 1].note !== '' ? 'green' : 'gray'"
              position="top-left"
              inset
            >
              <!-- <UButton icon="i-heroicons-inbox" color="gray" /> -->
              <UButton
                color="white"
                icon="i-heroicons-document-text-16-solid"
              />
            </UChip>

            <template #panel>
              <!-- <div class="p-4"> -->
              <UTextarea
                class="w-48"
                v-model="state.products[i - 1].note"
                placeholder="Catatan jika dibutuhkan"
              />
              <!-- </div> -->
            </template>
          </UPopover>
          <!-- <UButton
            icon="i-heroicons-document-text-16-solid"
            @click="state.products.splice(i - 1, 1)"
          />-->
        </UFormGroup>
        <UFormGroup>
          <UButton
            icon="i-heroicons-minus-16-solid"
            color="red"
            @click="state.products.splice(i - 1, 1)"
            :disabled="state.products.length === 1"
          />
        </UFormGroup>
      </div>
      <div class="grid grid-cols-2 gap-1">
        <UButton label="Simpan" type="submit" />
        <UButton label="Batal" color="red" @click="emits('close')" />
      </div>
    </UForm>
  </UDashboardSlideover>
</template>
