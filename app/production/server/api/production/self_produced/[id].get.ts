import { snapshot, prefixStorage } from "unstorage";
import type { SelfProduced } from "~/types/self_produced";
import type { FullSelfProduced, ItemOption } from "~/production/types";
import { memoryStorage } from "../../../utils/storage";

const group = "self_produced";
const metaStorage = prefixStorage(memoryStorage, `${group}_meta`);
export default defineEventHandler(async (event) => {
  const update = getQuery(event).update === "1" ? true : false;
  const maxAge = (await metaStorage.getItem("maxAge")) as number;
  const lastUpdate = (await metaStorage.getItem("lastUpdate")) as number;
  const current = new Date().getTime();
  const isValid = current - lastUpdate < maxAge;

  const id = getRouterParam(event, "id");
  /**
   * Check cached data
   */
  if (!update && isValid) {
    const memoryPrefixed = prefixStorage(memoryStorage, group);
    const savedSPP = await memoryPrefixed.getItem(id);
    if (savedSPP) return savedSPP;
  }
  console.log("refetch self_produced/:id");

  /**
   * Get data from pb Backend
   */
  const spp = (await usePocketbase()
    .collection("self_produced")
    .getOne(id)) as SelfProduced;

  const item: ItemOption = await memoryStorage.getItem(
    `item_options:${spp.item}`
  );
  console.log("item", item);
  let item_title;
  if (item) {
    item_title = item.title;
  } else {
    const item_from_item_options = await $fetch<ItemOption>(
      "/api/production/item_options/" + spp.item
    );
    item_title = item_from_item_options.title;
  }
  const res: FullSelfProduced = {
    id: spp.id,
    item: spp.item,
    description: spp.description,
    item_title: item_title,
  };

  /**
   * Save data to memory & disk
   */
  await saveItemsToMemoryAndDisk(
    group,
    Object.fromEntries([res].map((spp) => [spp.id, spp]))
  );
  await metaStorage.setItem("lastUpdate", new Date().getTime());

  return res;
});
