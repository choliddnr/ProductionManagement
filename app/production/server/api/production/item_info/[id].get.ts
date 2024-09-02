import type { ItemInfo } from "~/production/types";
import type { Item } from "~/types/items";

const group = "item_info";
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  /**
   * Get data from pb Backend
   */
  const item = (await usePocketbase().collection("items").getOne(id)) as Item;

  const res: ItemInfo = {
    id: item.id,
    title: item.title as string,
    uom: item.uom,
  };

  /**
   * Save data to memory & disk
   */
  return res;
});
