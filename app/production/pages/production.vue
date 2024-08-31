<script setup lang="ts">
import { LazyProductionForm } from "#components";

const { selfProduced, hotUpdate } = storeToRefs(useSelfProducedStore());
const searchProduct = ref<string>();
const searchProductForm = ref<string>();
const slideover = useSlideover();
const searchDebounch = useDebounceFn(
  () => {
    searchProduct.value = searchProductForm.value;
  },
  1500,
  { maxWait: 5000 }
);

const appConfig = useAppConfig();
</script>
<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar
        title="Self Produced Products"
        :badge="selfProduced.length || 0"
      >
        <template #right>
          <!-- ref="searchItem" -->
          <UInput
            v-model="searchProductForm"
            @keyup="searchDebounch"
            icon="i-heroicons-funnel"
            autocomplete="off"
            placeholder="Search Customer"
            class="hidden lg:block"
            @keydown.esc="$event.target.blur()"
          >
            <template #trailing>
              <UKbd value="/" />
            </template>
          </UInput>

          <UButton
            label="Tambah"
            trailing-icon="i-heroicons-plus"
            color="gray"
            @click="
              () => {
                slideover.open(LazyProductionForm, {
                  onClose: () => {
                    slideover.close();
                  },
                });
              }
            "
          />
        </template>
      </UDashboardNavbar>
      <ProductionSelfProduced /> </UDashboardPanel
  ></UDashboardPage>
</template>
