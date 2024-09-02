import { snapshot, prefixStorage } from "unstorage";
import type { SelfProduced } from "~/types/self_produced";
import type { FullSelfProduced, ItemOption } from "~/production/types";
import { memoryStorage } from "../../../utils/storage";

const group = "self_produced";
const metaStorage = prefixStorage(memoryStorage, `${group}_meta`);
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const data = await usePocketbase()
    .collection("self_produced")
    .update(id, body);
  const item: ItemOption = await memoryStorage.getItem(
    `item_options:${data.item}`
  );
  const sp: FullSelfProduced = await prefixStorage(
    memoryStorage,
    "self_produced"
  ).getItem(data.id);
  const res = {
    id: data.id,
    item: data.item,
    description: data.description,
    item_title: sp.item_title,
  };
  await prefixStorage(memoryStorage, "self_produced").setItem(data.id, res);
  console.log(res);
  return res;
});
