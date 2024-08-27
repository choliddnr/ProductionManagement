import { snapshot, prefixStorage } from "unstorage";
import { saveItemToMemoryAndDisk, saveItemsToMemoryAndDisk } from "./storage";
// import { getItemsInfo, itemStorage } from "./items";
import type { SelfProducedProduct } from "~/schemas/production.schema";
const group = "spp";

const productionStorage = useStorage("productionMemory");
const productionDiskStorage = useStorage("productionDisk");
const sppStorage = prefixStorage(productionStorage, group);
const sppDiskStorage = prefixStorage(productionDiskStorage, group);

// await getItemsInfo();

export const getAllSPPs = async (update: boolean = false) => {
  // /**
  //  * Check cached data
  //  */
  // if (!update) {
  //   const savedSPPs = await snapshot(productionStorage, group);
  //   if (Object.keys(savedSPPs).length > 0) return Object.values(savedSPPs);
  // }
  // const items = await getItemsInfo();
  // const ItemsMap = new Map(Object.entries(items));
  // // items.forEach((i) => )
  // console.log("refetching spp", ItemsMap);
  // /**
  //  * Get data from pb Backend
  //  */
  // const allSPPs = (await usePocketbase()
  //   .collection("self_produced")
  //   .getFullList()) as SelfProducedProduct[];
  // type FullSelfProducedProduct = (SelfProducedProduct & {
  //   item_title: string;
  // })[];
  // const res: FullSelfProducedProduct = allSPPs.map((spp) => {
  //   return {
  //     id: spp.id,
  //     item: spp.item,
  //     description: spp.description,
  //     item_title: ItemsMap.get(spp.item).title,
  //   };
  // });
  // /**
  //  * Save data to memory & disk
  //  */
  // await saveItemsToMemoryAndDisk(
  //   sppStorage,
  //   sppDiskStorage,
  //   Object.fromEntries(res.map((spp) => [spp.id, spp]))
  // );
  // // return await snapshot(productionStorage, group);
  // return res;
};

export const getSPP = async (id: string, update: boolean = false) => {
  /**
   * Check cached data
   */
  if (!update) {
    const savedSPP = await productionStorage.getItem(id);
    if (savedSPP) return savedSPP;
  }

  console.log("refetch");
  /**
   * Get data from pb Backend
   */
  const spp = await usePocketbase().collection("self_produced").getOne(id);

  /**
   * Save data to memory & disk
   */
  await saveItemToMemoryAndDisk(sppStorage, sppDiskStorage, spp);

  return spp;
};

export const getAllSavedSPPs = async () => {
  // return await productionStorage.getKeys("spp");
  return await snapshot(productionStorage, "spp");
};
