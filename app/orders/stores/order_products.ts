import { defineStore, acceptHMRUpdate } from "pinia";
import type { OrderProducts } from "~~/schemas/order.schema";

export const useOrderProductsStore = defineStore("order_products", () => {
  const { order } = storeToRefs(useOrdersStore());
  const { data: order_products } = useFetch<OrderProducts[]>(
    "/api/orders/products",
    {
      method: "GET",
      query: { orderId: order.value.id },
    }
  );

  return { order_products };
});

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useOrderProductsStore, import.meta.hot)
  );
}
