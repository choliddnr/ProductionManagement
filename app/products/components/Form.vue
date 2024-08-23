<script setup lang="ts">
import { ProductsSchema, type Product } from "~/schemas/products.schema";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import ModalConfirm from "~/base/components/ModalConfirm.vue";
import type { Item } from "~/schemas/item.schema";

const emits = defineEmits(["close"]);
const modal = useModal();
const toast = useToast();

const { items } = storeToRefs(useItemsStore());
const { products } = storeToRefs(useProductsStore());
const { addNewProduct } = useProductsStore();

type State = Pick<Product, "id" | "cogc" | "price" | "cogc_params">;
const state = reactive<State>({
  id: undefined,
  cogc: undefined,
  price: undefined,
  cogc_params: [],
});

state.cogc_params.push({
  attribute: undefined,
  value: undefined,
});
const itemsforSale = computed<Item[]>(() => {
  return items.value.filter(
    (p) => !products.value.map((p) => p.id).includes(p.id)
  );
});

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
      await $fetch<Product>("/api/products", {
        method: "POST",
        body: state,
        onResponse: ({ response }) => {
          addNewProduct(response._data);
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
        Tambah Product
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
      :schema="ProductsSchema"
      @submit="onSubmit"
    >
      <UFormGroup label="Item" name="id">
        <USelectMenu
          v-model="state.id"
          :options="itemsforSale"
          option-attribute="title"
          value-attribute="id"
          icon="i-heroicons-document-text"
          placeholder="Pilih Item"
        >
          <template #option="{ option: i }">
            <span class="truncate">{{ i.title }}</span>
          </template>
        </USelectMenu>
      </UFormGroup>
      <UFormGroup label="Harga" name="price">
        <UInput type="number" v-model="state.price" />
      </UFormGroup>
      <UFormGroup label="COGC" name="cogc">
        <UInput type="number" v-model="state.cogc" />
      </UFormGroup>
      <UFormGroup label="CoGC Parameter" name="cogc_params">
        <template #hint>
          <UButton
            icon="i-heroicons-plus-16-solid"
            color="gray"
            @click="
              state.cogc_params.push({
                attribute: undefined,
                value: undefined,
              })
            "
          />
        </template>
      </UFormGroup>
      <div
        class="grid grid-cols-12 gap-1 mb-3 mt-1"
        v-for="i in state.cogc_params.length"
      >
        <UFormGroup
          :name="'cogc_params.' + (i - 1).toString() + '.attribute'"
          class="col-span-6"
        >
          <UInput v-model="state.cogc_params[i - 1].attribute" />
        </UFormGroup>
        <UFormGroup
          :name="'cogc_params.' + (i - 1).toString() + '.value'"
          class="col-span-5"
        >
          <UInput v-model="state.cogc_params[i - 1].value" />
        </UFormGroup>

        <UFormGroup>
          <UButton
            icon="i-heroicons-minus-16-solid"
            color="red"
            @click="state.cogc_params.splice(i - 1, 1)"
            :disabled="state.cogc_params.length === 1"
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
