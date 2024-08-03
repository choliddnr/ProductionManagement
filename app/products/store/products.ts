import { defineStore, acceptHMRUpdate } from "pinia";

export const useProductsStore = defineStore("products", () => {
  return {};
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProductsStore, import.meta.hot));
}
