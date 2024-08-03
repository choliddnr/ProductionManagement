<script setup lang="ts">
const emits = defineEmits<{
  close: [];
}>();
const { order_products } = storeToRefs(useOrderProductsStore());
const { itemsMap } = storeToRefs(useItemsStore());
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
            Daftar Pesanan
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
      <div v-for="product in order_products">
        <UDashboardSection
          :description="product.note"
          :title="itemsMap.get(product.product).title"
        >
          <template #links>
            <UBadge :label="product.qty" variant="outline" />
            <UButton
              :icon="
                product.is_ready
                  ? 'i-heroicons-check-circle'
                  : 'i-heroicons-arrow-path-rounded-square-16-solid'
              "
              :label="product.is_ready ? 'Ready' : 'not ready'"
              variant="solid"
              :color="product.is_ready ? 'green' : 'orange'"
              size="2xs"
            />
          </template>
        </UDashboardSection>
        <UDivider />
      </div>
    </UCard>
  </USlideover>
</template>
