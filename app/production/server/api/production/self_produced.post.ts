import type { FullSelfProduced, ItemOption } from "~/production/types";
import { setToExpired } from "../../utils/storage";
import type { SelfProduced } from "~/types/self_produced";

export default defineEventHandler(async (event): Promise<FullSelfProduced> => {
  const body = await readBody(event);
  const data: SelfProduced = await usePocketbase()
    .collection("self_produced")
    .create(body);
  await setToExpired(["self_produced", "item_options"]);
  const item: ItemOption = await memoryStorage.getItem(
    `item_options:${data.item}`
  );

  return {
    id: data.id,
    item: data.item,
    description: data.description,
    item_title: item.title,
  };
});
