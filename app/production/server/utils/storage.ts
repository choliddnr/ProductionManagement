import { restoreSnapshot, prefixStorage, snapshot } from "unstorage";
import type { StorageValue, Storage } from "unstorage";
const spp = "spp";
const items = "items";
const memoryStorage = "productionMemory";
const diskStorage = "productionDisk";

export const productionStorage = useStorage(memoryStorage);
export const productionDiskStorage = useStorage(diskStorage);
export const sppStorage = prefixStorage(productionStorage, spp);
export const sppDiskStorage = prefixStorage(productionDiskStorage, spp);
export type ProductionItemInfo = { id: string; title: string };

export const itemStorage = prefixStorage<ProductionItemInfo>(
  productionStorage,
  items
);
export const itemDiskStorage = prefixStorage<ProductionItemInfo>(
  productionDiskStorage,
  items
);
export const saveItemsToMemoryAndDisk = async (
  memoryStorage: Storage<StorageValue>,
  diskStorage: Storage,
  items: { [key: string]: any }
): Promise<void> => {
  try {
    await restoreSnapshot(memoryStorage, items);
    await restoreSnapshot(diskStorage, items);
  } catch (error) {
    throw new Error(`saveItemsToMemoryAndDisk failed : ${error}`);
  }
};

export const saveItemToMemoryAndDisk = async (
  memoryStorage: Storage<StorageValue>,
  diskStorage: Storage,
  item: { id: string; [key: string]: any }
): Promise<void> => {
  try {
    await memoryStorage.setItem(item.id, item);
    await diskStorage.setItem(item.id, item);
  } catch (error) {
    throw new Error(`saveItemToMemoryAndDisk failed : ${error}`);
  }
};
