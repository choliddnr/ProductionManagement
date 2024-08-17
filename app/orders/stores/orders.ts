import { defineStore, acceptHMRUpdate } from "pinia";
import type { Order } from "~/schemas/order.schema";

export const useOrdersStore = defineStore("orders", () => {
  const order = ref<Order>();
  const orders = ref<Order[]>();
  const { execute: fetch } = useFetch("/api/orders", {
    method: "GET",
    onResponse: ({ response }) => {
      if (import.meta.server) console.log("pinia fetch orders on server");
      if (import.meta.client) console.log("pinia fetch orders on client");
      orders.value = response._data;
    },
  });
  return { orders, order, fetch };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOrdersStore, import.meta.hot));
}
