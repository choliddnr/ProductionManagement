import { defineStore, acceptHMRUpdate, skipHydrate } from "pinia";
import type { Item } from "~/schemas/item.schema";
import { type BaseProduct, type Product } from "~/schemas/products.schema";

export const useProductsStore = defineStore("products", () => {
  const isDependenciesReady = ref<boolean>(false);
  const { itemsMap } = storeToRefs(useItemsStore());

  const baseProducts = ref<BaseProduct[]>();
  const { execute: fetch } = useFetch<BaseProduct[]>(
    "/api/orders/for_sale_products",
    {
      onResponse: ({ response }) => {
        baseProducts.value = response._data;
      },
    }
  );
  const addNewProduct = (newData: BaseProduct) =>
    baseProducts.value.push(newData);
  const products = computed<Product[]>(() => {
    if (!(itemsMap.value && baseProducts.value)) return;
    return baseProducts.value.map((p) => {
      let item: Item = itemsMap.value.get(p.id);
      return {
        ...item,
        price: p.price,
        cogc: p.cogc,
        cogc_params: p.cogc_params,
      };
    });
  });
  // watchEffect(() => {
  //   console.log("watch", baseProducts.value, itemsMap.value);
  // });

  const product = ref<Product>();
  return {
    products: skipHydrate(products),
    product,
    baseProducts,
    fetch,
    addNewProduct,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProductsStore, import.meta.hot));
}
