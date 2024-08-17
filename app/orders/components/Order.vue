<script setup lang="ts">
import { LazyModalConfirm } from "#components";
import { orderStatuses } from "~/schemas/order.schema";

const emits = defineEmits<{
  close: [];
}>();

const toast = useToast();
const modal = useModal();

const { order_products } = storeToRefs(useOrderProductsStore());
const { order, orders } = storeToRefs(useOrdersStore());
const { itemsMap } = storeToRefs(useItemsStore());
const status = ref<string>(order.value.status);

const updateReadiness = async (id: string, readiness: boolean) => {
  modal.open(LazyModalConfirm, {
    message: "Apakah anda yakin?",
    label: {
      continue: "Iya, proses sekarang",
      cancel: "Batal",
    },
    onContinue: async () => {
      await $fetch("/api/orders/product_readiness", {
        method: "PATCH",
        query: { id: id },
        body: {
          is_ready: readiness,
        },
        onResponse: () => {
          order_products.value.map((p) => {
            if (p.id === id) p.is_ready = readiness;
            return p;
          });
          orders.value.map((o) => {
            if (o.id !== order.value.id) return o;
            if (readiness) {
              o.ready += 1;
            } else {
              o.ready -= 1;
            }
            return o;
          });
          toast.add({
            description: "Berhasil memperbarui kesiapan produk pesanan",
          });

          modal.close();
        },
      });
    },
  });
};

const updateStatus = async () => {
  await $fetch("/api/orders", {
    method: "PATCH",
    query: { id: order.value.id },
    body: {
      status: status.value,
    },
    onResponse: ({ response }) => {
      toast.add({
        description: "status berhasil diperbarui",
      });
      orders.value.map((o) => {
        if (o.id === order.value.id) o.status = response._data.status;
        return o;
      });
      emits("close");
    },
    onResponseError: ({ error }) => {
      toast.add({
        color: "red",
        description: error.message,
      });
      modal.close();
    },
  });
  console.log(status.value);
};
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
      <UFormGroup label="Update status">
        <div class="flex flex-row gap-2">
          <USelectMenu
            :options="[...orderStatuses]"
            v-model="status"
            class="grow"
          />
          <UButton
            icon="i-heroicons-paper-airplane-16-solid"
            @click="updateStatus"
            class="content-end"
          />
        </div>
      </UFormGroup>
      <UDivider class="mt-5" />
      <div v-for="product in order_products" class="mt-5">
        <UDashboardSection
          :description="product.note"
          :title="itemsMap.get(product.product).title"
        >
          <template #links>
            <UBadge :label="product.quantity" variant="outline" color="white" />
            <UButton
              :icon="
                product.is_ready
                  ? 'i-heroicons-check-16-solid'
                  : 'i-heroicons-arrow-path-rounded-square-16-solid'
              "
              variant="solid"
              :color="product.is_ready ? 'green' : 'orange'"
              size="2xs"
              @click="
                () => {
                  updateReadiness(product.id, !product.is_ready);
                }
              "
            />
            <!-- :label="product.is_ready ? 'Ready' : 'Mark as ready'" -->
          </template>
        </UDashboardSection>
      </div>
      <UDivider />
    </UCard>
  </USlideover>
</template>
