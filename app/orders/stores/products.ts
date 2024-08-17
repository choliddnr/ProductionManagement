import { defineStore, acceptHMRUpdate } from "pinia";
import type { Item } from "~/schemas/item.schema";
import { type Product } from "~/schemas/products.schema";

export const useProductsStore = defineStore("products", () => {
  const isDependenciesReady = ref<boolean>(false);
  const { itemsMap } = storeToRefs(useItemsStore());
  const { data, execute: fetch } = useFetch<
    Pick<Product, "id" | "cogc" | "cogc_params" | "price">[]
  >("/api/orders/for_sale_products");

  const products = computed<Product[]>(() => {
    if (!(itemsMap.value && data.value)) return;
    return data.value.map((p) => {
      let item: Item = itemsMap.value.get(p.id);
      return {
        ...item,
        price: p.price,
        cogc: p.cogc,
        cogc_params: p.cogc_params,
      };
    });
  });
  return { products, fetch };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProductsStore, import.meta.hot));
}
