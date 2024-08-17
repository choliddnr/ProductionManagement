import { defineStore, acceptHMRUpdate } from "pinia";
import type { OrderProducts } from "~/schemas/order.schema";

export const useOrderProductsStore = defineStore("order_products", () => {
  const { order } = storeToRefs(useOrdersStore());
  const orderId = computed(() => order.value.id);
  const order_products = ref<OrderProducts[]>();
  useFetch("/api/orders/products", {
    method: "GET",
    query: { orderId },
    onResponse: ({ response }) => {
      order_products.value = response._data;
    },
  });

  return { order_products };
});

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useOrderProductsStore, import.meta.hot)
  );
}
