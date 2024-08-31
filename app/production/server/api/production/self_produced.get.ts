import { snapshot, prefixStorage } from "unstorage";
import type { SelfProduced } from "~/types/self_produced";
import type { FullSelfProduced } from "~/production/types";
import { memoryStorage } from "../../utils/storage";

const group = "self_produced";
const metaStorage = prefixStorage(memoryStorage, `${group}_meta`);
export default defineEventHandler(async (event) => {
  const update = getQuery(event).update === "1" ? true : false;
  const maxAge = (await metaStorage.getItem("maxAge")) as number;
  const lastUpdate = (await metaStorage.getItem("lastUpdate")) as number;
  const current = new Date().getTime();
  const isValid = current - lastUpdate < maxAge;

  /**
   * Check cached data
   */
  if (!update && isValid) {
    const savedSPPs = await snapshot(memoryStorage, group);
    if (Object.keys(savedSPPs).length > 0) return Object.values(savedSPPs);
  }
  console.log("refetch self_produced");

  /**
   * Get data from pb Backend
   */
  const allSPPs = (await usePocketbase()
    .collection("self_produced")
    .getFullList({
      expand: "item",
    })) as (SelfProduced & { expand: { item: { title: string } } })[];

  const res: FullSelfProduced[] = allSPPs.map((spp) => {
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
    group,
    Object.fromEntries(res.map((spp) => [spp.id, spp]))
  );
  await metaStorage.setItem("lastUpdate", new Date().getTime());
  // return await snapshot(productionStorage, group);
  return res;
});
