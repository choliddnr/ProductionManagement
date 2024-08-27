import { snapshot, prefixStorage, type Snapshot } from "unstorage";
import { saveItemToMemoryAndDisk, saveItemsToMemoryAndDisk } from "./storage";
import { object } from "zod";
const group = "items";
// import {
//   productionStorage,
//   productionDiskStorage,
// } from "./self_produced_products.js";
type ProductionItemInfo = { id: string; title: string };

const productionStorage = useStorage<ProductionItemInfo>("productionMemory");
const productionDiskStorage = useStorage<ProductionItemInfo>("productionDisk");
// export const productionStorage = useStorage("productionMemory");
// export const productionDiskStorage = useStorage("productionDisk");
const itemStorage = prefixStorage<ProductionItemInfo>(productionStorage, group);
const itemDiskStorage = prefixStorage<ProductionItemInfo>(
  productionDiskStorage,
  group
);
// export const sppStorage = prefixStorage(productionStorage, group);
// export const sppDiskStorage = prefixStorage(productionDiskStorage, group);

export const getItemsInfo = async (
  update: boolean = false
): Promise<Snapshot<ProductionItemInfo>> => {
  if (!update) {
    const savedItems = (await snapshot(
      productionStorage,
      group
    )) as undefined as Snapshot<ProductionItemInfo>;
    if (Object.keys(savedItems).length > 0) return savedItems;
  }
  console.log("refetching itemsInfo");
  const items = await usePocketbase().collection("items").getFullList();
  await saveItemsToMemoryAndDisk(
    itemStorage,
    itemDiskStorage,
    Object.fromEntries(items.map((i) => [i.id, { id: i.id, title: i.title }]))
  );

  return (await snapshot(
    productionStorage,
    group
  )) as undefined as Snapshot<ProductionItemInfo>;
};
