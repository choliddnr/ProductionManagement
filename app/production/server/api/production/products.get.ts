import type { SelfProducedProduct } from "~/schemas/production.schema";
import { getItemsInfo } from "../../utils/items";
import { snapshot, prefixStorage } from "unstorage";
import { productionStorage } from "../../utils/storage";

const group = "spp";

export default defineEventHandler(async (event) => {
  const update = getQuery(event).update === "1" ? true : false;
  /**
   * Check cached data
   */
  if (!update) {
    const savedSPPs = await snapshot(productionStorage, group);
    if (Object.keys(savedSPPs).length > 0) return Object.values(savedSPPs);
  }
  console.log("refetching spp");
  /**
   * Get data from pb Backend
   */
  const allSPPs = (await usePocketbase()
    .collection("self_produced")
    .getFullList({
      expand: "item",
    })) as (SelfProducedProduct & { expand: { item: { title: string } } })[];

  type FullSelfProducedProduct = (SelfProducedProduct & {
    item_title?: string;
  })[];

  const res: FullSelfProducedProduct = allSPPs.map((spp) => {
    return {
      id: spp.id,
      item: spp.item,
      description: spp.description,
      item_title: spp.expand.item.title,
    };
  });
  /**
   * Save data to memory & disk
   */
  await saveItemsToMemoryAndDisk(
    sppStorage,
    sppDiskStorage,
    Object.fromEntries(res.map((spp) => [spp.id, spp]))
  );

  // return await snapshot(productionStorage, group);
  return res;
});
