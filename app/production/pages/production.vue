<script setup lang="ts">
const searchDebounch = useDebounceFn(
  () => {
    searchCustomer.value = searchCustomerForm.value;
  },
  1500,
  { maxWait: 5000 }
);
</script>
<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Orders" :badge="orders ? orders.length : 0">
        <template #right>
          <!-- ref="searchItem" -->
          <UInput
            v-model="searchCustomerForm"
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
            label="New Order"
            trailing-icon="i-heroicons-plus"
            color="gray"
            @click="openAddForm"
          />
        </template>
      </UDashboardNavbar>
      <ProductionSelfProducedProducts /> </UDashboardPanel
  ></UDashboardPage>
</template>
