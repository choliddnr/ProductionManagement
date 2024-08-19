<script setup lang="ts">
import { Product, ProductForm } from "#components";
import { format } from "date-fns";
import { id } from "date-fns/locale";
const { itemsMap } = storeToRefs(useItemsStore());
const { products, product } = storeToRefs(useProductsStore());
const searchProduct = ref<string>();
const searchProductForm = ref<string>();
const slideover = useSlideover();
const columns = [
  {
    key: "title",
    label: "TItle",
  },
  {
    key: "cogc",
    label: "COGC",
  },
  {
    key: "price",
    label: "Price",
  },
  {
    key: "action",
  },
];

const openAddForm = () => {
  slideover.open(ProductForm, {
    onClose: () => {
      slideover.close();
    },
  });
};

const searchDebounch = useDebounceFn(
  () => {
    searchProduct.value = searchProductForm.value;
  },
  1500,
  { maxWait: 5000 }
);
</script>
<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Orders" :badge="products ? products.length : 0">
        <template #right>
          <!-- ref="searchItem" -->
          <UInput
            v-model="searchProductForm"
            @keyup="searchDebounch"
            icon="i-heroicons-funnel"
            autocomplete="off"
            placeholder="Cari Produk"
            class="hidden lg:block"
            @keydown.esc="$event.target.blur()"
          >
            <template #trailing>
              <UKbd value="/" />
            </template>
          </UInput>

          <UButton
            label="Product Baru"
            trailing-icon="i-heroicons-plus"
            color="gray"
            @click="openAddForm"
          />
        </template>
      </UDashboardNavbar>
      <UTable :rows="products" :columns="columns">
        <template #title-data="{ row }">
          <span>{{ row.title }}</span>
        </template>
        <template #action-data="{ row }">
          <UButton
            icon="i-heroicons-arrow-long-right-solid"
            @click="
              () => {
                product = row;
                slideover.open(Product, {
                  onClose: () => {
                    slideover.close();
                  },
                });
              }
            "
          />
        </template>
      </UTable>
    </UDashboardPanel>
  </UDashboardPage>
</template>
