import { defineStore, acceptHMRUpdate, skipHydrate } from "pinia";
import type { Item } from "~/types/items";
import type { ItemOption } from "../types";

export const useItemOptionsStore = defineStore("item_options", () => {
  const itemOptions = ref<ItemOption[]>();
  const hotUpdtae = ref<boolean>();
  const { execute: fetch } = useFetch("/api/production/item_options", {
    query: { update: hotUpdtae.value ? "1" : "0" },
    onResponse: ({ response }) => {
      itemOptions.value = response._data;
    },
  });

  return { itemOptions: skipHydrate(itemOptions), hotUpdtae, fetch };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useItemOptionsStore, import.meta.hot));
}
