import { defineStore, acceptHMRUpdate, skipHydrate } from "pinia";
import type { ItemsTable } from "~~/schemas/item.schema";
import type { Category } from "~~/schemas/types";
import _ from "lodash";

export const useItemsTableStore = defineStore("items_table", () => {
  const { items } = storeToRefs(useItemsStore());
  const { item_categories } = storeToRefs(useItemCategoriesStore());
  const isDependenciesReady = ref<boolean>(false);
  const onWorkingItem = ref<ItemsTable>();

  /**
   * @masterItemsTable
   * let haveUndefined used to detect an item category has been removed but failed to remove related items
   */
  const masterItemsTable = computed((): ItemsTable[] => {
    let haveUndefined = false;
    if (!isDependenciesReady.value) return;
    let categories = new Map();
    item_categories.value.map((cat) => categories.set(cat.id, cat));

    let data = items.value.map((item) => {
      let category = categories.get(item.category);
      if (!category) {
        /**
         * @Future
         * Add mecanism to delete detected item without valid category on idb and backend database
         */
        $fetch("/api/unwanted_behavior_logs", {
          method: "POST",
          body: {
            path: "/app/stores/item_table",
            description:
              "an item missing valid item category. it is caused by system failed to remove related item when an an item category removed.",
          },
        });
        console.log("category");

        haveUndefined = true;
        return;
      }
      let dataTable: ItemsTable = item;
      dataTable.category_info = {
        title: category.title,
        color: category.color,
      };
      return dataTable;
    });
    if (haveUndefined) {
      haveUndefined = false;
      return data.filter((d) => d != undefined);
    }
    return data;
  });

  const selectedItem = ref<ItemsTable[]>([]);
  const selectedCategories = ref<string[]>([]);
  const sort = ref<{ column: string; direction: "asc" | "desc" }>({
    column: null,
    direction: "asc",
  });
  const search = ref<string>("");
  const itemsTable = computed(() => {
    if (!masterItemsTable.value) return;
    let data: ItemsTable[];
    if (
      selectedCategories.value.length === 0 &&
      !sort.value &&
      search.value === ""
    ) {
      data = masterItemsTable.value;
    } else if (
      selectedCategories.value.length === item_categories.value.length ||
      selectedCategories.value.length === 0
    ) {
      data = masterItemsTable.value;
    } else {
      data = masterItemsTable.value.filter((data) =>
        selectedCategories.value.includes(data.category)
      );
    }
    if (sort.value.column) {
      if (sort.value.direction === "asc") {
        data.sort((a, b) =>
          a.category_info.title.localeCompare(b.category_info.title)
        );
      } else {
        data.sort((a, b) =>
          b.category_info.title.localeCompare(a.category_info.title)
        );
      }
    }
    if (search.value && search.value !== "") {
      console.time("searching");

      data = _.filter(data, (item) => {
        return item.title.toLowerCase().includes(search.value.toLowerCase());
      });
      console.timeEnd("searching");
    }
    return data;
  });
  watchEffect(() => {
    // console.log("watch dependency", items.value, item_categories.value);

    isDependenciesReady.value =
      items.value && item_categories.value ? true : false;
  });
  return {
    onWorkingItem,
    isDependenciesReady,
    itemsTable: skipHydrate(itemsTable),
    selectedCategories: skipHydrate(selectedCategories),
    sort: skipHydrate(sort),
    search: skipHydrate(search),
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useItemsTableStore, import.meta.hot));
}
