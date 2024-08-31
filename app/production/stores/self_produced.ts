import { defineStore, acceptHMRUpdate } from "pinia";
import type { FullSelfProduced } from "../types";
import type { Sort } from "~/types";

export const useSelfProducedStore = defineStore("self_produced", () => {
  const selfProduced = ref<FullSelfProduced[]>();
  const hotUpdate = ref<boolean>(false);

  const sort = ref<Sort>();
  const { execute } = useFetch<FullSelfProduced>(
    "/api/production/self_produced",
    {
      query: {
        update: hotUpdate ? "1" : "0",
      },
      onResponse: ({ response }) => {
        selfProduced.value = response._data;
      },
    }
  );
  return { selfProduced, hotUpdate, sort, fetch };
});

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useSelfProducedStore, import.meta.hot)
  );
}
