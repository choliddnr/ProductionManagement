<script setup lang="ts">
import { OrderForm, OrderProducts } from "#components";

const searchCustomerForm = ref<string>();
const searchCustomer = ref<string>();
const { orders, order } = storeToRefs(useOrdersStore());
const slideover = useSlideover();
const columns = [
  {
    key: "customer",
    label: "customer",
  },
  {
    key: "note",
    label: "Note",
  },
  {
    key: "status",
    label: "status",
  },
  {
    key: "action",
  },
];

const openAddForm = () => {
  slideover.open(OrderForm, {
    onClose: () => {
      slideover.close();
    },
  });
};

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
      <UTable :rows="orders" :columns="columns">
        <template #customer-data="{ row }">
          <span>{{ row.expand.customer.name }}</span>
        </template>
        <!-- <template #expand="{ row }">
          <div class="p-4">
            <pre>{{ row }}</pre>
          </div>
        </template> -->
        <template #action-data="{ row }">
          <UButton
            icon="i-heroicons-arrow-long-right-solid"
            variant="ghost"
            color="gray"
            @click="
              () => {
                order = row;
                slideover.open(OrderProducts, {
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
