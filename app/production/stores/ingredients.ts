import { defineStore, acceptHMRUpdate } from "pinia";
import type { Ingredients, Item } from "~/schemas/item.schema";
import type { ItemInfo } from "../types";
import type { Ingredient } from "~/types/ingredients";

export const useIngredientsStore = defineStore("ingredients", () => {
  const selfProducedProduct = ref<string>();
  const ingredients = ref<(Ingredient & { info: ItemInfo })[]>();
  // const { itemsMap } = storeToRefs(useItemsStore());

  useFetch("/api/production/ingredients", {
    method: "GET",
    query: {
      id: selfProducedProduct,
    },
    onResponse: ({ response }) => {
      ingredients.value = response._data;
    },
    immediate: false,
  });

  return { ingredients, selfProducedProduct };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useIngredientsStore, import.meta.hot));
}
