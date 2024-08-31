import type { FullSelfProduced, ItemOption } from "~/production/types";
import { setToExpired } from "../../utils/storage";
import type { SelfProduced } from "~/types/self_produced";

export default defineEventHandler(async (event) => {
  const id = getQuery(event).id as string;
  await setToExpired(["self_produced", "item_options"]);

  return await usePocketbase().collection("self_produced").delete(id);
});
