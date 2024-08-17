import { defineStore, acceptHMRUpdate } from "pinia";
import type { Ingredients, Item } from "~/schemas/item.schema";

export const useIngredientsStore = defineStore("ingredients", () => {
  const selfProducedItem = ref<string>();
  const ingredients = ref<Partial<(Ingredients & { info: Item })[]>>();
  const { itemsMap } = storeToRefs(useItemsStore());
  const fetch = async () => {
    await $fetch<Ingredients[]>("/api/items/ingredients", {
      method: "get",
      params: {
        id: selfProducedItem.value,
      },
      onResponse: ({ response }) => {
        let x: (Ingredients & { info: Item; id: string })[] = [];
        response._data.forEach((ing: Ingredients) => {
          x.push({
            id: ing.id,
            ingredient: ing.ingredient,
            quantity: ing.quantity,
            substitutes: ing.substitutes,
            info: itemsMap.value.get(ing.ingredient),
          });
        });
        ingredients.value = x;
      },
    });
  };

  return { ingredients, selfProducedItem, fetch };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useIngredientsStore, import.meta.hot));
}
