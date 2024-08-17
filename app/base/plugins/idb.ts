import type { Category } from "~~/schemas/types";
import type { Item } from "../../schemas/item.schema";
import { reject } from "lodash";

type StoreName = "items" | "item_categories";
type Store = {
  [Property in StoreName]: {
    objectProperty: { keyPath?: string; autoIncrement?: boolean };
    indexes?: { properties: string[]; unique: boolean }[];
  };
};
type Data = {
  id: string;
  [key: string]: any;
};

export default defineNuxtPlugin({
  name: "idb",
  async setup(nuxtApp) {
    if (import.meta.server) return {};
    const DB_NAME = "inventory";
    const DB_VERSION = 1;
    const stores: Store = {
      items: {
        objectProperty: {
          keyPath: "id",
        },
        indexes: [
          {
            properties: ["title"],
            unique: false,
          },
        ],
      },
      item_categories: {
        objectProperty: {
          keyPath: "id",
        },
        indexes: [
          {
            properties: ["title"],
            unique: false,
          },
        ],
      },
    };

    let idb: IDBDatabase;

    const openIndexedDB = async (
      dbname: string,
      dbversion: number
    ): Promise<IDBDatabase> => {
      return new Promise((resolve, reject) => {
        let req = window.indexedDB.open(dbname, dbversion);
        req.onerror = (e) => {
          console.error("Error opening db", e);
          reject("Error");
        };

        req.onupgradeneeded = (e) => {
          let db = req.result;
          for (const [key, value] of Object.entries(stores)) {
            let ObjStore = db.createObjectStore(key, value.objectProperty);
            if (value.indexes) {
              value.indexes.forEach((index) => {
                ObjStore.createIndex(
                  key + "_" + index.properties.join("_"),
                  index.properties,
                  { unique: index.unique }
                );
              });
            }
          }
        };
        req.onsuccess = (e) => {
          resolve(req.result);
        };
      });
    };

    const getObjStore = async (
      dbname: string,
      dbversion: number,
      storename: string,
      mode?: "readonly" | "readwrite"
    ): Promise<IDBObjectStore> => {
      // console.log("getStore", idb);
      idb = idb ? idb : await openIndexedDB(dbname, dbversion);
      let tx = idb.transaction(storename, mode);
      return tx.objectStore(storename);
    };

    const _addData = async (storename: StoreName, data: Data | Data[]) => {
      const store = await getObjStore(
        DB_NAME,
        DB_VERSION,
        storename,
        "readwrite"
      );

      if (Array.isArray(data)) {
        data.forEach((i) => {
          store.add(isProxy(i) ? toRaw(i) : i);
        });
      } else {
        store.add(isProxy(data) ? toRaw(data) : data);
      }
      console.log("idb add");
    };

    const _editData = async (storename: StoreName, data: Data) => {
      const store = await getObjStore(
        DB_NAME,
        DB_VERSION,
        storename,
        "readwrite"
      );
      store.put(isProxy(data) ? toRaw(data) : data);
      console.log("idb edit", data);
    };

    const _getData = <T>(storename: StoreName, id?: string): Promise<T> => {
      return new Promise(async (resolve, reject) => {
        const store = await getObjStore(
          DB_NAME,
          DB_VERSION,
          storename,
          "readonly"
        );
        let req = id ? store.get(id) : store.getAll();
        req.onsuccess = async (e) => {
          // console.log("item length", req.result.length);
          resolve(req.result);
        };
        req.onerror = (e) => {
          console.error("Fetching item failed!");
          reject("Error");
        };
      });
    };

    const _deleteData = <T>(storename: StoreName, id: string): Promise<T> => {
      return new Promise(async (resolve, reject) => {
        const store = await getObjStore(
          DB_NAME,
          DB_VERSION,
          storename,
          "readwrite"
        );
        let req = store.delete(id);
        req.onsuccess = async (e) => {
          // console.log("item length", req.result.length);
          resolve(req.result);
        };
        req.onerror = (e) => {
          console.error("Fetching item failed!");
          reject("Error");
        };
      });
    };

    const _clearStore = async (storename: StoreName) => {
      const store = await getObjStore(
        DB_NAME,
        DB_VERSION,
        storename,
        "readwrite"
      );
      try {
        store.clear();
      } catch (error) {
        throw createError(error);
      }
    };

    const _getItemsByCategory = async (
      categories: string[]
    ): Promise<Item[]> => {
      return new Promise(async (resolve, reject) => {
        const store = await getObjStore(
          DB_NAME,
          DB_VERSION,
          "items",
          "readonly"
        );
        if (categories.length < 1)
          reject("Error: at least one category needed!");
        const isMultiCategory = categories.length > 1;
        const categoryIndex = store.index("item_category");
        if (!isMultiCategory) {
          const req = categoryIndex.getAll(categories);
          req.onsuccess = (e) => {
            resolve(req.result);
          };
          req.onerror = (e) => {
            console.error("Fetching item failed!");
            reject("Error");
          };
        } else {
          const openCursor = categoryIndex.openCursor();
          let itemsData: any = [];
          openCursor.onsuccess = (e) => {
            const cursor = openCursor.result;
            if (cursor) {
              if (categories.includes((cursor as any).key[0]))
                itemsData.push(cursor.value);

              cursor.continue();
            } else {
              resolve(itemsData);
            }
          };
          openCursor.onerror = (e) => {
            console.error("Error: OpenCursor on getItemsByCategory failed!", e);
            reject("Error");
          };
        }
      });
    };
    return {
      provide: {
        addData: _addData,
        getData: _getData,
        editData: _editData,
        deleteData: _deleteData,
        clearStore: _clearStore,
        // getDatasByCategory: _getDatasByCategory,
      },
    };
  },
});
