// export default defineEventHandler(async (event) => {
//   const items = await usePocketbase().collection("items").getFullList();
//   const itemOption = items.map((i) => {
//     return {
//       id: i.id,
//       title: i.title as string,
//     };
//   });
//   return itemOption as ItemOption[];
// });
import { snapshot, prefixStorage } from "unstorage";
import type { SelfProduced } from "~/types/self_produced";
import type { FullSelfProduced, ItemInfo } from "~/production/types";
import { memoryStorage } from "../../../utils/storage";
import type { Item } from "~/types/items";
import type { Cache } from "~/types";

const group = "item_options";
const metaStorage = prefixStorage(memoryStorage, `${group}_meta`);
export default defineEventHandler(async (event) => {
  const update = getQuery(event).update === "1" ? true : false;
  const lastUpdate = (await metaStorage.getItem("lastUpdate")) as number;
  if (lastUpdate) {
    let maxAge = (await metaStorage.getItem("maxAge")) as number;
    if (!maxAge) {
      const cache = (await usePocketbase()
        .collection("cache")
        .getFirstListItem(`key="${group}"`)) as Cache;
      await metaStorage.setItem("maxAge", cache.maxAge);
      maxAge = cache.maxAge;
    }
    const current = new Date().getTime();
    const isValid = current - lastUpdate < maxAge;

    /**
     * Check cached data
     */
    if (!update && isValid) {
      const savedSPPs = await snapshot(memoryStorage, group);
      if (Object.keys(savedSPPs).length > 0) return Object.values(savedSPPs);
    }
  }
  console.log("refetch item_info");

  /**
   * Get data from pb Backend
   */
  const items = (await usePocketbase()
    .collection("items")
    .getFullList()) as Item[];

  // const self_produced = await $fetch<FullSelfProduced[]>(
  //   "/api/production/self_produced"
  // );
  // const self_produced_item_list = self_produced.map((sp) => sp.item);

  // const filtered_items = items.filter(
  //   (i) => !self_produced_item_list.includes(i.id)
  // );
  const res: ItemInfo[] = items.map((i) => {
    return {
      id: i.id,
      title: i.title as string,
      uom: i.uom,
    };
  });

  /**
   * Save data to memory & disk
   */
  await saveItemsToMemoryAndDisk(
    group,
    Object.fromEntries(res.map((spp) => [spp.id, spp]))
  );
  await metaStorage.setItem("lastUpdate", new Date().getTime());
  // return await snapshot(productionStorage, group);
  return res;
});
