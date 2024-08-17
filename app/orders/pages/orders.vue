<script setup lang="ts">
import { OrderForm, Order } from "#components";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const searchCustomerForm = ref<string>();
const searchCustomer = ref<string>();
const { orders, order } = storeToRefs(useOrdersStore());
const slideover = useSlideover();
const columns = [
  {
    key: "date",
    label: "Tanggal",
  },
  {
    key: "customer",
    label: "customer",
  },
  {
    key: "progress",
    label: "progress",
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
        <template #date-data="{ row }">
          <!-- <span>{{ row.date }}</span> -->
          <span>{{ format(row.date, "eeee, d MMM yyy", { locale: id }) }}</span>
        </template>
        <template #progress-data="{ row }">
          <span> {{ row.ready }}/{{ row.total }}</span>
        </template>
        <!-- <template #expand="{ row }">
          <div class="p-4">
            <pre>{{ row }}</pre>
          </div>
        </template> -->
        <!-- format(state.date, 'eeee, d MMM yyy', { locale: id }) -->
        <template #action-data="{ row }">
          <UButton
            icon="i-heroicons-arrow-long-right-solid"
            @click="
              () => {
                order = row;
                slideover.open(Order, {
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
