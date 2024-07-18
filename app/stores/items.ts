import { skipHydrate } from "pinia";
import type { Item, ItemsTable } from "~~/schemas/item.schema";

export const useItemsStore = defineStore("items", () => {
  const { $getData, $addData } = useNuxtApp();
  const storename = "items";
  const items = ref<Item[]>();
  const itemsMap = ref<Map<string, Item>>();
  itemsMap.value = new Map();
  const onFetching = ref<boolean>(false);
  const fetch = async () => {
    onFetching.value = true;
    if (import.meta.client) {
      items.value = await $getData<Item[]>("items").then((val) => val);
      if (items.value.length === 0) {
        await $fetch("/api/items", {
          onResponse: async ({ response }) => {
            items.value = response._data;
            await $addData(storename, items.value);
          },
        });
      }
      await $getData<Item[]>("items")
        .then((val) => val)
        .then((data) => data.map((item) => itemsMap.value.set(item.id, item)));
    }
    onFetching.value = false;
  };

  if (!items.value || items.value.length === 0) fetch();

  return {
    items: skipHydrate(items),
    itemsMap: skipHydrate(itemsMap),
    onFetching: skipHydrate(onFetching),
    fetch,
  };
});
if ((import.meta as any).hot) {
  (import.meta as any).hot.accept(
    acceptHMRUpdate(useItemsStore, (import.meta as any).hot)
  );
}
