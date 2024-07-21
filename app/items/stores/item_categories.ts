import { skipHydrate } from "pinia";
import type { Category } from "~~/schemas/types";

export const useItemCategoriesStore = defineStore("item_categories", () => {
  const storename = "item_categories";
  const { $getData, $addData } = useNuxtApp();
  const item_categories = ref<Category[]>();
  // const item_categoriesMap = reactive(new Map<string, Category>());
  const onFetching = ref<boolean>(false);
  const fetch = async () => {
    onFetching.value = true;
    console.log("ic store fetching");
    if (import.meta.client) {
      item_categories.value = await $getData<Category[]>(
        "item_categories"
      ).then((val) => val);
      if (item_categories.value.length === 0) {
        await $fetch("/api/item_categories", {
          onResponse: async ({ response }) => {
            item_categories.value = response._data;
            await $addData(storename, item_categories.value);
          },
        });
      }
    }
    onFetching.value = false;
  };
  if (!item_categories.value || item_categories.value.length === 0) fetch();

  return {
    item_categories: skipHydrate(item_categories),
    onFetching: skipHydrate(onFetching),
    fetch,
  };
});
if ((import.meta as any).hot) {
  (import.meta as any).hot.accept(
    acceptHMRUpdate(useItemCategoriesStore, (import.meta as any).hot)
  );
}
