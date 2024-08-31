import { restoreSnapshot, prefixStorage, snapshot } from "unstorage";
import type { StorageValue, Storage } from "unstorage";

export const memoryStorage = useStorage("memory");
export const diskStorage = useStorage("disk");

/**
 * saveItemsToMemoryAndDisk
 * @param group string
 * @param items { [key: string]: any }
 * @returns void
 */
export const saveItemsToMemoryAndDisk = async (
  group: string,
  items: { [key: string]: any }
): Promise<void> => {
  try {
    await restoreSnapshot(memoryStorage, items, group);
    await restoreSnapshot(diskStorage, items, group);
  } catch (error) {
    throw new Error(`saveItemsToMemoryAndDisk failed : ${error}`);
  }
};

/**
 * saveItemToMemoryAndDisk
 * @param group string
 * @param item { id: string; [key: string]: any }
 * @returns void
 */

export const saveItemToMemoryAndDisk = async (
  group: string,
  item: { id: string; [key: string]: any }
): Promise<void> => {
  const memoryPrefixed = prefixStorage(memoryStorage, group);
  const diskPrefixed = prefixStorage(diskStorage, group);
  try {
    await memoryPrefixed.setItem(item.id, item);
    await diskPrefixed.setItem(item.id, item);
  } catch (error) {
    throw new Error(`saveItemToMemoryAndDisk failed : ${error}`);
  }
};

export const setToExpired = async (groups: string[]): Promise<void> => {
  groups.forEach(async (group) => {
    const memoryPrefixed = prefixStorage(memoryStorage, `${group}_meta`);
    const diskPrefixed = prefixStorage(diskStorage, `${group}_meta`);
    const now = new Date().getTime();
    await memoryPrefixed.setItem("lastUpdate", now - 7 * 24 * 60 * 60 * 1000);
    await diskPrefixed.setItem("lastUpdate", now - 7 * 24 * 60 * 60 * 1000);
  });
};

/**
 *
 * @param group string
 * @returns
 */

// export const getAllRecords = async (group: string) => {
//   /**
//    * Check if any data cached?
//    *  if cached data still valid
//    *    return cached data
//    * fetch from backend
//    */

//   const savedRecords = snapshot(diskStorage, group);
//   console.log(savedRecords);

//   /**
//    * Fetch from backend
//    */
//   const records = await usePocketbase().collection(table).getFullList();
//   /**
//    * Caching each record with id's as key
//    */
//   // formating response into snapshot format
//   const snapshotFormatRecords = Object.fromEntries(
//     records.map((record) => [record.id, record])
//   );

//   await restoreSnapshot(diskStorage, snapshotFormatRecords, table);

//   /**
//    * Return
//    */
//   return savedRecords;
// };
